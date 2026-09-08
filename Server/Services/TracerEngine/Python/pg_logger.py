import importlib.util
import importlib.machinery
import sys
import bdb
import re
import traceback
import types

is_python3 = (sys.version_info[0] == 3)

if is_python3:
  import io as StringIO
  import io
else:
  import StringIO
import pg_encoder

MAX_EXECUTED_LINES = 1000

DEBUG = True

BREAKPOINT_STR = '#break'

PYTUTOR_HIDE_STR = '#pythontutor_hide:'
PYTUTOR_INLINE_TYPE_STR = '#pythontutor_hide_type:'

CLASS_RE = re.compile(r'class\s+')

def globToRegex(pat):
    i, n = 0, len(pat)
    res = ''
    while i < n:
        c = pat[i]
        i = i+1
        if c == '*':
            res = res + '.*'
        elif c == '?':
            res = res + '.'
        elif c == '[':
            j = i
            if j < n and pat[j] == '!':
                j = j+1
            if j < n and pat[j] == ']':
                j = j+1
            while j < n and pat[j] != ']':
                j = j+1
            if j >= n:
                res = res + '\\['
            else:
                stuff = pat[i:j].replace('\\','\\\\')
                i = j+1
                if stuff[0] == '!':
                    stuff = '^' + stuff[1:]
                elif stuff[0] == '^':
                    stuff = '\\' + stuff
                res = '%s[%s]' % (res, stuff)
        else:
            res = res + re.escape(c)
    return res + r'\Z(?ms)'

def compileGlobMatch(pattern):
    return re.compile(globToRegex(pattern)).match

TRY_ANACONDA_STR = '\n\nYou can also try "Python 3.6 with Anaconda (experimental)",\nwhich is slower but lets you import many more modules.\n'

try:
  import resource
  resource_module_loaded = True
except ImportError:
  resource_module_loaded = False

class NullDevice():
    def write(self, s):
        pass

if type(__builtins__) is dict:
  BUILTIN_IMPORT = __builtins__['__import__']
else:
  assert type(__builtins__) is types.ModuleType
  BUILTIN_IMPORT = __builtins__.__import__

ALLOWED_STDLIB_MODULE_IMPORTS = ('math', 'random', 'time', 'datetime',
                          'functools', 'itertools', 'operator', 'string',
                          'collections', 're', 'json',
                          'heapq', 'bisect', 'copy', 'hashlib', 'typing',
                          '__future__', 'cmath', 'decimal', 'fractions',
                          'pprint', 'calendar', 'pickle',
                          'types', 'array',
                          'locale', 'abc',
                          'doctest', 'unittest',
                          )

OTHER_STDLIB_WHITELIST = ('StringIO', 'io')

def __restricted_import__(*args):
  args = [e for e in args if type(e) is str]

  all_allowed_imports = sorted(ALLOWED_STDLIB_MODULE_IMPORTS + OTHER_STDLIB_WHITELIST)
  if is_python3:
    all_allowed_imports.remove('StringIO')
  else:
    all_allowed_imports.remove('typing')

  if args[0] in all_allowed_imports:
    imported_mod = BUILTIN_IMPORT(*args)
    for mod in ('os', 'sys', 'posix', 'gc'):
      if hasattr(imported_mod, mod):
        delattr(imported_mod, mod)

    return imported_mod
  else:
    ENTRIES_PER_LINE = 6

    lines_to_print = []
    for i in range(0, len(all_allowed_imports), ENTRIES_PER_LINE):
        lines_to_print.append(all_allowed_imports[i:i + ENTRIES_PER_LINE])
    pretty_printed_imports = ',\n  '.join([', '.join(e) for e in lines_to_print])

    raise ImportError('{0} not found or not supported\nOnly these modules can be imported:\n  {1}{2}'.format(args[0], pretty_printed_imports, TRY_ANACONDA_STR))

import random
random.seed(0)

input_string_queue = []

