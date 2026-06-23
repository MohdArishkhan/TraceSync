const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

function instrumentCode(code) {
  const ast = parser.parse(code, { sourceType: "module" });

  traverse(ast, {
    Function(path) {
      const funcName = path.node.id ? path.node.id.name : 'anonymous';
      if (t.isBlockStatement(path.node.body)) {
        const enterNode = t.expressionStatement(t.callExpression(t.identifier('__enter_frame__'), [t.stringLiteral(funcName)]));
        enterNode._isTracerInjected = true;
        path.get('body').unshiftContainer('body', enterNode);

        path.traverse({
          ReturnStatement(retPath) {
            if (retPath.getFunctionParent() === path && !retPath.node._isTracerInjected) {
              const retExpr = retPath.node.argument || t.identifier('undefined');
              const retVar = retPath.scope.generateUidIdentifier("ret_val");
              const varDecl = t.variableDeclaration("const", [t.variableDeclarator(retVar, retExpr)]);
              const setRet = t.expressionStatement(t.callExpression(t.identifier('__set_return__'), [retVar]));
              const exitNode = t.expressionStatement(t.callExpression(t.identifier('__exit_frame__'), []));
              const newRet = t.returnStatement(retVar);
              newRet._isTracerInjected = true;
              retPath.replaceWithMultiple([varDecl, setRet, exitNode, newRet]);
            }
          }
        });

        const exitNode = t.expressionStatement(t.callExpression(t.identifier('__exit_frame__'), []));
        exitNode._isTracerInjected = true;
        path.get('body').pushContainer('body', exitNode);
      }
    },

    Statement(path) {
      if (path.isBlockStatement() || path.isFunctionDeclaration()) return;
      if (path.node._isTracerInjected) return;
      if (!path.node.loc) return;

      const bindings = path.scope.getAllBindings();
      const localProps = [];
      const globalProps = [];

      for (const [name, binding] of Object.entries(bindings)) {
        if (name.startsWith('__') || name.startsWith('_ret_val') || ['require', 'module', 'exports', 'console'].includes(name)) continue;

        const isGlobal = binding.scope.type === 'Program';
        const valueThunk = t.arrowFunctionExpression([], t.identifier(name));
        const prop = t.objectProperty(
          t.identifier(name),
          t.callExpression(t.identifier('__safe__'), [valueThunk])
        );

        if (isGlobal) globalProps.push(prop);
        else localProps.push(prop);
      }

      const tracePoint = t.expressionStatement(
        t.callExpression(t.identifier('__trace__'), [
          t.numericLiteral(path.node.loc.start.line),
          t.objectExpression(localProps),
          t.objectExpression(globalProps)
        ])
      );
      tracePoint._isTracerInjected = true;
      path.insertBefore(tracePoint);
    }
  });

  return generate(ast).code;
}

const filePath = process.argv[2];
const outPath = process.argv[3] || 'output.json';

if (!filePath) process.exit(1);

const userCode = fs.readFileSync(filePath, 'utf8');
let instrumented = "";
try {
  instrumented = instrumentCode(userCode);
} catch(e) {
  fs.writeFileSync(outPath, JSON.stringify({ code: userCode, trace: [{ line: 1, event: 'exception', exception_msg: String(e) }] }));
  process.exit(0);
}

let traceJsonString = "[";
let isFirstStep = true;
const stack = [];
const trackedObjects = new Set();
const objMap = new Map();
let objId = 1;
const MAX_STEPS = 2000;
let stepCount = 0;
let lastLine = 1;
let lastGlobals = {};
let lastOrderedGlobals = [];
let capturedOutput = "";
const originalConsoleLog = console.log;

function checkStepLimit() {
  stepCount++;
  if (stepCount > MAX_STEPS) throw new Error("MAX_STEPS_EXCEEDED");
}

global.__safe__ = (fn) => {
  try { return fn(); } catch (e) { return undefined; }
};

function encodeObj(val) {
  if (val === null || val === undefined) return String(val);
  if (typeof val === 'number') {
    if (Number.isNaN(val)) return ['SPECIAL_FLOAT', 'NaN'];
    if (val === Infinity) return ['SPECIAL_FLOAT', 'Infinity'];
    if (val === -Infinity) return ['SPECIAL_FLOAT', '-Infinity'];
    return val;
  }
  if (typeof val === 'string' || typeof val === 'boolean') return val;
  if (typeof val === 'function') return ['JS_FUNCTION', val.name || 'anonymous', ''];

  if (typeof val === 'object') {
    if (!objMap.has(val)) {
      objMap.set(val, objId++);
      trackedObjects.add(val);
    }
    return ['REF', objMap.get(val)];
  }
  return String(val);
}

function snapshotHeap() {
  const currentHeap = {};
  for (let obj of trackedObjects) {
    const id = objMap.get(obj);
    if (Array.isArray(obj)) {
      currentHeap[id] = ['LIST', ...obj.map(encodeObj)];
    } else {
      const className = (obj.constructor && obj.constructor.name !== 'Object') ? obj.constructor.name : '';
      const entries = [];
      for (let k in obj) {
        try { entries.push([k, encodeObj(obj[k])]); } catch (e) {}
      }
      if (className) currentHeap[id] = ['INSTANCE', className, ...entries];
      else currentHeap[id] = ['DICT', ...entries];
    }
  }
  return currentHeap;
}

