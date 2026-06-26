// import com.sun.jdi.*;
// import com.sun.jdi.connect.Connector;
// import com.sun.jdi.connect.LaunchingConnector;
// import com.sun.jdi.event.*;
// import com.sun.jdi.request.BreakpointRequest;
// import com.sun.jdi.request.ClassPrepareRequest;
// import com.sun.jdi.request.EventRequestManager;
// import com.sun.jdi.request.StepRequest;

// import java.io.BufferedReader;
// import java.io.File;
// import java.io.InputStreamReader;
// import java.nio.file.Files;
// import java.nio.file.Paths;
// import java.util.*;

// public class JavaTracer {
//     private static final int MAX_STEPS = 50000;
//     private static int stepCount = 0;
//     private static StringBuilder traceJson = new StringBuilder("[\n");
//     private static StringBuffer stdoutBuffer = new StringBuffer(); 

//     public static void main(String[] args) throws Exception {
//         if (args.length < 2) return;
//         String sourcePath = args[0];
//         String outputPath = args[1];
//         String targetClass = "Main";

//         VirtualMachineManager vmm = Bootstrap.virtualMachineManager();
//         LaunchingConnector connector = vmm.defaultConnector();
//         Map<String, Connector.Argument> env = connector.defaultArguments();
        
//         env.get("main").setValue(targetClass);
//         env.get("options").setValue("-cp \"" + new File(sourcePath).getParent() + "\"");
        
//         VirtualMachine vm = connector.launch(env);
        
//         Process process = vm.process();
//         new Thread(() -> {
//             try (InputStreamReader isr = new InputStreamReader(process.getInputStream());
//                  BufferedReader reader = new BufferedReader(isr)) {
//                 int c;
//                 while ((c = reader.read()) != -1) {
//                     stdoutBuffer.append((char) c);
//                 }
//             } catch (Exception ignore) {}
//         }).start();

//         EventRequestManager erm = vm.eventRequestManager();

//         ClassPrepareRequest cpr = erm.createClassPrepareRequest();
//         cpr.addClassFilter(targetClass);
//         cpr.enable();

//         EventQueue queue = vm.eventQueue();
//         boolean connected = true;

//         // WRAPPED IN TRY-CATCH-FINALLY TO GUARANTEE JSON GENERATION
//         try {
//             while (connected) {
//                 EventSet eventSet = queue.remove();
//                 for (Event event : eventSet) {
//                     if (event instanceof VMDeathEvent || event instanceof VMDisconnectEvent) {
//                         connected = false;
//                         Thread.sleep(300); // Thoda wait taaki stdout buffer flush ho jaye
//                     } else if (event instanceof ClassPrepareEvent) {
//                         ClassPrepareEvent cpe = (ClassPrepareEvent) event;
//                         Method mainMethod = cpe.referenceType().methodsByName("main").get(0);
//                         BreakpointRequest bp = erm.createBreakpointRequest(mainMethod.location());
//                         bp.enable();
//                     } else if (event instanceof BreakpointEvent) {
//                         BreakpointEvent bpEvent = (BreakpointEvent) event;
//                         bpEvent.request().disable();
                        
//                         StepRequest stepReq = erm.createStepRequest(bpEvent.thread(), StepRequest.STEP_LINE, StepRequest.STEP_INTO);
//                         stepReq.addClassExclusionFilter("java.*");
//                         stepReq.addClassExclusionFilter("javax.*");
//                         stepReq.addClassExclusionFilter("sun.*");
//                         stepReq.addClassExclusionFilter("jdk.*");
//                         stepReq.addClassExclusionFilter("com.sun.*");
//                         stepReq.enable();
                        
//                         captureState(bpEvent, "call");
//                     } else if (event instanceof StepEvent) {
//                         StepEvent stepEvent = (StepEvent) event;
//                         stepCount++;
                        
//                         if (stepCount > MAX_STEPS) {
//                             connected = false;
//                             // APPEND LIMIT MESSAGE DIRECTLY TO STDOUT
//                             stdoutBuffer.append("\n\n[TRACER WARNING]: Maximum limit of ").append(MAX_STEPS).append(" steps crossed. Tracing terminated early to prevent timeout.\n");
//                             break;
//                         }
//                         captureState(stepEvent, "step_line");
//                     }
//                 }
//                 if (connected) eventSet.resume();
//             }
//         } catch (Exception e) {
//             // CAPTURE ANY CRASHES OR EXCEPTIONS IN THE TRACER ITSELF
//             stdoutBuffer.append("\n\n[TRACER ERROR]: Execution interrupted - ").append(e.getMessage()).append("\n");
//         } finally {
//             // THIS WILL ALWAYS RUN, ENSURING PARTIAL TRACES ARE SAVED
//             captureFinalStdout();

