const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const executeJavaTrace = async (sourceCode, customInput) => {
    const executionId = crypto.randomUUID();
    const tempDir = path.join(os.tmpdir(), 'doodle-trace-java', executionId);
    
    await fs.mkdir(tempDir, { recursive: true });
    
    const sourcePath = path.join(tempDir, 'Main.java');
    const outPath = path.join(tempDir, 'trace.json');
    const tracerSourcePath = path.join(__dirname, 'JavaTracer.java');
    const tracerClassPath = path.join(__dirname, 'JavaTracer.class'); 
    
    await fs.writeFile(sourcePath, sourceCode);

    if (customInput && customInput.trim() !== "") {
        await fs.writeFile(path.join(tempDir, 'input.txt'), customInput);
    }

    try {
        const { existsSync } = require('fs');
        if (!existsSync(tracerClassPath)) {
            await new Promise((resolve, reject) => {
                exec(`javac "${tracerSourcePath}"`, (err, stdout, stderr) => {
                    if (err) reject({ error: "Tracer Compilation Error", details: stderr || err.message });
                    else resolve();
                });
            });
        }
    } catch (e) {
        throw e;
    }

    const compileUserCmd = `javac -g "${sourcePath}"`;
    const runTracerCmd = `java -cp "${__dirname}" JavaTracer "${sourcePath}" "${outPath}"`;

    try {
        await new Promise((resolve, reject) => {
            exec(compileUserCmd, { timeout: 5000 }, (err, stdout, stderr) => {
                if (err) reject({ error: "User Code Compilation Error", details: stderr || err.message || stdout });
                else resolve();
            });
        });

        await new Promise((resolve, reject) => {
            // Timeout thoda bada kar diya for DP / N-Queens
            exec(runTracerCmd, { timeout: 20000 }, (err, stdout, stderr) => {
                const { existsSync } = require('fs');
                if (existsSync(outPath)) resolve();
                else reject({ error: "Execution Timeout/Crash", details: stderr || err.message || stdout });
            });
        });

        const traceData = await fs.readFile(outPath, 'utf8');
        let parsedOutput;
        try {
            parsedOutput = JSON.parse(traceData);
        } catch (parseErr) {
            throw { 
                error: "JSON Parse Error", 
                details: "Failed at: " + parseErr.message, 
                // DIAGNOSTIC FIX: Ab tujhe exact corrupt JSON string dikhegi
                raw_json: traceData.length > 1000 ? "... " + traceData.substring(traceData.length - 1000) : traceData
            };
        }

        await fs.rm(tempDir, { recursive: true, force: true }).catch(()=>{});
        return parsedOutput;
        
    } catch (err) {
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
        throw {
            error: err.error || "Execution Error",
            details: err.details || "Unknown Java Tracer Crash",
            raw_json: err.raw_json || ""
        };
    }
};

module.exports = { executeJavaTrace };