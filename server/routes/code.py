"""
Code execution routes with run-and-save functionality
"""
from fastapi import APIRouter, Depends, Header
from typing import Optional
from models import (
    CodeRunRequest, CodeRunResponse,
    CodeRunAndSaveRequest, CodeRunAndSaveResponse
)
from services.code_service import run_code
from services.hint_service import generate_hints
from services.submissions_service import create_submission
from routes.auth import get_current_user, get_optional_user

router = APIRouter()


@router.post("/run", response_model=CodeRunResponse)
async def execute_code(request: CodeRunRequest):
    """Execute code in sandbox and return results (no auth required)"""
    result = run_code(
        code=request.code,
        language=request.language,
        user_input=request.input or ""
    )
    return CodeRunResponse(
        success=result["success"],
        output=result["output"],
        compilation_result=result["compilation_result"],
        execution_time=result["execution_time"],
        status=result["status"]
    )


@router.post("/run-and-save", response_model=CodeRunAndSaveResponse)
async def execute_and_save(
    request: CodeRunAndSaveRequest,
    user: dict = Depends(get_current_user)
):
    """
    Execute code, generate hints if error, and save to user's history.
    Requires authentication.
    """
    # Run the code
    result = run_code(
        code=request.code,
        language=request.language,
        user_input=request.input or ""
    )
    
    # Generate hints if there's an error and hints are requested
    hints_data = None
    if not result["success"] and request.get_hints:
        error_msg = result.get("compilation_result") or result.get("output") or ""
        hints_data = generate_hints(
            code=request.code,
            language=request.language,
            error=error_msg,
            expected_output=request.expected_output or ""
        )
    
    # Determine status for submission
    status = "success" if result["success"] else "error"
    error_type = hints_data.get("error_type") if hints_data else None
    hints_list = hints_data.get("hints") if hints_data else None
    root_cause = hints_data.get("root_cause") if hints_data else None
    
    # Save submission to history
    submission = create_submission(
        user_id=user["id"],
        code=request.code,
        language=request.language,
        output=result.get("output", ""),
        status=status,
        execution_time=result.get("execution_time", 0),
        error_type=error_type,
        hints=hints_list,
        root_cause=root_cause
    )
    
    return CodeRunAndSaveResponse(
        success=result["success"],
        output=result["output"],
        compilation_result=result["compilation_result"],
        execution_time=result["execution_time"],
        status=result["status"],
        submission_id=submission["id"],
        error_type=error_type,
        hints=hints_list,
        root_cause=root_cause
    )


@router.post("/debug", response_model=CodeRunAndSaveResponse)
async def debug_code(
    request: CodeRunAndSaveRequest,
    user: Optional[dict] = Depends(get_optional_user)
):
    """
    Run code with debugging - always generate hints on errors.
    Works with or without authentication.
    If authenticated, saves to history.
    """
    # Run the code
    result = run_code(
        code=request.code,
        language=request.language,
        user_input=request.input or ""
    )
    
    # Generate hints if there's an error
    hints_data = None
    if not result["success"]:
        error_msg = result.get("compilation_result") or result.get("output") or ""
        hints_data = generate_hints(
            code=request.code,
            language=request.language,
            error=error_msg,
            expected_output=request.expected_output or ""
        )
    
    # Prepare response data
    status = "success" if result["success"] else "error"
    error_type = hints_data.get("error_type") if hints_data else None
    hints_list = hints_data.get("hints") if hints_data else None
    root_cause = hints_data.get("root_cause") if hints_data else None
    submission_id = None
    
    # Save to history if authenticated
    if user:
        submission = create_submission(
            user_id=user["id"],
            code=request.code,
            language=request.language,
            output=result.get("output", ""),
            status=status,
            execution_time=result.get("execution_time", 0),
            error_type=error_type,
            hints=hints_list,
            root_cause=root_cause
        )
        submission_id = submission["id"]
    
    return CodeRunAndSaveResponse(
        success=result["success"],
        output=result["output"],
        compilation_result=result["compilation_result"],
        execution_time=result["execution_time"],
        status=result["status"],
        submission_id=submission_id,
        error_type=error_type,
        hints=hints_list,
        root_cause=root_cause
    )