//             if (traceJson.length() > 2) traceJson.setLength(traceJson.length() - 2); 
//             traceJson.append("\n]");

//             String codeText = new String(Files.readAllBytes(Paths.get(sourcePath)));
//             String finalJson = "{\"code\": " + quote(codeText) + ",\"trace\": " + traceJson.toString() + "}";
            
//             Files.write(Paths.get(outputPath), finalJson.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            
//             // Explicitly exit so the process doesn't hang
//             System.exit(0); 
//         }
//     }

//     private static void captureState(LocatableEvent event, String eventType) {
//         try {
//             ThreadReference thread = event.thread();
//             Location loc = event.location();
//             String funcName = loc.method().name();
//             int line = loc.lineNumber();

//             Map<Long, String> currentHeap = new LinkedHashMap<>();

//             StringBuilder tempStep = new StringBuilder();
//             tempStep.append("{");
//             tempStep.append("\"line\":").append(line).append(",");
//             tempStep.append("\"event\":").append(quote(eventType)).append(",");
//             tempStep.append("\"func_name\":").append(quote(funcName)).append(",");
//             tempStep.append("\"globals\":{},\"ordered_globals\":[],");

//             StringBuilder frameJson = new StringBuilder("[");
//             for (StackFrame frame : thread.frames()) {
//                 if (frame.location().declaringType().name().startsWith("java.")) continue;

//                 String fName = frame.location().method().name();
//                 StringBuilder localsJson = new StringBuilder("{");
//                 List<String> orderedNames = new ArrayList<>();

//                 for (LocalVariable var : frame.visibleVariables()) {
//                     try {
//                         Value val = frame.getValue(var);
//                         String name = var.name();
//                         orderedNames.add(quote(name));
//                         localsJson.append(quote(name)).append(":").append(encodeValue(val, currentHeap)).append(",");
//                     } catch (Exception ignore) {}
//                 }
//                 if (localsJson.length() > 1) localsJson.setLength(localsJson.length() - 1);
//                 localsJson.append("}");

//                 frameJson.append("{");
//                 frameJson.append("\"func_name\":").append(quote(fName)).append(",");
//                 frameJson.append("\"is_highlighted\":").append(frame.equals(event.thread().frame(0))).append(",");
//                 frameJson.append("\"is_parent\":false,");
//                 frameJson.append("\"is_zombie\":false,");
//                 frameJson.append("\"encoded_locals\":").append(localsJson).append(",");
//                 frameJson.append("\"ordered_varnames\":[").append(String.join(",", orderedNames)).append("]");
//                 frameJson.append("},");
//             }
//             if (frameJson.length() > 1) frameJson.setLength(frameJson.length() - 1);
//             frameJson.append("]");

//             tempStep.append("\"stack_to_render\":").append(frameJson).append(",");

//             StringBuilder heapJson = new StringBuilder("{");
//             for (Map.Entry<Long, String> entry : currentHeap.entrySet()) {
//                 heapJson.append("\"").append(entry.getKey()).append("\":").append(entry.getValue()).append(",");
//             }
//             if (heapJson.length() > 1) heapJson.setLength(heapJson.length() - 1);
//             heapJson.append("}");

//             tempStep.append("\"heap\":").append(heapJson).append(",");
//             tempStep.append("\"stdout\":").append(quote(stdoutBuffer.toString()));
//             tempStep.append("}");

//             traceJson.append(tempStep).append(",\n");

//         } catch (Exception ignore) {}
//     }

//     private static void captureFinalStdout() {
//         StringBuilder tempStep = new StringBuilder();
//         tempStep.append("{");
//         tempStep.append("\"line\":0,");
//         tempStep.append("\"event\":\"exit\",");
//         tempStep.append("\"func_name\":\"<exit>\",");
//         tempStep.append("\"globals\":{},\"ordered_globals\":[],");
//         tempStep.append("\"stack_to_render\":[],");
//         tempStep.append("\"heap\":{},");
//         tempStep.append("\"stdout\":").append(quote(stdoutBuffer.toString()));
//         tempStep.append("}");
//         traceJson.append(tempStep).append(",\n");
//     }

//     private static String encodeValue(Value val, Map<Long, String> currentHeap) {
//         if (val == null) return "null";
//         if (val instanceof PrimitiveValue) {
//             if (val instanceof CharValue) {
//                 char c = ((CharValue) val).value();
//                 return quote(String.valueOf(c));
//             }
//             return quote(val.toString());
//         }
//         if (val instanceof StringReference) return quote(((StringReference) val).value());

//         try {
//             ObjectReference obj = (ObjectReference) val;
//             long id = obj.uniqueID();

