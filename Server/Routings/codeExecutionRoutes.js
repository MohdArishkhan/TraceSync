const express = require("express");
const axios = require("axios");
const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const os = require("os");
const { executeCppTrace } = require("../Services/TracerEngine/Cpp/Run_cpp");
const { executeSqlTrace } = require('../Services/TracerEngine/Sql/Run_sql');
const { executeJsTrace } = require('../Services/TracerEngine/Javascript/Run_js');
const { executePythonTrace } = require('../Services/TracerEngine/Python/Run_python');
const { executeJavaTrace } = require('../Services/TracerEngine/Java/Run_java');
const router = express.Router();

const JDOODLE_CLIENT_ID = process.env.JDOODLE_CLIENT_ID;
const JDOODLE_CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET;

const LANGUAGE_MAP = {
  javascript: { language: "nodejs", versionIndex: "4" },
  python: { language: "python3", versionIndex: "4" },
  java: { language: "java", versionIndex: "4" },
  cpp: { language: "cpp17", versionIndex: "1" },
  c: { language: "c", versionIndex: "5" },
  csharp: { language: "csharp", versionIndex: "4" },
  php: { language: "php", versionIndex: "4" },
  go: { language: "go", versionIndex: "4" },
  rust: { language: "rust", versionIndex: "4" },
  ruby: { language: "ruby", versionIndex: "4" },
  sql: { language: "sql", versionIndex: "1" },
  typescript: { language: "typescript", versionIndex: "4" },
};