def open_wrapper(*args):
  if is_python3:
      raise Exception('''open() is not supported by Python Tutor.
Instead use io.StringIO() to simulate a file.
Example: http://goo.gl/uNvBGl''' + TRY_ANACONDA_STR)
  else:
      raise Exception('''open() is not supported by Python Tutor.
Instead use StringIO.StringIO() to simulate a file.
Example: http://goo.gl/Q9xQ4p''' + TRY_ANACONDA_STR)

def create_banned_builtins_wrapper(fn_name):
  def err_func(*args):
    raise Exception("'" + fn_name + "' is not supported by Python Tutor." + TRY_ANACONDA_STR)
  return err_func

class RawInputException(Exception):
  pass

def raw_input_wrapper(prompt=''):
  if input_string_queue:
    input_str = input_string_queue.pop(0)

    sys.stdout.write(str(prompt)) 
    sys.stdout.write(input_str + "\n") 
    return input_str
  raise RawInputException(str(prompt)) 

def python2_input_wrapper(prompt=''):
  if input_string_queue:
    input_str = input_string_queue.pop(0)

    sys.stdout.write(str(prompt)) 
    sys.stdout.write(input_str + "\n") 
    return eval(input_str) 
  raise RawInputException(str(prompt)) 

class MouseInputException(Exception):
  pass

def mouse_input_wrapper(prompt=''):
  if input_string_queue:
    return input_string_queue.pop(0)
  raise MouseInputException(prompt)

BANNED_BUILTINS = [] 

IGNORE_VARS = set(('__builtins__', '__name__', '__exception__', '__doc__', '__package__'))

def get_user_globals(frame, at_global_scope=False):
  d = filter_var_dict(frame.f_globals)

  if not is_python3 and hasattr(frame, 'f_valuestack'):
    for (i, e) in enumerate([e for e in frame.f_valuestack if type(e) is list]):
      d['_tmp' + str(i+1)] = e

  if '__return__' in d:
    del d['__return__']
  return d

def get_user_locals(frame):
  ret = filter_var_dict(frame.f_locals)
  
  f_name = frame.f_code.co_name
  if hasattr(frame, 'f_valuestack'):
    if not is_python3:
      for (i, e) in enumerate([e for e in frame.f_valuestack
                               if type(e) is list]):
        ret['_tmp' + str(i+1)] = e

    if f_name.endswith('comp>'):
      for (i, e) in enumerate([e for e in frame.f_valuestack
                               if type(e) in (list, set, dict)]):
        ret['_tmp' + str(i+1)] = e

  return ret

def filter_var_dict(d):
  ret = {}
  for (k,v) in d.items():
    if k not in IGNORE_VARS:
      ret[k] = v
  return ret

def visit_all_locally_reachable_function_objs(frame):
  for (k, v) in get_user_locals(frame).items():
    for e in visit_function_obj(v, set()):
      if e: 
        assert type(e) in (types.FunctionType, types.MethodType)
        yield e

def visit_function_obj(v, ids_seen_set):
  v_id = id(v)

  if v_id in ids_seen_set:
    yield None
  else:
    ids_seen_set.add(v_id)

    typ = type(v)
    
    if typ in (types.FunctionType, types.MethodType):
      yield v

    elif typ in (list, tuple, set):
      for child in v:
        for child_res in visit_function_obj(child, ids_seen_set):
          yield child_res

    elif typ == dict or pg_encoder.is_class(v) or pg_encoder.is_instance(v):
      contents_dict = None

      if typ == dict:
        contents_dict = v
      elif hasattr(v, '__dict__'):
        contents_dict = v.__dict__

      if contents_dict:
        for (key_child, val_child) in contents_dict.items():
          for key_child_res in visit_function_obj(key_child, ids_seen_set):
            yield key_child_res
          for val_child_res in visit_function_obj(val_child, ids_seen_set):
            yield val_child_res

    yield None