console.log = (...args) => {
  capturedOutput += args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" ") + "\n";
};

global.__enter_frame__ = (funcName) => {
  checkStepLimit();
  stack.push({
    func_name: funcName,
    is_parent: false,
    frame_id: stack.length + 1,
    parent_frame_id_list: [],
    encoded_locals: {},
    ordered_varnames: [],
    is_highlighted: true,
    is_zombie: false,
    unique_hash: `${funcName}_f${stack.length + 1}`,
    just_entered: true
  });
};

global.__exit_frame__ = () => { stack.pop(); };

global.__set_return__ = (val) => {
  checkStepLimit();
  if (stack.length > 0) {
    const currentFrame = stack[stack.length - 1];
    currentFrame.encoded_locals['__return__'] = encodeObj(val);
    if (!currentFrame.ordered_varnames.includes('__return__')) {
      currentFrame.ordered_varnames.push('__return__');
    }
    const stepData = {
      line: lastLine,
      event: 'return',
      func_name: currentFrame.func_name,
      globals: lastGlobals,
      ordered_globals: lastOrderedGlobals,
      stack_to_render: JSON.parse(JSON.stringify(stack)),
      heap: snapshotHeap(),
      stdout: capturedOutput
    };
    if (!isFirstStep) traceJsonString += ",";
    traceJsonString += JSON.stringify(stepData);
    isFirstStep = false;
  }
};

global.__trace__ = (line, localsObj, globalsObj) => {
  checkStepLimit();
  lastLine = line;
  const encodedLocals = {};
  const orderedLocals = [];
  for (let k in localsObj) {
    if (localsObj[k] !== undefined) {
      encodedLocals[k] = encodeObj(localsObj[k]);
      orderedLocals.push(k);
    }
  }

  const encodedGlobals = {};
  const orderedGlobals = [];
  for (let k in globalsObj) {
    if (globalsObj[k] !== undefined) {
      encodedGlobals[k] = encodeObj(globalsObj[k]);
      orderedGlobals.push(k);
    }
  }
  lastGlobals = encodedGlobals;
  lastOrderedGlobals = orderedGlobals;

  let eventType = 'step_line';
  if (stack.length > 0) {
    const currentFrame = stack[stack.length - 1];
    currentFrame.encoded_locals = encodedLocals;
    currentFrame.ordered_varnames = orderedLocals;
    if (currentFrame.just_entered) {
      eventType = 'call';
      currentFrame.just_entered = false;
    }
  }

  const stepData = {
    line: line,
    event: eventType,
    func_name: stack.length > 0 ? stack[stack.length - 1].func_name : '<module>',
    globals: encodedGlobals,
    ordered_globals: orderedGlobals,
    stack_to_render: JSON.parse(JSON.stringify(stack)),
    heap: snapshotHeap(),
    stdout: capturedOutput
  };

  if (!isFirstStep) traceJsonString += ",";
  traceJsonString += JSON.stringify(stepData);
  isFirstStep = false;
};

try {
  eval(instrumented);

  // Success Block - agar limit hit kiye bina code successfully chal gaya
  const finalStepData = {
    line: lastLine,
    event: 'return',
    func_name: '<module>',
    globals: lastGlobals,
    ordered_globals: lastOrderedGlobals,
    stack_to_render: JSON.parse(JSON.stringify(stack)),
    heap: snapshotHeap(),
    stdout: capturedOutput 
  };
  
  if (!isFirstStep) traceJsonString += ",";
  traceJsonString += JSON.stringify(finalStepData);

} catch (e) {
  // Yahan se humne snapshotHeap() aur complex logic hata diya hai taaki yahan kabhi error na aaye
  const errorStr = (e && e.message) ? e.message : String(e);

  if (errorStr.includes("MAX_STEPS_EXCEEDED")) {
    const limitStepData = {
      event: "instruction_limit_reached",
      exception_msg: `Stopped after running ${MAX_STEPS} steps. Execution limit reached to prevent freezing.`
    };
    if (!isFirstStep) traceJsonString += ",";
    traceJsonString += JSON.stringify(limitStepData);
    
    // Tere console mein bhi bata dega ki limit pakdi gayi
    console.error("Backend Log: Graceful limit exit applied."); 
  } else {
    // Normal coding errors (like syntax error, reference error) ke liye
    const errorStepData = {
      line: lastLine,
      event: 'exception',
      exception_msg: "Runtime Error: " + errorStr,
      func_name: '<module>',
      globals: lastGlobals,
      // Fallback empty render to prevent crash
      stack_to_render: [], 
      heap: {},
      stdout: capturedOutput
    };
    if (!isFirstStep) traceJsonString += ",";
    traceJsonString += JSON.stringify(errorStepData);
  }
}

console.log = originalConsoleLog;
traceJsonString += "]";
const finalOutput = `{"code": ${JSON.stringify(userCode)}, "trace": ${traceJsonString}}`;
fs.writeFileSync(outPath, finalOutput);