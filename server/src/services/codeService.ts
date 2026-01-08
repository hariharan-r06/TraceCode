import { spawn } from 'child_process';
import { writeFileSync, mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { CodeRunResponse } from '../types';

export const codeService = {
    /**
     * Execute Python code in a sandboxed environment
     */
    async runCode(
        code: string,
        language: string = 'python',
        userInput: string = ''
    ): Promise<CodeRunResponse> {
        // Only Python supported for now
        if (language !== 'python') {
            return {
                success: false,
                output: '',
                compilation_result: `Language '${language}' is not yet supported. Currently only Python is available.`,
                execution_time: 0,
                status: 'compilation_error',
            };
        }

        // Create temporary directory
        const tempDir = mkdtempSync(path.join(tmpdir(), 'tracecode_'));
        const sourceFile = path.join(tempDir, 'main.py');

        try {
            // Write code to file
            writeFileSync(sourceFile, code, 'utf-8');

            // Execute Python code
            const startTime = Date.now();
            const result = await this.executePython(sourceFile, userInput);
            const executionTime = (Date.now() - startTime) / 1000;

            // Cleanup
            rmSync(tempDir, { recursive: true, force: true });

            if (result.error) {
                return {
                    success: false,
                    output: result.stdout,
                    compilation_result: result.stderr,
                    execution_time: executionTime,
                    status: result.timeout ? 'timeout' : 'runtime_error',
                };
            }

            return {
                success: true,
                output: result.stdout,
                compilation_result: 'Execution successful',
                execution_time: executionTime,
                status: 'success',
            };
        } catch (error: any) {
            // Cleanup on error
            try {
                rmSync(tempDir, { recursive: true, force: true });
            } catch { }

            return {
                success: false,
                output: '',
                compilation_result: error.message || 'Execution failed',
                execution_time: 0,
                status: 'runtime_error',
            };
        }
    },

    /**
     * Execute Python file with timeout
     */
    async executePython(
        filePath: string,
        input: string
    ): Promise<{ stdout: string; stderr: string; error: boolean; timeout: boolean }> {
        return new Promise((resolve) => {
            const python = spawn('python', [filePath]);
            let stdout = '';
            let stderr = '';
            let timedOut = false;

            // 10 second timeout
            const timeout = setTimeout(() => {
                timedOut = true;
                python.kill();
            }, 10000);

            python.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            python.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            // Send input if provided
            if (input) {
                python.stdin.write(input);
                python.stdin.end();
            }

            python.on('close', (code) => {
                clearTimeout(timeout);

                if (timedOut) {
                    resolve({
                        stdout: '',
                        stderr: 'Execution timeout (10s limit exceeded). Check for infinite loops.',
                        error: true,
                        timeout: true,
                    });
                } else if (code !== 0) {
                    resolve({
                        stdout,
                        stderr: stderr || stdout,
                        error: true,
                        timeout: false,
                    });
                } else {
                    resolve({
                        stdout,
                        stderr,
                        error: false,
                        timeout: false,
                    });
                }
            });

            python.on('error', (err) => {
                clearTimeout(timeout);
                resolve({
                    stdout: '',
                    stderr: `Python interpreter error: ${err.message}`,
                    error: true,
                    timeout: false,
                });
            });
        });
    },
};