class PGLogger(bdb.Bdb):
    def __init__(self, cumulative_mode, heap_primitives, show_only_outputs, finalizer_func,
                 disable_security_checks=False, allow_all_modules=False, crazy_mode=False,
                 custom_modules=None, separate_stdout_by_module=False, probe_exprs=None):
        bdb.Bdb.__init__(self)
        self.mainpyfile = ''
        self._wait_for_mainpyfile = 0

        if probe_exprs:
            self.probe_exprs = probe_exprs
        else:
            self.probe_exprs = None

        self.separate_stdout_by_module = separate_stdout_by_module
        self.stdout_by_module = {} 

        self.modules_to_trace = set(['__main__']) 

        self.custom_modules = custom_modules
        if self.custom_modules:
            for module_name in self.custom_modules:
                self.modules_to_trace.add(module_name)

        self.disable_security_checks = disable_security_checks
        self.allow_all_modules = allow_all_modules
        if self.allow_all_modules:
            self.disable_security_checks = True

        self.cumulative_mode = cumulative_mode

        self.render_heap_primitives = heap_primitives

        self.show_only_outputs = show_only_outputs

        self.crazy_mode = crazy_mode

        self.finalizer_func = finalizer_func

        self.trace = []

        self.done = False

        self.wait_for_return_stack = None

        self.GAE_STDOUT = sys.stdout

        self.closures = {}

        self.lambda_closures = {}

        self.globally_defined_funcs = set()

        self.frame_ordered_ids = {}
        self.cur_frame_id = 1

        self.zombie_frames = []

        self.parent_frames_set = set()

        self.all_globals_in_order = []

        self.encoder = pg_encoder.ObjectEncoder(self)

        self.executed_script = None 

        self.breakpoints = []

        self.vars_to_hide = set() 
                                  
        self.types_to_inline = set() 

        self.prev_lineno = -1 


    def should_hide_var(self, var):
        for re_match in self.vars_to_hide:
            if re_match(var):
                return True
        return False


    def get_user_stdout(self):
        def encode_stringio(sio):
            if not is_python3:
                sio.buflist = [(e.decode('utf-8', 'replace')
                                           if type(e) is str
                                           else e)
                                          for e in sio.buflist]
            return sio.getvalue()

        if self.separate_stdout_by_module:
            ret = {}
            for module_name in self.stdout_by_module:
                ret[module_name] = encode_stringio(self.stdout_by_module[module_name])
            return ret
        else:
            return encode_stringio(self.user_stdout)


    def get_frame_id(self, cur_frame):
      return self.frame_ordered_ids[cur_frame]

    def get_parent_of_function(self, val):
      if val in self.closures:
          return self.get_frame_id(self.closures[val])
      elif val in self.lambda_closures:
          return self.get_frame_id(self.lambda_closures[val])
      else:
        return None

    def get_parent_frame(self, frame):
      for (func_obj, parent_frame) in self.closures.items():
        if func_obj.__code__ == frame.f_code:
          all_matched = True
          for k in frame.f_locals:
            if k in frame.f_code.co_varnames:
              continue
            if k != '__return__' and k in parent_frame.f_locals:
              if parent_frame.f_locals[k] != frame.f_locals[k]:
                all_matched = False
                break

          if all_matched:
            return parent_frame

      for (lambda_code_obj, parent_frame) in self.lambda_closures.items():
        if lambda_code_obj == frame.f_code:
          return parent_frame

      return None


    def lookup_zombie_frame_by_id(self, frame_id):
      for e in self.zombie_frames:
        if self.get_frame_id(e) == frame_id:
          return e
      assert False 

    def forget(self):
        self.lineno = None
        self.stack = []
        self.curindex = 0
        self.curframe = None

    def setup(self, f, t):
        self.forget()
        self.stack, self.curindex = self.get_stack(f, t)
        self.curframe = self.stack[self.curindex][0]

    def get_stack_code_IDs(self):
        return [id(e[0].f_code) for e in self.stack]

    def user_call(self, frame, argument_list):
        if self.done: return

        if self._wait_for_mainpyfile:
            return
        if self.stop_here(frame):
            try:
              del frame.f_locals['__return__']
            except KeyError:
              pass

            self.interaction(frame, None, 'call')

    def user_line(self, frame):
        if self.done: return

        if self._wait_for_mainpyfile:
            if ((frame.f_globals['__name__'] not in self.modules_to_trace) or
                frame.f_lineno <= 0):
                return
            self._wait_for_mainpyfile = 0
        self.interaction(frame, None, 'step_line')

    def user_return(self, frame, return_value):
        if self.done: return

        frame.f_locals['__return__'] = return_value
        self.interaction(frame, None, 'return')

    def user_exception(self, frame, exc_info):
        if self.done: return

        exc_type, exc_value, exc_traceback = exc_info
        frame.f_locals['__exception__'] = exc_type, exc_value
        if type(exc_type) == type(''):
            exc_type_name = exc_type
        else: exc_type_name = exc_type.__name__

        if exc_type_name == 'RawInputException':
          raw_input_arg = str(exc_value.args[0]) 
          self.trace.append(dict(event='raw_input', prompt=raw_input_arg))
          self.done = True
        elif exc_type_name == 'MouseInputException':
          mouse_input_arg = str(exc_value.args[0]) 
          self.trace.append(dict(event='mouse_input', prompt=mouse_input_arg))
          self.done = True
        else:
          self.interaction(frame, exc_traceback, 'exception')

    def get_script_line(self, n):
        return self.executed_script_lines[n-1]

    def interaction(self, frame, traceback, event_type):
        self.setup(frame, traceback)
        tos = self.stack[self.curindex]
        top_frame = tos[0]
        lineno = tos[1]

        topframe_module = top_frame.f_globals['__name__']

        if topframe_module not in self.modules_to_trace:
          return
        if top_frame.f_code.co_name == '__new__':
          return
        if top_frame.f_code.co_name == '__repr__':
          return

        if self.wait_for_return_stack:
          if event_type == 'return' and \
             (self.wait_for_return_stack == self.get_stack_code_IDs()):
            self.wait_for_return_stack = None 
          return 
        else:
          if event_type == 'call':
            first_lineno = top_frame.f_code.co_firstlineno
            if topframe_module == "__main__":
                func_line = self.get_script_line(first_lineno)
            elif topframe_module in self.custom_modules:
                module_code = self.custom_modules[topframe_module]
                module_code_lines = module_code.splitlines() 
                func_line = module_code_lines[first_lineno-1]
            else:
                func_line = ''

            if CLASS_RE.match(func_line.lstrip()): 
              self.wait_for_return_stack = self.get_stack_code_IDs()
              return

        self.encoder.reset_heap() 

        if event_type == 'call':
          self.frame_ordered_ids[top_frame] = self.cur_frame_id
          self.cur_frame_id += 1

          if self.cumulative_mode:
            self.zombie_frames.append(top_frame)

        if self.separate_stdout_by_module:
          if event_type == 'call':
            if topframe_module in self.stdout_by_module:
              sys.stdout = self.stdout_by_module[topframe_module]
            else:
              sys.stdout = self.stdout_by_module["<other>"]
          elif event_type == 'return' and self.curindex > 0:
            prev_tos = self.stack[self.curindex - 1]
            prev_topframe = prev_tos[0]
            prev_topframe_module = prev_topframe.f_globals['__name__']
            if prev_topframe_module in self.stdout_by_module:
              sys.stdout = self.stdout_by_module[prev_topframe_module]
            else:
              sys.stdout = self.stdout_by_module["<other>"]

        cur_stack_frames = [e[0] for e in self.stack[:self.curindex+1]]
        zombie_frames_to_render = [e for e in self.zombie_frames if e not in cur_stack_frames]

        encoded_stack_locals = []

        def create_encoded_stack_entry(cur_frame):
          ret = {}

          parent_frame_id_list = []

          f = cur_frame
          while True:
            p = self.get_parent_frame(f)
            if p:
              pid = self.get_frame_id(p)
              assert pid
              parent_frame_id_list.append(pid)
              f = p
            else:
              break

          cur_name = cur_frame.f_code.co_name

          if cur_name == '':
            cur_name = 'unnamed function'

          if cur_name == '<lambda>':
            cur_name += pg_encoder.create_lambda_line_number(cur_frame.f_code,
                                                             self.encoder.line_to_lambda_code)

          encoded_locals = {}

          for (k, v) in get_user_locals(cur_frame).items():
            is_in_parent_frame = False

            for pid in parent_frame_id_list:
              parent_frame = self.lookup_zombie_frame_by_id(pid)
              if k in parent_frame.f_locals:
                if k != '__return__':
                  if parent_frame.f_locals[k] == v:
                      is_in_parent_frame = True

            if is_in_parent_frame and k not in cur_frame.f_code.co_varnames:
              continue

            if k == '__module__':
              continue

            if self.should_hide_var(k):
              continue

            encoded_val = self.encoder.encode(v, self.get_parent_of_function)
            encoded_locals[k] = encoded_val

          ordered_varnames = []
          for e in cur_frame.f_code.co_varnames:
            if e in encoded_locals:
              ordered_varnames.append(e)

          for e in sorted(encoded_locals.keys()):
            if e != '__return__' and e not in ordered_varnames:
              ordered_varnames.append(e)

          if '__return__' in encoded_locals:
            ordered_varnames.append('__return__')

          if '__locals__' in encoded_locals:
            ordered_varnames.remove('__locals__')
            local = encoded_locals.pop('__locals__')
            if encoded_locals.get('__return__', True) is None:
              encoded_locals['__return__'] = local

          assert len(ordered_varnames) == len(encoded_locals)
          for e in ordered_varnames:
            assert e in encoded_locals

          return dict(func_name=cur_name,
                      is_parent=(cur_frame in self.parent_frames_set),
                      frame_id=self.get_frame_id(cur_frame),
                      parent_frame_id_list=parent_frame_id_list,
                      encoded_locals=encoded_locals,
                      ordered_varnames=ordered_varnames)

        i = self.curindex

        if i > 1: 
          for v in visit_all_locally_reachable_function_objs(top_frame):
            if (v not in self.closures and \
                v not in self.globally_defined_funcs):

              chosen_parent_frame = None
              
              for (my_frame, my_lineno) in reversed(self.stack):
                if chosen_parent_frame:
                  break

                for frame_const in my_frame.f_code.co_consts:
                  if frame_const is (v.__code__ if is_python3 else v.func_code):
                    chosen_parent_frame = my_frame
                    break

              if chosen_parent_frame in self.frame_ordered_ids:
                self.closures[v] = chosen_parent_frame
                self.parent_frames_set.add(chosen_parent_frame) 
                if not chosen_parent_frame in self.zombie_frames:
                  self.zombie_frames.append(chosen_parent_frame)
          else:
            if top_frame.f_code.co_consts:
              for e in top_frame.f_code.co_consts:
                if type(e) == types.CodeType and e.co_name == '<lambda>':
                  self.lambda_closures[e] = top_frame
                  self.parent_frames_set.add(top_frame) 
                  if not top_frame in self.zombie_frames:
                    self.zombie_frames.append(top_frame)
        else:
          for (k, v) in get_user_globals(top_frame).items():
            if (type(v) in (types.FunctionType, types.MethodType) and \
                v not in self.closures):
              self.globally_defined_funcs.add(v)

        top_frame = None
        while True:
          cur_frame = self.stack[i][0]
          cur_name = cur_frame.f_code.co_name
          if cur_name == '<module>':
            break

          if cur_frame in self.frame_ordered_ids:
            encoded_stack_locals.append(create_encoded_stack_entry(cur_frame))
            if not top_frame:
                top_frame = cur_frame
          i -= 1

        zombie_encoded_stack_locals = [create_encoded_stack_entry(e) for e in zombie_frames_to_render]

        encoded_globals = {}
        cur_globals_dict = get_user_globals(tos[0], at_global_scope=(self.curindex <= 1))
        for (k, v) in cur_globals_dict.items():
          if self.should_hide_var(k):
            continue

          encoded_val = self.encoder.encode(v, self.get_parent_of_function)
          encoded_globals[k] = encoded_val

          if k not in self.all_globals_in_order:
            self.all_globals_in_order.append(k)

        ordered_globals = [e for e in self.all_globals_in_order if e in encoded_globals]
        assert len(ordered_globals) == len(encoded_globals)

        stack_to_render = [];

        if encoded_stack_locals:
          for e in encoded_stack_locals:
            e['is_zombie'] = False
            e['is_highlighted'] = False
            stack_to_render.append(e)

          stack_to_render[0]['is_highlighted'] = True

        for e in zombie_encoded_stack_locals:
          e['is_zombie'] = True
          e['is_highlighted'] = False 

          stack_to_render.append(e)

        stack_to_render.sort(key=lambda e: e['frame_id'])

        for e in stack_to_render:
          hash_str = e['func_name']
          hash_str += '_f' + str(e['frame_id'])

          if e['is_parent']:
            hash_str += '_p'

          if e['is_zombie']:
            hash_str += '_z'

          e['unique_hash'] = hash_str

        encoded_probe_vals = {}
        if self.probe_exprs:
            if top_frame: 
                top_frame_locals = get_user_locals(top_frame)
            else:
                top_frame_locals = {}
            for e in self.probe_exprs:
                try:
                    probe_val = eval(e, cur_globals_dict, top_frame_locals)
                    encoded_probe_vals[e] = self.encoder.encode(probe_val, self.get_parent_of_function)
                except:
                    pass 

        if self.show_only_outputs:
          trace_entry = dict(line=lineno,
                             event=event_type,
                             func_name=tos[0].f_code.co_name,
                             globals={},
                             ordered_globals=[],
                             stack_to_render=[],
                             heap={},
                             stdout=self.get_user_stdout())
        else:
          trace_entry = dict(line=lineno,
                             event=event_type,
                             func_name=tos[0].f_code.co_name,
                             globals=encoded_globals,
                             ordered_globals=ordered_globals,
                             stack_to_render=stack_to_render,
                             heap=self.encoder.get_heap(),
                             stdout=self.get_user_stdout())
          if encoded_probe_vals:
            trace_entry['probe_exprs'] = encoded_probe_vals

        if self.crazy_mode:
          trace_entry['column'] = frame.f_colno

          if frame.f_lasti >= 0:
            key = (frame.f_code.co_code, frame.f_lineno, frame.f_colno,frame.f_lasti)
            if key in self.bytecode_map:
              v = self.bytecode_map[key]
              trace_entry['expr_start_col'] = v.start_col
              trace_entry['expr_width'] = v.extent
              trace_entry['opcode'] = v.opcode

        if topframe_module != "__main__":
          trace_entry['custom_module_name'] = topframe_module

        if event_type == 'exception':
          exc = frame.f_locals['__exception__']
          trace_entry['exception_msg'] = exc[0].__name__ + ': ' + str(exc[1])

        append_to_trace = True
        if self.breakpoints:
          if not ((lineno in self.breakpoints) or (self.prev_lineno in self.breakpoints)):
            append_to_trace = False

          if event_type == 'exception':
            append_to_trace = True

        self.prev_lineno = lineno

        if append_to_trace:
          self.trace.append(trace_entry)

        if len(self.trace) >= MAX_EXECUTED_LINES:
          self.trace.append(dict(event='instruction_limit_reached', exception_msg='Stopped after running ' + str(MAX_EXECUTED_LINES) + ' steps. Please shorten your code,\nsince Python Tutor is not designed to handle long-running code.'))
          self.force_terminate()

        self.forget()


    def _runscript(self, script_str):
        self.executed_script = script_str
        self.executed_script_lines = self.executed_script.splitlines()

        for (i, line) in enumerate(self.executed_script_lines):
          line_no = i + 1
          
          if line.endswith(BREAKPOINT_STR) and not line.strip().startswith(BREAKPOINT_STR):
            self.breakpoints.append(line_no)

          if line.startswith(PYTUTOR_HIDE_STR):
            hide_vars = line[len(PYTUTOR_HIDE_STR):]
            hide_vars = [compileGlobMatch(e.strip()) for e in hide_vars.split(',')]
            self.vars_to_hide.update(hide_vars)

          if line.startswith(PYTUTOR_INLINE_TYPE_STR):
            listed_types = line[len(PYTUTOR_INLINE_TYPE_STR):]
            listed_types = [compileGlobMatch(e.strip()) for e in listed_types.split(',')]
            self.types_to_inline.update(listed_types)

        if self.crazy_mode:
            import super_dis
            try:
                self.bytecode_map = super_dis.get_bytecode_map(self.executed_script)
            except:
                self.bytecode_map = {}

        self._wait_for_mainpyfile = 1

        user_builtins = {}

        if type(__builtins__) is dict:
          builtin_items = __builtins__.items()
        else:
          assert type(__builtins__) is types.ModuleType
          builtin_items = []
          for k in dir(__builtins__):
            builtin_items.append((k, getattr(__builtins__, k)))

        for (k, v) in builtin_items:
          if k == 'open' and not self.allow_all_modules: 
            user_builtins[k] = open_wrapper
          elif k in BANNED_BUILTINS:
            user_builtins[k] = create_banned_builtins_wrapper(k)
          elif k == '__import__' and not self.allow_all_modules:
            user_builtins[k] = __restricted_import__
          else:
            if k == 'raw_input':
              user_builtins[k] = raw_input_wrapper
            elif k == 'input':
              if is_python3:
                user_builtins[k] = raw_input_wrapper
              else:
                user_builtins[k] = python2_input_wrapper
            else:
              user_builtins[k] = v

        user_builtins['mouse_input'] = mouse_input_wrapper

        if self.separate_stdout_by_module:
          self.stdout_by_module["__main__"] = StringIO.StringIO()
          if self.custom_modules:
            for module_name in self.custom_modules:
              self.stdout_by_module[module_name] = StringIO.StringIO()
          self.stdout_by_module["<other>"] = StringIO.StringIO() 
          sys.stdout = self.stdout_by_module["<other>"] 
        else:
          self.user_stdout = StringIO.StringIO()
          sys.stdout = self.user_stdout

        self.ORIGINAL_STDERR = sys.stderr

        user_globals = {}

        if self.custom_modules:
            for mn in self.custom_modules:
                new_m = types.ModuleType(mn)
                exec(self.custom_modules[mn], new_m.__dict__) 
                user_globals.update(new_m.__dict__)

        user_globals.update({"__name__"    : "__main__",
                             "__builtins__" : user_builtins})

        try:
          if self.allow_all_modules:
            import ast
            try:
              all_modules_to_preimport = []
              tree = ast.parse(script_str)
              for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                  for n in node.names:
                    all_modules_to_preimport.append(n.name)
                elif isinstance(node, ast.ImportFrom):
                  all_modules_to_preimport(node.module)

              for m in all_modules_to_preimport:
                if m in script_str: 
                  try:
                    __import__(m)
                  except ImportError:
                    pass
            except:
              pass

          if resource_module_loaded and (not self.disable_security_checks):
            assert not self.allow_all_modules 

            for m in ALLOWED_STDLIB_MODULE_IMPORTS:
              if m in script_str: 
                try:
                  __import__(m)
                except ImportError:
                  pass

            resource.setrlimit(resource.RLIMIT_AS, (200000000, 200000000))
            resource.setrlimit(resource.RLIMIT_CPU, (5, 5))

            resource.setrlimit(resource.RLIMIT_NOFILE, (0, 0)) 

            for a in dir(sys.modules['posix']):
              delattr(sys.modules['posix'], a)
            for a in dir(sys.modules['os']):
              if a not in ('path', 'stat'):
                delattr(sys.modules['os'], a)
            import gc
            for a in dir(sys.modules['gc']):
              delattr(sys.modules['gc'], a)
            del sys.modules['gc']

            del sys.modules['os']
            del sys.modules['os.path']
            del sys.modules['sys']

          self.run(script_str, user_globals, user_globals)
        except SystemExit:
          raise bdb.BdbQuit
        except:
          if DEBUG:
            traceback.print_exc()

          trace_entry = dict(event='uncaught_exception')

          (exc_type, exc_val, exc_tb) = sys.exc_info()
          if hasattr(exc_val, 'lineno'):
            trace_entry['line'] = exc_val.lineno
          if hasattr(exc_val, 'offset'):
            trace_entry['offset'] = exc_val.offset

          trace_entry['exception_msg'] = type(exc_val).__name__ + ": " +  str(exc_val)

          already_caught = False
          for e in self.trace:
            if e['event'] == 'exception':
              already_caught = True
              break

          if not already_caught:
            if not self.done:
              self.trace.append(trace_entry)

          raise bdb.BdbQuit 


    def force_terminate(self):
      raise bdb.BdbQuit 


    def finalize(self):
      sys.stdout = self.GAE_STDOUT 
      sys.stderr = self.ORIGINAL_STDERR

      assert len(self.trace) <= (MAX_EXECUTED_LINES + 1)

      res = self.trace

      if len(res) >= 2 and \
         res[-2]['event'] == 'exception' and \
         res[-1]['event'] == 'return' and res[-1]['func_name'] == '<module>':
        res.pop()

      self.trace = res

      if self.custom_modules:
        return self.finalizer_func(dict(main_code=self.executed_script,
                                        custom_modules=self.custom_modules),
                                   self.trace)
      else:
        return self.finalizer_func(self.executed_script, self.trace)


