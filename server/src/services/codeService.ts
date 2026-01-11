import { spawn, execSync, spawnSync } from 'child_process';
import { writeFileSync, mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { CodeRunResponse } from '../types';

// Configuration
const USE_DOCKER = process.env.USE_DOCKER === 'true';
const DOCKER_IMAGE = 'tracecode-sandbox:latest';
const TIMEOUT_MS = 10000; // 10 seconds
const MEMORY_LIMIT = '128m';
const CPU_LIMIT = '0.5';

// Language configurations
const LANGUAGES: Record<string, {
    extension: string;
    filename: string;
    compile?: string[];
    run: string[];
}> = {
    python: {
        extension: 'py',
        filename: 'main.py',
        run: ['python', 'main.py']
    },
    cpp: {
        extension: 'cpp',
        filename: 'main.cpp',
        compile: ['g++', 'main.cpp', '-o', 'main', '-std=c++17'],
        run: ['./main']
    },
    c: {
        extension: 'c',
        filename: 'main.c',
        compile: ['gcc', 'main.c', '-o', 'main'],
        run: ['./main']
    },
    java: {
        extension: 'java',
        filename: 'Main.java',
        compile: ['javac', 'Main.java'],
        run: ['java', 'Main']
    }
};

export const codeService = {
    /**
     * Execute code - uses Docker if enabled, otherwise subprocess
     */
    async runCode(
        code: string,
        language: string = 'python',
        userInput: string = ''
    ): Promise<CodeRunResponse> {
        const langConfig = LANGUAGES[language.toLowerCase()];

        if (!langConfig) {
            return {
                success: false,
                output: '',
                compilation_result: `Language '${language}' is not supported. Supported: ${Object.keys(LANGUAGES).join(', ')}`,
                execution_time: 0,
                status: 'compilation_error',
            };
        }

        if (USE_DOCKER) {
            return this.runWithDocker(code, language, userInput, langConfig);
        } else {
            return this.runWithSubprocess(code, language, userInput, langConfig);
        }
    },

    /**
     * Run code in Docker container (Production - Secure)
     */
    async runWithDocker(
        code: string,
        language: string,
        input: string,
        config: typeof LANGUAGES[string]
    ): Promise<CodeRunResponse> {
        const tempDir = mkdtempSync(path.join(tmpdir(), 'tracecode_'));
        const sourceFile = path.join(tempDir, config.filename);
        const inputFile = path.join(tempDir, 'input.txt');

        try {
            // Write source code
            writeFileSync(sourceFile, code, 'utf-8');
            writeFileSync(inputFile, input || '', 'utf-8');

            const startTime = Date.now();

            // Convert Windows path to Docker-compatible path
            const dockerTempDir = tempDir.replace(/\\/g, '/').replace(/^([A-Za-z]):/, (_, letter) => `/${letter.toLowerCase()}`);

            // Build Docker command
            let dockerArgs: string[];

            if (config.compile) {
                // Compiled language
                const compileCmd = config.compile.join(' ');
                const runCmd = config.run.join(' ');
                dockerArgs = [
                    'run', '--rm',
                    '--network', 'none',
                    '--memory', MEMORY_LIMIT,
                    '--cpus', CPU_LIMIT,
                    '-v', `${dockerTempDir}:/code`,
                    '-w', '/tmp',
                    DOCKER_IMAGE,
                    'bash', '-c',
                    `cp /code/${config.filename} /tmp/ && ${compileCmd} && (cat /code/input.txt | timeout 10 ${runCmd})`
                ];
            } else {
                // Interpreted language (Python)
                dockerArgs = [
                    'run', '--rm',
                    '--network', 'none',
                    '--memory', MEMORY_LIMIT,
                    '--cpus', CPU_LIMIT,
                    '-v', `${dockerTempDir}:/code`,
                    '-w', '/code',
                    DOCKER_IMAGE,
                    'bash', '-c',
                    `cat /code/input.txt | timeout 10 python /code/${config.filename}`
                ];
            }

            const result = spawnSync('docker', dockerArgs, {
                timeout: TIMEOUT_MS + 5000,
                encoding: 'utf-8'
            });

            const executionTime = (Date.now() - startTime) / 1000;

            if (result.error) {
                return {
                    success: false,
                    output: '',
                    compilation_result: `Docker error: ${result.error.message}. Is Docker running?`,
                    execution_time: 0,
                    status: 'runtime_error'
                };
            }

            if (result.status !== 0) {
                const isCompileError = (result.stderr || '').includes('error:') ||
                    (result.stderr || '').includes('Error:');
                return {
                    success: false,
                    output: result.stdout || '',
                    compilation_result: result.stderr || 'Execution failed',
                    execution_time: executionTime,
                    status: isCompileError ? 'compilation_error' : 'runtime_error'
                };
            }

            return {
                success: true,
                output: result.stdout || '',
                compilation_result: 'Execution successful',
                execution_time: executionTime,
                status: 'success'
            };

        } finally {
            // Cleanup temp directory
            try {
                rmSync(tempDir, { recursive: true, force: true });
            } catch { }
        }
    },

    /**
     * Run code with subprocess (Development - Simple)
     */
    async runWithSubprocess(
        code: string,
        language: string,
        input: string,
        config: typeof LANGUAGES[string]
    ): Promise<CodeRunResponse> {
        const tempDir = mkdtempSync(path.join(tmpdir(), 'tracecode_'));
        const sourceFile = path.join(tempDir, config.filename);

        try {
            writeFileSync(sourceFile, code, 'utf-8');
            const startTime = Date.now();

            // Compile if needed
            if (config.compile) {
                try {
                    execSync(config.compile.join(' '), {
                        cwd: tempDir,
                        timeout: 10000,
                        encoding: 'utf-8'
                    });
                } catch (err: any) {
                    rmSync(tempDir, { recursive: true, force: true });
                    return {
                        success: false,
                        output: '',
                        compilation_result: err.stderr || err.message || 'Compilation failed',
                        execution_time: (Date.now() - startTime) / 1000,
                        status: 'compilation_error'
                    };
                }
            }

            // Run synchronously to avoid cleanup race condition
            const runCmd = config.run[0];
            const runArgs = config.run.slice(1);

            const result = spawnSync(runCmd, runArgs, {
                cwd: tempDir,
                input: input || undefined,
                timeout: TIMEOUT_MS,
                encoding: 'utf-8',
                maxBuffer: 10 * 1024 * 1024 // 10MB
            });

            const executionTime = (Date.now() - startTime) / 1000;

            // Cleanup
            rmSync(tempDir, { recursive: true, force: true });

            if (result.error) {
                if ((result.error as any).code === 'ETIMEDOUT') {
                    return {
                        success: false,
                        output: '',
                        compilation_result: 'Execution timeout (10s limit exceeded)',
                        execution_time: TIMEOUT_MS / 1000,
                        status: 'timeout'
                    };
                }
                return {
                    success: false,
                    output: '',
                    compilation_result: `Execution error: ${result.error.message}`,
                    execution_time: 0,
                    status: 'runtime_error'
                };
            }

            if (result.status !== 0) {
                return {
                    success: false,
                    output: result.stdout || '',
                    compilation_result: result.stderr || 'Runtime error',
                    execution_time: executionTime,
                    status: 'runtime_error'
                };
            }

            return {
                success: true,
                output: result.stdout || '',
                compilation_result: 'Execution successful',
                execution_time: executionTime,
                status: 'success'
            };

        } catch (err: any) {
            // Cleanup on error
            try {
                rmSync(tempDir, { recursive: true, force: true });
            } catch { }

            return {
                success: false,
                output: '',
                compilation_result: err.message || 'Execution failed',
                execution_time: 0,
                status: 'runtime_error'
            };
        }
    }
};
