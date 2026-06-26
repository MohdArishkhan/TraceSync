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
    
    await fs.writeFile(sourcePath, sourceCode);

    // Track if input exists to pass it to the Java command later
    let hasCustomInput = false;
    const inputPath = path.join(tempDir, 'input.txt');
    if (customInput && customInput.trim() !== "") {
        await fs.writeFile(inputPath, customInput);
        hasCustomInput = true;
    }

    try {
        await new Promise((resolve, reject) => {
            exec(`javac "${tracerSourcePath}"`, (err, stdout, stderr) => {
                if (err) reject({ error: "Tracer Compilation Error", details: stderr || err.message });
                else resolve();
            });
        });

        const compileUserCmd = `javac -g "${sourcePath}"`;
        
        // Piping input.txt to the Java Tracer if custom input exists
        const runTracerCmd = `java -cp "${__dirname}" JavaTracer "${sourcePath}" "${outPath}"` + 
                             (hasCustomInput ? ` < "${inputPath}"` : "");

        await new Promise((resolve, reject) => {
            exec(compileUserCmd, { timeout: 5000 }, (err, stdout, stderr) => {
                if (err) reject({ error: "User Code Compilation Error", details: stderr || err.message || stdout });
                else resolve();
            });
        });

        await new Promise((resolve, reject) => {
            // Node timeout 25s so Java gets 20s to finish properly and save JSON
            exec(runTracerCmd, { timeout: 25000, maxBuffer: 1024 * 1024 * 50 }, (err, stdout, stderr) => {
                const { existsSync } = require('fs');
                if (existsSync(outPath)) {
                    resolve();
                } else {
                    reject({ error: "Execution Timeout/Crash", details: stderr || (err ? err.message : "") || stdout });
                }
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
                raw_json: traceData.length > 1000 ? "... " + traceData.substring(traceData.length - 1000) : traceData
            };
        }

        return parsedOutput;
        
    } catch (err) {
        throw {
            error: err.error || "Execution Error",
            details: err.details || "Unknown Java Tracer Crash",
            raw_json: err.raw_json || ""
        };
    } finally {
        // ALWAYS cleans up the temp dir, regardless of success or failure
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
};

module.exports = { executeJavaTrace };