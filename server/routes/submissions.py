"""
Submissions routes for user code history
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from models import (
    SubmissionResponse, SubmissionListResponse, SubmissionCreate,
    UserStatsResponse
)
from routes.auth import get_current_user
from services.submissions_service import (
    create_submission, get_submission, get_user_submissions,
    get_user_stats, delete_submission
)

router = APIRouter()


@router.post("/", response_model=SubmissionResponse)
async def create_new_submission(
    data: SubmissionCreate,
    user: dict = Depends(get_current_user)
):
    """Save a new code submission"""
    submission = create_submission(
        user_id=user["id"],
        code=data.code,
        language=data.language,
        output=data.output,
        status=data.status,
        execution_time=data.execution_time,
        error_type=data.error_type,
        hints=data.hints,
        root_cause=data.root_cause
    )
    return SubmissionResponse(**submission)


@router.get("/", response_model=SubmissionListResponse)
async def list_submissions(
    user: dict = Depends(get_current_user),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    language: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    """Get user's submission history with pagination and filtering"""
    result = get_user_submissions(
        user_id=user["id"],
        limit=limit,
        offset=offset,
        language=language,
        status=status
    )
    return SubmissionListResponse(**result)


@router.get("/stats", response_model=UserStatsResponse)
async def get_my_stats(user: dict = Depends(get_current_user)):
    """Get user's personal statistics"""
    stats = get_user_stats(user["id"])
    return UserStatsResponse(**stats)


@router.get("/{submission_id}", response_model=SubmissionResponse)
async def get_single_submission(
    submission_id: str,
    user: dict = Depends(get_current_user)
):
    """Get a specific submission by ID"""
    submission = get_submission(submission_id)
    
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    # Check ownership
    if submission.get("user_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return SubmissionResponse(**submission)


@router.delete("/{submission_id}")
async def delete_user_submission(
    submission_id: str,
    user: dict = Depends(get_current_user)
):
    """Delete a submission"""
    success = delete_submission(submission_id, user["id"])
    
    if not success:
        raise HTTPException(status_code=404, detail="Submission not found or access denied")
    
    return {"message": "Submission deleted", "id": submission_id}