//             if (!currentHeap.containsKey(id)) {
//                 currentHeap.put(id, "[]"); 
//                 if (obj instanceof ArrayReference) {
//                     ArrayReference arr = (ArrayReference) obj;
//                     StringBuilder arrStr = new StringBuilder("[\"LIST\"");
//                     for (Value v : arr.getValues()) {
//                         arrStr.append(",").append(encodeValue(v, currentHeap));
//                     }
//                     arrStr.append("]");
//                     currentHeap.put(id, arrStr.toString());
//                 } else {
//                     StringBuilder objStr = new StringBuilder("[\"INSTANCE\",");
//                     objStr.append(quote(obj.referenceType().name()));
//                     for (Field field : obj.referenceType().visibleFields()) {
//                         if (!field.isStatic()) {
//                             try {
//                                 objStr.append(",[").append(quote(field.name())).append(",")
//                                       .append(encodeValue(obj.getValue(field), currentHeap)).append("]");
//                             } catch (Exception ignore) {}
//                         }
//                     }
//                     objStr.append("]");
//                     currentHeap.put(id, objStr.toString());
//                 }
//             }
//             return "[\"REF\"," + id + "]";
//         } catch (Exception e) {
//             return quote("<Error>");
//         }
//     }

//     private static String quote(String s) {
//         if (s == null) return "\"\"";
//         StringBuilder sb = new StringBuilder(s.length() + 2);
//         sb.append('"');
//         for (int i = 0; i < s.length(); i++) {
//             char c = s.charAt(i);
//             if (c == '"') sb.append("\\\"");
//             else if (c == '\\') sb.append("\\\\");
//             else if (c == '\b') sb.append("\\b");
//             else if (c == '\f') sb.append("\\f");
//             else if (c == '\n') sb.append("\\n");
//             else if (c == '\r') sb.append("\\r");
//             else if (c == '\t') sb.append("\\t");
//             else if (c < 0x20 || c > 0x7E) {
//                 String hex = "0000" + Integer.toHexString(c);
//                 sb.append("\\u").append(hex.substring(hex.length() - 4));
//             } else {
//                 sb.append(c);
//             }
//         }
//         sb.append('"');
//         return sb.toString();
//     }
// }

import com.sun.jdi.*;
import com.sun.jdi.connect.Connector;
import com.sun.jdi.connect.LaunchingConnector;
import com.sun.jdi.event.*;
import com.sun.jdi.request.BreakpointRequest;
import com.sun.jdi.request.ClassPrepareRequest;
import com.sun.jdi.request.EventRequestManager;
import com.sun.jdi.request.StepRequest;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

public class JavaTracer {
    // FIX 1: Limit reduced so it finishes quickly without hitting Node's timeout
    private static final int MAX_STEPS = 10000; 
    private static int stepCount = 0;
    private static StringBuffer stdoutBuffer = new StringBuffer(); 
    
    private static PrintWriter writer;
    private static boolean isFirstTrace = true;
    private static volatile boolean isClosed = false;

