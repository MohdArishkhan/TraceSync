import gdb
import json
import os

def encode_gdb_value(symbol, frame):
    try:
        val = frame.read_var(symbol)
        type_name = str(symbol.type)
        if val.is_optimized_out:
            return ["C_DATA", "0x0", type_name, "<OPTIMIZED_OUT>"]
        val_type = val.type.strip_typedefs()
        t_code = val_type.code
        address = str(val.address) if val.address else "0x0"
        val_str = str(val)
        if t_code in [gdb.TYPE_CODE_STRUCT, gdb.TYPE_CODE_UNION, gdb.TYPE_CODE_ARRAY]:
            return ["C_STRUCT", address, {"bytes": val_type.sizeof, "raw": val_str}]
        else:
            if t_code == gdb.TYPE_CODE_PTR and val_str != "0x0":
                try:
                    val_str = f"{val_str} -> {str(val.dereference())}"
                except:
                    pass
            return ["C_DATA", address, type_name, val_str]
    except:
        return ["C_DATA", "0x0", str(symbol.type), "<UNINITIALIZED>"]

def generate_opt_trace():
    trace_list = []
    gdb.execute("set confirm off", to_string=True)
    gdb.execute("set pagination off", to_string=True)
    gdb.execute("skip -gfi /usr/**", to_string=True)
    gdb.execute("skip -gfi /lib/**", to_string=True)
    gdb.execute("skip -gfi /lib64/**", to_string=True)
    gdb.execute("skip -gfi /opt/**", to_string=True)
    gdb.execute("skip -gfi */bits/**", to_string=True)
    gdb.execute("skip -gfi */ext/**", to_string=True)
    gdb.execute("skip -gfi */c++/**", to_string=True)
    
    try:
        gdb.execute("tbreak main", to_string=True)
        if os.path.exists("input.txt"):
            gdb.execute("run < input.txt", to_string=True)
        else:
            gdb.execute("run", to_string=True)
        target_file = gdb.selected_frame().find_sal().symtab.fullname()
    except:
        return

    prev_depth = 0

    while True:
        try:
            frame = gdb.selected_frame()
            sal = frame.find_sal()
            if not sal or not sal.symtab or sal.symtab.fullname() != target_file:
                try:
                    gdb.execute("finish", to_string=True)
                except:
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
                    "frame_id": id(f_temp),
                    "func_name": func_name,
                    "is_highlighted": (f_temp == frame),
                    "is_parent": False,
                    "is_zombie": False,
                    "ordered_varnames": ordered_varnames,
                    "encoded_locals": encoded_locals
                })
                f_temp = f_temp.older()
            
            trace_list.append({
                "line": sal.line,
                "event": event_type,
                "func_name": frame.name() or "global",
                "globals": {},
                "ordered_globals": [],
                "stack_to_render": stack_to_render,
                "heap": {},
                "stdout": "" 
            })
            gdb.execute("step", to_string=True)
        except:
            break

    try:
        with open(target_file, 'r') as f:
            code_text = f.read()
    except:
        code_text = ""

    with open("opt_trace.json", "w") as f:
        json.dump({
            "code": code_text,
            "trace": trace_list
        }, f, separators=(',', ':'))

generate_opt_trace()