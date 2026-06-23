const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const executePythonTrace = async (sourceCode) => {
    const executionId = crypto.randomUUID();
    const tempDir = path.join(os.tmpdir(), 'doodle-trace-py', executionId);
    
    await fs.mkdir(tempDir, { recursive: true });
    
    const sourcePath = path.join(tempDir, 'main.py');
    const tracerPath = path.join(__dirname, 'generate_json_trace.py');

    await fs.writeFile(sourcePath, sourceCode);

    const command = `python "${tracerPath}" "${sourcePath}"`;

    return new Promise((resolve, reject) => {
        exec(command, { maxBuffer: 1024 * 1024 * 50, timeout: 15000 }, async (error, stdout, stderr) => {
            await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});

            if (error && !stdout.trim().startsWith('{')) {
                return reject({
                    error: "Python Execution Error",
                    details: stderr || error.message || "Unknown error occurred"
                });
            }

            try {
                const parsedOutput = JSON.parse(stdout);
                resolve(parsedOutput);
            } catch (parseError) {
                reject({
                    error: "JSON Parse Error",
                    details: "Python tracer returned invalid JSON",
                    stdout_dump: stdout
                });
            }
        });
    });
};

module.exports = { executePythonTrace };