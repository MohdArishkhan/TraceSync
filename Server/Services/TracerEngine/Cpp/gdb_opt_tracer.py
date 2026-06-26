import gdb
import json
import os
import time

gdb.execute("set print elements 50", to_string=True)       
gdb.execute("set print repeats 10", to_string=True)        
gdb.execute("set print max-depth 3", to_string=True)       
gdb.execute("skip -gfi *.h", to_string=True)
gdb.execute("skip -gfi *.hpp", to_string=True)
gdb.execute("skip -gfi */bits/*", to_string=True)
gdb.execute("skip -gfi */ext/*", to_string=True)
gdb.execute("skip -gfi */c++/*", to_string=True)
gdb.execute("skip -gfi */mingw*/*", to_string=True)  # Specifically for Windows MinGW
gdb.execute("skip -gfi */include/*", to_string=True)



def encode_gdb_value(symbol, frame):
   def encode_gdb_value(symbol, frame):
    try:
        val = frame.read_var(symbol)
        val_type = val.type.strip_typedefs()
        
        # SAFETY CHECK: If array is huge, don't read it all!
        if val_type.code == gdb.TYPE_CODE_ARRAY:
            size = val_type.sizeof
            if size > 1024 * 1024: # 1MB se bada array hai toh limit lagao
                return ["C_STRUCT", str(val.address), {"bytes": size, "raw": "<HUGE_ARRAY_TRUNCATED>"}]
            
        val_type = val.type.strip_typedefs()
        t_code = val_type.code
        
        address = "0x0"
        try:
            if val.address:
                address = str(val.address)
        except Exception:
            pass

        try:
            val_str = str(val)
            if len(val_str) > 500:
                val_str = val_str[:500] + "... <TRUNCATED>"
        except Exception:
            val_str = "<UNREADABLE_MEMORY>"

        if t_code in [gdb.TYPE_CODE_STRUCT, gdb.TYPE_CODE_UNION, gdb.TYPE_CODE_ARRAY]:
            size = 0
            try:
                size = val_type.sizeof
            except Exception:
                pass
            return ["C_STRUCT", address, {"bytes": size, "raw": val_str}]
        else:
            if t_code == gdb.TYPE_CODE_PTR and val_str not in ["0x0", "0", "(void *) 0x0"]:
                try:
                    deref_val = str(val.dereference())
                    if len(deref_val) > 200:
                        deref_val = deref_val[:200] + "..."
                    val_str = f"{val_str} -> {deref_val}"
                except Exception:
                    pass
            return ["C_DATA", address, type_name, val_str]
            
    except Exception as e:
        t_name = str(symbol.type) if hasattr(symbol, 'type') else "Unknown"
        return ["C_DATA", "0x0", t_name, "<UNINITIALIZED / JUNK MEMORY>"]

def generate_opt_trace():
    trace_list = []
    gdb.execute("set confirm off", to_string=True)
    gdb.execute("set pagination off", to_string=True)

    # Memory Limits for C++ Garbage Values
    gdb.execute("set print elements 50", to_string=True)       
    gdb.execute("set print repeats 10", to_string=True)        
    gdb.execute("set print max-depth 3", to_string=True)       

    # Skip core libraries
    gdb.execute("skip -gfi /usr/**", to_string=True)
    gdb.execute("skip -gfi /lib/**", to_string=True)
    gdb.execute("skip -gfi /lib64/**", to_string=True)
    gdb.execute("skip -gfi /opt/**", to_string=True)
    gdb.execute("skip -gfi */bits/**", to_string=True)
    gdb.execute("skip -gfi */ext/**", to_string=True)
    gdb.execute("skip -gfi */c++/**", to_string=True)
    
    output_file = "program_stdout.txt"
    with open(output_file, "w") as f:
        pass 
    
    try:
        gdb.execute("tbreak main", to_string=True)
        
        run_cmd = "run"
        if os.path.exists("input.txt"):
            run_cmd += " < input.txt"
        
        run_cmd += f" > {output_file}" 
        
        gdb.execute(run_cmd, to_string=True)
        target_file = gdb.selected_frame().find_sal().symtab.fullname()
    except Exception:
        return

    prev_depth = 0
    step_count = 0
    MAX_STEPS = 1500  
    TIME_LIMIT = 10.0  
    start_time = time.time()

    while True:
        # THE PROTECTOR: Stop if limit is crossed!
        if step_count > MAX_STEPS or (time.time() - start_time) > TIME_LIMIT:
            break
            
        step_count += 1

        try:
            frame = gdb.selected_frame()
            sal = frame.find_sal()
            
            if not sal or not sal.symtab or sal.symtab.fullname() != target_file:
                try:
                    gdb.execute("finish", to_string=True)
                except Exception:
                    gdb.execute("step", to_string=True)
                continue

            current_depth = 0
            temp_frame = frame
            while temp_frame:
                current_depth += 1
                temp_frame = temp_frame.older()

            event_type = "step_line"
            if current_depth > prev_depth and prev_depth != 0:
                event_type = "call"
            elif current_depth < prev_depth:
                event_type = "return"
            prev_depth = current_depth

            stack_to_render = []
            f_temp = frame
            while f_temp:
                func_name = f_temp.name() or "global"
                encoded_locals = {}
                ordered_varnames = []
                block = f_temp.block()
                
                while block:
                    for symbol in block:
                        if symbol.is_argument or symbol.is_variable:
                            var_name = symbol.name
                            if var_name not in ordered_varnames:
                                ordered_varnames.append(var_name)
                                encoded_locals[var_name] = encode_gdb_value(symbol, f_temp)
                    block = block.superblock
                
                stack_to_render.insert(0, {
                    "frame_id": str(id(f_temp)),
                    "func_name": func_name,
                    "is_highlighted": (f_temp == frame),
                    "is_parent": False,
                    "is_zombie": False,
                    "ordered_varnames": ordered_varnames,
                    "encoded_locals": encoded_locals
                })
                f_temp = f_temp.older()
            
            current_stdout = ""
            try:
                if os.path.exists(output_file):
                    with open(output_file, 'r') as f:
                        current_stdout = f.read()
            except Exception:
                pass

            trace_list.append({
                "line": sal.line,
                "event": event_type,
                "func_name": frame.name() or "global",
                "globals": {},
                "ordered_globals": [],
                "stack_to_render": stack_to_render,
                "heap": {},
                "stdout": current_stdout  
            })
            gdb.execute("step", to_string=True)
        except Exception:
            break

    limit_hit = (step_count > MAX_STEPS) or ((time.time() - start_time) > TIME_LIMIT)

    final_stdout = ""
    try:
        if os.path.exists(output_file):
            with open(output_file, 'r') as f:
                final_stdout = f.read()
    except Exception:
        pass

    warning_msg = "\n[WARNING: Code is too heavy/recursive. Execution limit hit. Showing partial trace!]" if limit_hit else ""

    trace_list.append({
        "line": 0,
        "event": "exit",
        "func_name": "<exit>",
        "globals": {},
        "ordered_globals": [],
        "stack_to_render": [],
        "heap": {},
        "stdout": final_stdout + warning_msg
    })

    try:
        with open(target_file, 'r') as f:
            code_text = f.read()
    except Exception:
        code_text = ""

    with open("opt_trace.json", "w") as f:
        json.dump({
            "code": code_text,
            "trace": trace_list,
            "is_partial": limit_hit
        }, f, separators=(',', ':'))

generate_opt_trace()