    public static void main(String[] args) throws Exception {
        if (args.length < 2) return;
        String sourcePath = args[0];
        String outputPath = args[1];
        String targetClass = "Main";

        String codeText = new String(Files.readAllBytes(Paths.get(sourcePath)));
        writer = new PrintWriter(new BufferedWriter(new OutputStreamWriter(new FileOutputStream(outputPath), "UTF-8")));
        writer.print("{\"code\": " + quote(codeText) + ",\"trace\": [\n");

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            captureFinalStdout();
            closeTraceSafely();
        }));

        VirtualMachineManager vmm = Bootstrap.virtualMachineManager();
        LaunchingConnector connector = vmm.defaultConnector();
        Map<String, Connector.Argument> env = connector.defaultArguments();
        
        env.get("main").setValue(targetClass);
        env.get("options").setValue("-cp \"" + new File(sourcePath).getParent() + "\"");
        
        VirtualMachine vm = connector.launch(env);
        
        Process process = vm.process();
        new Thread(() -> {
            try (InputStreamReader isr = new InputStreamReader(process.getInputStream());
                 BufferedReader reader = new BufferedReader(isr)) {
                int c;
                while ((c = reader.read()) != -1) {
                    stdoutBuffer.append((char) c);
                }
            } catch (Exception ignore) {}
        }).start();

        EventRequestManager erm = vm.eventRequestManager();

        ClassPrepareRequest cpr = erm.createClassPrepareRequest();
        cpr.addClassFilter(targetClass);
        cpr.enable();

        EventQueue queue = vm.eventQueue();
        boolean connected = true;
        
        long startTime = System.currentTimeMillis(); 

        try {
            while (connected) {
                EventSet eventSet = queue.remove();
                for (Event event : eventSet) {
                    if (event instanceof VMDeathEvent || event instanceof VMDisconnectEvent) {
                        connected = false;
                        Thread.sleep(300); 
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
                        
                        // FIX 2: Check limit at 15 Seconds instead of 25 to give Node plenty of breathing room
                        long currentTime = System.currentTimeMillis();
                        if ((currentTime - startTime) > 15000) { 
                            connected = false;
                            stdoutBuffer.append("\n\n[TRACER WARNING]: Time limit of 15 seconds crossed. Tracing terminated gracefully.\n");
                            break;
                        }

                        if (stepCount > MAX_STEPS) {
                            connected = false;
                            stdoutBuffer.append("\n\n[TRACER WARNING]: Maximum limit of ").append(MAX_STEPS).append(" steps crossed. Tracing terminated gracefully.\n");
                            break;
                        }
                        
                        captureState(stepEvent, "step_line");
                    }
                }
                if (connected) eventSet.resume();
            }
        } catch (Throwable t) { 
            stdoutBuffer.append("\n\n[TRACER ERROR]: Execution interrupted - ").append(t.getMessage()).append("\n");
        } finally {
            captureFinalStdout();
            closeTraceSafely();
            System.exit(0); 
        }
    }

    private static synchronized void writeTrace(String json) {
        if (writer == null || isClosed) return;
        if (!isFirstTrace) {
            writer.print(",\n");
        }
        writer.print(json);
        writer.flush(); 
        isFirstTrace = false;
    }

    // FIX 3: Fully synchronized and protected to prevent double-writing issues during shutdowns
    private static synchronized void captureFinalStdout() {
        if (isClosed) return; 
        
        StringBuilder tempStep = new StringBuilder();
        tempStep.append("{");
        tempStep.append("\"line\":0,");
        tempStep.append("\"event\":\"exit\",");
        tempStep.append("\"func_name\":\"<exit>\",");
        tempStep.append("\"globals\":{},\"ordered_globals\":[],");
        tempStep.append("\"stack_to_render\":[],");
        tempStep.append("\"heap\":{},");
        tempStep.append("\"stdout\":").append(quote(stdoutBuffer.toString()));
        tempStep.append("}");
        
        writeTrace(tempStep.toString());
    }

    private static synchronized void closeTraceSafely() {
        if (!isClosed && writer != null) {
            try {
                writer.print("\n]}"); 
                writer.flush();
                writer.close();
                isClosed = true;
            } catch (Exception ignore) {}
        }
    }

    private static void captureState(LocatableEvent event, String eventType) {
        try {
            ThreadReference thread = event.thread();
            Location loc = event.location();
            String funcName = loc.method().name();
            int line = loc.lineNumber();

            Map<Long, String> currentHeap = new LinkedHashMap<>();

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
                        localsJson.append(quote(name)).append(":").append(encodeValue(val, currentHeap)).append(",");
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
            for (Map.Entry<Long, String> entry : currentHeap.entrySet()) {
                heapJson.append("\"").append(entry.getKey()).append("\":").append(entry.getValue()).append(",");
            }
            if (heapJson.length() > 1) heapJson.setLength(heapJson.length() - 1);
            heapJson.append("}");

            tempStep.append("\"heap\":").append(heapJson).append(",");
            tempStep.append("\"stdout\":").append(quote(stdoutBuffer.toString()));
            tempStep.append("}");

            writeTrace(tempStep.toString());

        } catch (Exception ignore) {}
    }

    private static String encodeValue(Value val, Map<Long, String> currentHeap) {
        if (val == null) return "null";
        if (val instanceof PrimitiveValue) {
            if (val instanceof CharValue) {
                char c = ((CharValue) val).value();
                return quote(String.valueOf(c));
            }
            return quote(val.toString());
        }
        if (val instanceof StringReference) return quote(((StringReference) val).value());

        try {
            ObjectReference obj = (ObjectReference) val;
            long id = obj.uniqueID();

            if (!currentHeap.containsKey(id)) {
                currentHeap.put(id, "[]"); 
                if (obj instanceof ArrayReference) {
                    ArrayReference arr = (ArrayReference) obj;
                    StringBuilder arrStr = new StringBuilder("[\"LIST\"");
                    for (Value v : arr.getValues()) {
                        arrStr.append(",").append(encodeValue(v, currentHeap));
                    }
                    arrStr.append("]");
                    currentHeap.put(id, arrStr.toString());
                } else {
                    StringBuilder objStr = new StringBuilder("[\"INSTANCE\",");
                    objStr.append(quote(obj.referenceType().name()));
                    for (Field field : obj.referenceType().visibleFields()) {
                        if (!field.isStatic()) {
                            try {
                                objStr.append(",[").append(quote(field.name())).append(",")
                                      .append(encodeValue(obj.getValue(field), currentHeap)).append("]");
                            } catch (Exception ignore) {}
                        }
                    }
                    objStr.append("]");
                    currentHeap.put(id, objStr.toString());
                }
            }
            return "[\"REF\"," + id + "]";
        } catch (Exception e) {
            return quote("<Error>");
        }
    }

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