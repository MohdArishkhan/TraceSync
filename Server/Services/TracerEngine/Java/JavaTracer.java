import com.sun.jdi.*;
import com.sun.jdi.connect.*;
import com.sun.jdi.event.*;
import com.sun.jdi.request.*;
import java.io.*;
import java.nio.file.*;
import java.util.*;

public class JavaTracer {
    private static final int MAX_STEPS = 1500;
    private static int stepCount = 0;
    private static Map<Long, String> heap = new LinkedHashMap<>();
    private static StringBuilder traceJson = new StringBuilder("[\n");

    public static void main(String[] args) throws Exception {
        if (args.length < 2) return;
        String sourcePath = args[0];
        String outputPath = args[1];
        String targetClass = "Main";

        VirtualMachineManager vmm = Bootstrap.virtualMachineManager();
        LaunchingConnector connector = vmm.defaultConnector();
        Map<String, Connector.Argument> env = connector.defaultArguments();
        
        env.get("main").setValue(targetClass);
        env.get("options").setValue("-cp \"" + new File(sourcePath).getParent() + "\"");
        
        VirtualMachine vm = connector.launch(env);
        EventRequestManager erm = vm.eventRequestManager();

        ClassPrepareRequest cpr = erm.createClassPrepareRequest();
        cpr.addClassFilter(targetClass);
        cpr.enable();

        EventQueue queue = vm.eventQueue();
        boolean connected = true;

        while (connected) {
            EventSet eventSet = queue.remove();
            for (Event event : eventSet) {
                if (event instanceof VMDeathEvent || event instanceof VMDisconnectEvent) {
                    connected = false;
                } else if (event instanceof ClassPrepareEvent) {
                    ClassPrepareEvent cpe = (ClassPrepareEvent) event;
                    Method mainMethod = cpe.referenceType().methodsByName("main").get(0);
                    BreakpointRequest bp = erm.createBreakpointRequest(mainMethod.location());
                    bp.enable();
                } else if (event instanceof BreakpointEvent) {
                    BreakpointEvent bpEvent = (BreakpointEvent) event;
                    bpEvent.request().disable();
                    
                    StepRequest stepReq = erm.createStepRequest(bpEvent.thread(), StepRequest.STEP_LINE, StepRequest.STEP_INTO);
                    stepReq.addClassExclusionFilter("java.*");
                    stepReq.addClassExclusionFilter("javax.*");
                    stepReq.addClassExclusionFilter("sun.*");
                    stepReq.addClassExclusionFilter("jdk.*");
                    stepReq.addClassExclusionFilter("com.sun.*");
                    stepReq.enable();
                    
                    captureState(bpEvent, "call");
                } else if (event instanceof StepEvent) {
                    StepEvent stepEvent = (StepEvent) event;
                    stepCount++;
                    if (stepCount > MAX_STEPS) {
                        connected = false;
                        break;
                    }
                    captureState(stepEvent, "step_line");
                }
            }
            eventSet.resume();
        }

        if (traceJson.length() > 2) traceJson.setLength(traceJson.length() - 2); 
        traceJson.append("\n]");

        String codeText = new String(Files.readAllBytes(Paths.get(sourcePath)));
        String finalJson = "{\"code\": " + quote(codeText) + ",\"trace\": " + traceJson.toString() + "}";
        
        // Ensure UTF-8 Encoding while writing
        Files.write(Paths.get(outputPath), finalJson.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    private static void captureState(LocatableEvent event, String eventType) {
        try {
            ThreadReference thread = event.thread();
            Location loc = event.location();
            String funcName = loc.method().name();
            int line = loc.lineNumber();

            StringBuilder tempStep = new StringBuilder();
            tempStep.append("{");
            tempStep.append("\"line\":").append(line).append(",");
            tempStep.append("\"event\":").append(quote(eventType)).append(",");
            tempStep.append("\"func_name\":").append(quote(funcName)).append(",");
            tempStep.append("\"globals\":{},\"ordered_globals\":[],");

            StringBuilder frameJson = new StringBuilder("[");
            for (StackFrame frame : thread.frames()) {
                if (frame.location().declaringType().name().startsWith("java.")) continue;

                String fName = frame.location().method().name();
                StringBuilder localsJson = new StringBuilder("{");
                List<String> orderedNames = new ArrayList<>();

                for (LocalVariable var : frame.visibleVariables()) {
                    try {
                        Value val = frame.getValue(var);
                        String name = var.name();
                        orderedNames.add(quote(name));
                        localsJson.append(quote(name)).append(":").append(encodeValue(val)).append(",");
                    } catch (Exception ignore) {}
                }
                if (localsJson.length() > 1) localsJson.setLength(localsJson.length() - 1);
                localsJson.append("}");

                frameJson.append("{");
                frameJson.append("\"func_name\":").append(quote(fName)).append(",");
                frameJson.append("\"is_highlighted\":").append(frame.equals(event.thread().frame(0))).append(",");
                frameJson.append("\"is_parent\":false,");
                frameJson.append("\"is_zombie\":false,");
                frameJson.append("\"encoded_locals\":").append(localsJson).append(",");
                frameJson.append("\"ordered_varnames\":[").append(String.join(",", orderedNames)).append("]");
                frameJson.append("},");
            }
            if (frameJson.length() > 1) frameJson.setLength(frameJson.length() - 1);
            frameJson.append("]");

            tempStep.append("\"stack_to_render\":").append(frameJson).append(",");

            StringBuilder heapJson = new StringBuilder("{");
            for (Map.Entry<Long, String> entry : heap.entrySet()) {
                heapJson.append("\"").append(entry.getKey()).append("\":").append(entry.getValue()).append(",");
            }
            if (heapJson.length() > 1) heapJson.setLength(heapJson.length() - 1);
            heapJson.append("}");

            tempStep.append("\"heap\":").append(heapJson).append(",");
            tempStep.append("\"stdout\":\"\"");
            tempStep.append("}");

            traceJson.append(tempStep).append(",\n");

        } catch (Exception ignore) {}
    }

    private static String encodeValue(Value val) {
        if (val == null) return "null";
        if (val instanceof PrimitiveValue) {
            if (val instanceof CharValue) {
                // EXPLICIT FIX: Handle characters directly to avoid raw null bytes
                char c = ((CharValue) val).value();
                return quote(String.valueOf(c));
            }
            return quote(val.toString());
        }
        if (val instanceof StringReference) return quote(((StringReference) val).value());

        try {
            ObjectReference obj = (ObjectReference) val;
            long id = obj.uniqueID();

            if (!heap.containsKey(id)) {
                heap.put(id, "[]"); 
                if (obj instanceof ArrayReference) {
                    ArrayReference arr = (ArrayReference) obj;
                    StringBuilder arrStr = new StringBuilder("[\"LIST\"");
                    for (Value v : arr.getValues()) arrStr.append(",").append(encodeValue(v));
                    arrStr.append("]");
                    heap.put(id, arrStr.toString());
                } else {
                    StringBuilder objStr = new StringBuilder("[\"INSTANCE\",");
                    objStr.append(quote(obj.referenceType().name()));
                    for (Field field : obj.referenceType().visibleFields()) {
                        if (!field.isStatic()) {
                            try {
                                objStr.append(",[").append(quote(field.name())).append(",").append(encodeValue(obj.getValue(field))).append("]");
                            } catch (Exception ignore) {}
                        }
                    }
                    objStr.append("]");
                    heap.put(id, objStr.toString());
                }
            }
            return "[\"REF\"," + id + "]";
        } catch (Exception e) {
            return quote("<Error>");
        }
    }

    // THE ULTIMATE ESCAPER: Blocks all control/invisible characters from breaking JSON
    private static String quote(String s) {
        if (s == null) return "\"\"";
        StringBuilder sb = new StringBuilder(s.length() + 2);
        sb.append('"');
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '"') sb.append("\\\"");
            else if (c == '\\') sb.append("\\\\");
            else if (c == '\b') sb.append("\\b");
            else if (c == '\f') sb.append("\\f");
            else if (c == '\n') sb.append("\\n");
            else if (c == '\r') sb.append("\\r");
            else if (c == '\t') sb.append("\\t");
            else if (c < 0x20 || c > 0x7E) {
                // If it's a null byte or weird character, strictly hex-encode it!
                String hex = "0000" + Integer.toHexString(c);
                sb.append("\\u").append(hex.substring(hex.length() - 4));
            } else {
                sb.append(c);
            }
        }
        sb.append('"');
        return sb.toString();
    }
}