import json

def exec_script_str(script_str, raw_input_lst_json, options_json, finalizer_func):
  if options_json:
    options = json.loads(options_json)
  else:
    options = {'cumulative_mode': False,
               'heap_primitives': False, 'show_only_outputs': False}

  py_crazy_mode = ('py_crazy_mode' in options and options['py_crazy_mode'])

  logger = PGLogger(options['cumulative_mode'], options['heap_primitives'], options['show_only_outputs'], finalizer_func,
                    crazy_mode=py_crazy_mode)

  global input_string_queue
  input_string_queue = []
  if raw_input_lst_json:
    input_string_queue = [str(e) for e in json.loads(raw_input_lst_json)]

  try:
    logger._runscript(script_str)
  except bdb.BdbQuit:
    pass
  finally:
    logger.finalize()


def exec_script_str_local(script_str, raw_input_lst_json, cumulative_mode, heap_primitives, finalizer_func,
                          probe_exprs=None, allow_all_modules=False):
  logger = PGLogger(cumulative_mode, heap_primitives, False, finalizer_func,
                    disable_security_checks=True,
                    allow_all_modules=allow_all_modules,
                    probe_exprs=probe_exprs)

  global input_string_queue
  input_string_queue = []
  if raw_input_lst_json:
    input_string_queue = [str(e) for e in json.loads(raw_input_lst_json)]

  try:
    logger._runscript(script_str)
  except bdb.BdbQuit:
    pass
  finally:
    return logger.finalize()