const DANGEROUS_CPP_PATTERNS = [
  /system\s*\(/i, /popen\s*\(/i, /exec[a-z]*\s*\(/i, /syscall\s*\(/i,
  /fork\s*\(/i, /vfork\s*\(/i, /clone\s*\(/i, /kill\s*\(/i, /raise\s*\(/i,
  /<fstream>/i, /ifstream/i, /ofstream/i, /fstream/i, /fopen\s*\(/i, 
  /freopen\s*\(/i, /remove\s*\(/i, /rename\s*\(/i, /mkdir\s*\(/i, /rmdir\s*\(/i,
  /<sys\/socket\.h>/i, /<arpa\/inet\.h>/i, /<netdb\.h>/i, /<windows\.h>/i, 
  /<winsock2\.h>/i, /socket\s*\(/i, /bind\s*\(/i, /connect\s*\(/i, /listen\s*\(/i,
  /<thread>/i, /pthread/i, /mmap\s*\(/i, /mprotect\s*\(/i,
  /#include\s*["<](\.\.|\/|\\\\)/i, /#pragma/i
];

const DANGEROUS_JAVA_PATTERNS = [
  /\bRuntime\.getRuntime\(\)\.exec\b/, /\bProcessBuilder\b/,
  /\bjava\.io\.(File|FileInputStream|FileOutputStream|RandomAccessFile|FileReader|FileWriter)\b/,
  /\bjava\.nio\.file\b/,
  /\bjava\.net\.(Socket|ServerSocket|URL|URLConnection|HttpURLConnection|DatagramSocket)\b/,
  /\bjava\.lang\.reflect\b/, /\bClass\.forName\b/, /\bMethod\.invoke\b/,
  /\bSystem\.exit\b/, /\bSystem\.loadLibrary\b/, /\bSystem\.setProperty\b/, /\bSecurityManager\b/
];

const isSecure = (code, patterns) => {
  for (const pattern of patterns) {
    if (pattern.test(code)) return { safe: false, match: pattern.source };
  }
  return { safe: true };
};

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Code execution service is running" });
});

router.post("/execute", async (req, res) => {
  try {
    const { language, code, stdin } = req.body;
    
    if (!code || !language) return res.status(400).json({ status: 0, error: "Code and language are required" });
    if (!JDOODLE_CLIENT_ID || !JDOODLE_CLIENT_SECRET) return res.status(500).json({ status: 0, error: "JDoodle credentials not configured." });

    const languageConfig = LANGUAGE_MAP[language];
    if (!languageConfig) return res.status(400).json({ status: 0, error: `Language '${language}' not supported.` });

    const response = await axios.post("https://api.jdoodle.com/v1/execute", {
      clientId: JDOODLE_CLIENT_ID,
      clientSecret: JDOODLE_CLIENT_SECRET,
      script: code,
      language: languageConfig.language,
      versionIndex: languageConfig.versionIndex,
      stdin: stdin || "",
    }, { headers: { "Content-Type": "application/json" }, timeout: 30000 });

    const result = response.data;
    res.status(200).json({
      status: 1,
      data: {
        language: languageConfig.language,
        output: result.output || "",
        stdout: result.output || "",
        stderr: result.error || "",
        memory: result.memory || null,
        cpuTime: result.cpuTime || null,
        statusCode: result.statusCode,
        isExecuteSuccess: result.isExecuteSuccess !== undefined ? result.isExecuteSuccess : true,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 0, error: error.message || "Failed to execute code", details: error.response?.data || error.message });
  }
});

// router.post("/trace-py", (req, res) => {
//   const { language, code } = req.body;
//   if (!code || language !== "python") return res.status(400).json({ error: "Only Python language is supported for tracing." });

//   const fileId = crypto.randomBytes(8).toString("hex");
//   const tempFilePath = path.join(os.tmpdir(), `temp_${fileId}.py`);
//   const tracerScriptPath = path.join(__dirname, "../Services/TracerEngine/Python/generate_json_trace.py");

//   fs.writeFileSync(tempFilePath, code);
//   const pythonProcess = spawn("python", [tracerScriptPath, tempFilePath]);

//   let traceData = "";
//   let errorData = "";

//   pythonProcess.stdout.on("data", (data) => traceData += data.toString());
//   pythonProcess.stderr.on("data", (data) => errorData += data.toString());

//   pythonProcess.on("close", (codeStatus) => {
//     if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
//     if (codeStatus !== 0) return res.status(500).json({ error: "Execution failed", details: errorData });
    
//     try {
//       res.status(200).json({ trace: JSON.parse(traceData) });
//     } catch (parseError) {
//       res.status(500).json({ error: "Failed to parse trace data", raw: traceData });
//     }
//   });
// });
router.post("/trace-py", (req, res) => {
  const { language, code } = req.body;
  if (!code || language !== "python") {
      return res.status(400).json({ error: "Only Python language is supported for tracing." });
  }

  const fileId = crypto.randomBytes(8).toString("hex");
  const tempFilePath = path.join(os.tmpdir(), `temp_${fileId}.py`);
  const tracerScriptPath = path.join(__dirname, "../Services/TracerEngine/Python/generate_json_trace.py");

  fs.writeFileSync(tempFilePath, code);
  const pythonProcess = spawn("python", [tracerScriptPath, tempFilePath]);

  let traceData = "";
  let errorData = "";

  pythonProcess.stdout.on("data", (data) => traceData += data.toString());
  pythonProcess.stderr.on("data", (data) => errorData += data.toString());

  pythonProcess.on("close", (codeStatus) => {
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    
    if (codeStatus !== 0) {
        return res.status(500).json({ 
            error: "Python Execution Error", 
            details: errorData 
        });
    }
    
    try {
      const parsedData = JSON.parse(traceData);
      
      // FIX: Direct parsedData return karna hai, { trace: parsedData } nahi.
      // Isse format exact { code: "...", trace: [...] } jayega.
      res.status(200).json(parsedData); 
      
    } catch (parseError) {
      res.status(500).json({ 
          error: "Failed to parse trace data", 
          raw: traceData 
      });
    }
  });
});

// router.post("/trace-js", (req, res) => {
//   const { code } = req.body;
//   if (!code || !code.trim()) return res.status(400).json({ error: "No code provided" });

//   const fileId = crypto.randomBytes(8).toString("hex");
//   const tempFilePath = path.join(os.tmpdir(), `temp_${fileId}.js`);
//   const jsTracerPath = path.join(__dirname, "../Services/TracerEngine/Javascript/jslogger.js");

//   if (!fs.existsSync(jsTracerPath)) return res.status(500).json({ error: "Tracer engine not found" });

//   try {
//     fs.writeFileSync(tempFilePath, code);
//   } catch (err) {
//     return res.status(500).json({ error: "Failed to write temp file" });
//   }

//   const jsProcess = spawn("node", [jsTracerPath, tempFilePath]);
//   let output = "";
//   let errorOutput = "";

//   jsProcess.stdout.on("data", (data) => output += data.toString());
//   jsProcess.stderr.on("data", (data) => errorOutput += data.toString());

//   jsProcess.on("error", (err) => {
//     if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
//     if (!res.headersSent) res.status(500).json({ error: "Failed to start tracer", details: err.message });
//   });

//   jsProcess.on("close", (codeStatus) => {
//     if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
//     if (res.headersSent) return;
//     if (codeStatus !== 0) return res.status(500).json({ error: "JS Trace Failed", details: errorOutput });
    
//     try {
//       const jsonStartIndex = output.indexOf('[');
//       if (jsonStartIndex === -1) throw new Error("No JSON array found");
//       res.status(200).json({ trace: JSON.parse(output.substring(jsonStartIndex)) });
//     } catch (err) {
//       res.status(500).json({ error: "Invalid output", raw: output });
//     }
//   });
// });
router.post('/trace-js', async (req, res) => {
    const { code } = req.body;
    
    try {
        // Seedha wrapper call hoga
        const traceResult = await executeJsTrace(code);
        return res.status(200).json(traceResult);
    } catch (error) {
        console.error("Trace Route Error:", error);
        return res.status(500).json(error);
    }
});

// router.post("/trace-cpp", async (req, res) => {
//   const { code } = req.body;
  
//   if (!code || !code.trim()) {
//     return res.status(400).json({ error: "No code provided" });
//   }

//   const securityCheck = isSecure(code, DANGEROUS_CPP_PATTERNS);
//   if (!securityCheck.safe) {
//     return res.status(403).json({ 
//       error: "Security Check Failed", 
//       details: `Blocked pattern: ${securityCheck.match}` 
//     });
//   }

//   try {
//     const parsedTrace = await executeCppTrace(code);
//     return res.status(200).json({ trace: parsedTrace.trace || parsedTrace });
//   } catch (err) {
//     return res.status(500).json({ 
//       error: "Execution Error", 
//       details: err.stderr || err.message || "Unknown error occurred" 
//     });
//   }
// });

router.post('/trace-cpp', async (req, res) => {
    const { code, customInput } = req.body;
    
    try {
        const traceResult = await executeCppTrace(code, customInput);
        return res.status(200).json(traceResult);
    } catch (error) {
        console.error("C++ Tracer Crash Details:", error);
        return res.status(500).json({
            error: error.error || "C++ Execution Error",
            details: error.details || String(error)
        });
    }
});

router.post('/trace-java', async (req, res) => {
    const { code, customInput } = req.body;
    try {
        const traceResult = await executeJavaTrace(code, customInput);
        return res.status(200).json(traceResult);
    } catch (error) {
        return res.status(500).json(error);
    }
});



// router.post("/trace-java", (req, res) => {
//   const { code } = req.body;
//   if (!code || !code.trim()) return res.status(400).json({ error: "No code provided" });

//   const securityCheck = isSecure(code, DANGEROUS_JAVA_PATTERNS);
//   if (!securityCheck.safe) return res.status(403).json({ error: "Security Check Failed", details: `Blocked pattern: ${securityCheck.match}` });

//   const fileId = crypto.randomBytes(8).toString("hex");
//   const tempDirPath = path.join(os.tmpdir(), `temp_java_${fileId}`);
//   const tempFilePath = path.join(tempDirPath, "Main.java");

//   try {
//     fs.mkdirSync(tempDirPath, { recursive: true });
//     fs.writeFileSync(tempFilePath, code);
//   } catch (err) {
//     return res.status(500).json({ error: "Memory allocation failed" });
//   }

//   // Windows lock bypass with retries
//   const cleanup = () => { 
//     try {
//       if (fs.existsSync(tempDirPath)) {
//         fs.rmSync(tempDirPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
//       }
//     } catch (err) {
//       console.error("[DEBUG] Cleanup failed but server protected:", err.message);
//     }
//   };

//   const compileProcess = spawnSync("javac", [tempFilePath]);
//   if (compileProcess.status !== 0) {
//     cleanup();
//     return res.status(400).json({ error: "Compilation Error", details: compileProcess.stderr.toString() });
//   }

//   const engineDir = path.resolve(__dirname, "../Services/TracerEngine/Java");
//   const classPath = [
//       path.join(engineDir, "Lib", "gson.jar"), 
//       path.join(engineDir, "Lib", "javax.json-1.1.4.jar"), 
//       engineDir,
//       tempDirPath 
//     ].join(path.delimiter);

//   const javaProcess = spawn("java", [
//     "-cp", classPath, 
//     "traceprinter.InMemory", 
//     "Main"
//   ], {
//     cwd: tempDirPath,
//     timeout: 15000, // Adjusted to match python tutor's internal limit
//     maxBuffer: 1024 * 1024 * 10 
//   });

//   const jsonInput = JSON.stringify({
//       usercode: code,
//       code: code,
//       script: code,
//       stdin: "",       
//       options: {},     
//       args: [],        
//       className: "Main"
//   });
  
//   javaProcess.stdin.write(jsonInput);
//   javaProcess.stdin.end();

//   let output = "";
//   let errorOutput = "";

//   javaProcess.stdout.on("data", (data) => output += data.toString());
//   javaProcess.stderr.on("data", (data) => errorOutput += data.toString());

//   javaProcess.on("error", (err) => {
//     cleanup();
//     if (!res.headersSent) res.status(500).json({ error: "Engine failed", details: err.message });
//   });

//   javaProcess.on("close", (codeStatus, signal) => {
//     cleanup();
//     if (res.headersSent) return;
    
//     try {
//       const jsonStartIndex = output.indexOf('{');
//       if (jsonStartIndex !== -1) {
//         const parsedTrace = JSON.parse(output.substring(jsonStartIndex));
//         return res.status(200).json({ trace: parsedTrace.trace || parsedTrace });
//       }
//     } catch (err) {
//       console.error("[DEBUG] Failed to parse output directly, moving to fallback.");
//     }

//     if (signal === "SIGTERM" || signal === "SIGKILL") {
//       return res.status(408).json({ error: "Execution Timeout", details: "Process hung or took too long." });
//     }
    
//     if (codeStatus !== 0) {
//       return res.status(500).json({ error: "Execution Error", details: errorOutput });
//     }

//     res.status(500).json({ error: "Unexpected Error: No output generated." });
//   });
// });

// // ============================================================================
// // ROUTE: SQL Tracer (SQL Query Execution and Trace)
// // ============================================================================
router.post('/trace-sql', (req, res) => {
    const { setupSql, querySql, tables } = req.body;
    
    try {
        const traceResult = executeSqlTrace(setupSql, querySql, tables);
        return res.status(200).json({ trace: traceResult });
    } catch (error) {
        return res.status(500).json(error);
    }
});
module.exports = router;