const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const os = require('os');

// Modification 1: Added customInput parameter
const executeJsTrace = async (sourceCode, customInput) => {
    const executionId = crypto.randomUUID();
    
    const tempDir = path.join(os.tmpdir(), 'code-doodle-traces', executionId);
    
    await fs.mkdir(tempDir, { recursive: true });
    
    const sourcePath = path.join(tempDir, 'main.js');
    const outPath = path.join(tempDir, 'trace.json');
    const tracerScriptPath = path.join(__dirname, 'jslogger.js'); 

    await fs.writeFile(sourcePath, sourceCode);

    // Modification 2: Write custom input to a file for JS tests if provided
    if (customInput && customInput.trim() !== "") {
        await fs.writeFile(path.join(tempDir, 'input.txt'), customInput);
    }

    const runCmd = `node "${tracerScriptPath}" "${sourcePath}" "${outPath}"`;

    try {
        await new Promise((resolve, reject) => {
            // Modification 3: Increased timeout to 20s and added maxBuffer (50MB)
            exec(runCmd, { timeout: 20000, maxBuffer: 1024 * 1024 * 50 }, (error, stdout, stderr) => {
                const { existsSync } = require('fs');
                if (existsSync(outPath)) {
                    resolve();
                } else {
                    reject({ error, stderr, stdout });
                }
            });
        });

        const traceData = await fs.readFile(outPath, 'utf8');
        const parsedOutput = JSON.parse(traceData);

        await fs.rm(tempDir, { recursive: true, force: true }).catch(()=>{});
        
        return parsedOutput;
        
    } catch (err) {
        console.error("EXACT TRACER CRASH DETAILS:", err);
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
        throw {
            error: "Execution Error",
            details: err.stderr || (err.error && err.error.message) || err.message || "Trace JSON file missing",
            stdout_dump: err.stdout || ""
        };
    }
};

module.exports = { executeJsTrace };