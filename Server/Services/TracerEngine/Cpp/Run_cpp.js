// const { exec } = require('child_process');
// const fs = require('fs').promises;
// const path = require('path');
// const crypto = require('crypto');

// const executeCppTrace = async (sourceCode) => {
//     const executionId = crypto.randomUUID();
//     const tempDir = path.join(__dirname, 'temp', executionId);
    
//     await fs.mkdir(tempDir, { recursive: true });
    
//     const sourcePath = path.join(tempDir, 'main.cpp');
//     const executablePath = path.join(tempDir, 'main');
//     const traceOutputPath = path.join(tempDir, 'opt_trace.json');
//     const pythonTracerPath = path.join(__dirname, 'gdb_opt_tracer.py');

//     await fs.writeFile(sourcePath, sourceCode);

//     const compileCmd = `g++ -O0 -g ${sourcePath} -o ${executablePath}`;
    
//     const runGdbCmd = `cd ${tempDir} && gdb -q --batch -x ${pythonTracerPath} ${executablePath}`;

//     try {
//         await executeCommand(compileCmd);
//         await executeCommand(runGdbCmd);
        
//         const traceData = await fs.readFile(traceOutputPath, 'utf-8');
        
//         await fs.rm(tempDir, { recursive: true, force: true });
        
//         return JSON.parse(traceData);
//     } catch (error) {
//         await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
//         throw error;
//     }
// };

// const executeCommand = (command) => {
//     return new Promise((resolve, reject) => {
//         exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
//             if (error) {
//                 reject({ error, stderr });
//             } else {
//                 resolve(stdout);
//             }
//         });
//     });
// };

// module.exports = { executeCppTrace };

const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

function executeCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, { timeout: 15000 }, (error, stdout, stderr) => {
            // Error hone par bhi output return kar rahe hain taaki debug kar sakein
            if (error) {
                reject({ error, stdout, stderr });
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}

const executeCppTrace = async (sourceCode) => {
    const executionId = crypto.randomUUID();
    const tempDir = path.join(__dirname, 'temp', executionId);
    
    await fs.mkdir(tempDir, { recursive: true });
    
    const sourcePath = path.join(tempDir, 'main.cpp');
    const executableName = process.platform === 'win32' ? 'main.exe' : 'main';
    const executablePath = path.join(tempDir, executableName);
    const traceOutputPath = path.join(tempDir, 'opt_trace.json');
    const pythonTracerPath = path.join(__dirname, 'gdb_opt_tracer.py');

    await fs.writeFile(sourcePath, sourceCode);

    const compileCmd = `g++ -O0 -g "${sourcePath}" -o "${executablePath}"`;
    const runGdbCmd = `cd /d "${tempDir}" && gdb -q --batch -x "${pythonTracerPath}" "${executablePath}"`;

    try {
        await executeCommand(compileCmd);
        
        // GDB execute kar rahe hain aur uska raw output capture kar rahe hain
        const gdbResult = await executeCommand(runGdbCmd);
        
        try {
            // File read karne ka try karega
            const traceData = await fs.readFile(traceOutputPath, 'utf-8');
            await fs.rm(tempDir, { recursive: true, force: true });
            return JSON.parse(traceData);
        } catch (fsError) {
            // Agar file nahi bani, toh GDB ne jo bola wo throw kar dega
            throw new Error(`GDB JSON generate nahi kar paya.\nSTDOUT: ${gdbResult.stdout}\nSTDERR: ${gdbResult.stderr}`);
        }

    } catch (error) {
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
        
        if (error.message) {
            throw error;
        } else {
            // Agar command fail hui thi, toh uska STDERR throw karega
            throw new Error(`Command Failed.\nSTDERR: ${error.stderr}\nSTDOUT: ${error.stdout}`);
        }
    }
};

module.exports = { executeCppTrace };