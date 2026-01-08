"""
Code execution service - Python only (simplified)
Uses subprocess with timeout for safe execution
"""
import subprocess
import tempfile
import os
import time
import shutil


def run_code(code: str, language: str = "python", user_input: str = "") -> dict:
    """
    Execute Python code in a sandboxed environment
    Returns: dict with success, output, compilation_result, execution_time, status
    """
    # For now, only Python is supported
    if language != "python":
        return {
            "success": False,
            "output": "",
            "compilation_result": f"Language '{language}' is not yet supported. Currently only Python is available.",
            "execution_time": 0,
            "status": "compilation_error"
        }
    
    temp_dir = tempfile.mkdtemp(prefix="tracecode_")
    
    try:
        # Create source file
        source_file = os.path.join(temp_dir, "main.py")
        
        with open(source_file, "w", encoding="utf-8") as f:
            f.write(code)
        
        # Run Python code
        start_time = time.time()
        try:
            result = subprocess.run(
                ["python", source_file],
                input=user_input,
                capture_output=True,
                text=True,
                timeout=10,  # 10 second timeout
                cwd=temp_dir
            )
            execution_time = round(time.time() - start_time, 3)
            
            if result.returncode != 0:
                # There was an error
                error_output = result.stderr or result.stdout
                return {
                    "success": False,
                    "output": result.stdout,
                    "compilation_result": error_output,
                    "execution_time": execution_time,
                    "status": "runtime_error"
                }
            
            return {
                "success": True,
                "output": result.stdout,
                "compilation_result": "Execution successful",
                "execution_time": execution_time,
                "status": "success"
            }
            
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "output": "",
                "compilation_result": "Execution timeout (10s limit exceeded). Check for infinite loops.",
                "execution_time": 10,
                "status": "timeout"
            }
        except FileNotFoundError:
            return {
                "success": False,
                "output": "",
                "compilation_result": "Python interpreter not found on the system",
                "execution_time": 0,
                "status": "runtime_error"
            }
    
    finally:
        # Cleanup temp directory
        try:
            shutil.rmtree(temp_dir)
        except:
            pass
