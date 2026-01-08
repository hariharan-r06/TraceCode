"""
Submissions storage service for user code history
"""
from typing import Dict, List, Optional, Any
from datetime import datetime
import uuid

# In-memory storage (can be replaced with Firestore)
_submissions_db: Dict[str, Dict[str, Any]] = {}
_user_submissions_index: Dict[str, List[str]] = {}  # user_id -> [submission_ids]


def create_submission(
    user_id: str,
    code: str,
    language: str,
    output: str,
    status: str,
    execution_time: float,
    error_type: Optional[str] = None,
    hints: Optional[List[str]] = None,
    root_cause: Optional[str] = None
) -> Dict[str, Any]:
    """Create and store a new submission"""
    submission_id = str(uuid.uuid4())
    timestamp = datetime.utcnow().isoformat()
    
    submission = {
        "id": submission_id,
        "user_id": user_id,
        "code": code,
        "language": language,
        "output": output,
        "status": status,
        "execution_time": execution_time,
        "error_type": error_type,
        "hints": hints or [],
        "root_cause": root_cause,
        "timestamp": timestamp,
        "created_at": timestamp
    }
    
    # Store submission
    _submissions_db[submission_id] = submission
    
    # Update user index
    if user_id not in _user_submissions_index:
        _user_submissions_index[user_id] = []
    _user_submissions_index[user_id].insert(0, submission_id)  # Latest first
    
    return submission


def get_submission(submission_id: str) -> Optional[Dict[str, Any]]:
    """Get a single submission by ID"""
    return _submissions_db.get(submission_id)


def get_user_submissions(
    user_id: str,
    limit: int = 20,
    offset: int = 0,
    language: Optional[str] = None,
    status: Optional[str] = None
) -> Dict[str, Any]:
    """Get paginated submissions for a user"""
    submission_ids = _user_submissions_index.get(user_id, [])
    
    # Apply filters
    filtered_submissions = []
    for sid in submission_ids:
        sub = _submissions_db.get(sid)
        if sub:
            if language and sub.get("language") != language:
                continue
            if status and sub.get("status") != status:
                continue
            filtered_submissions.append(sub)
    
    total = len(filtered_submissions)
    paginated = filtered_submissions[offset:offset + limit]
    
    return {
        "submissions": paginated,
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_more": offset + limit < total
    }


def get_user_stats(user_id: str) -> Dict[str, Any]:
    """Calculate user statistics from submissions"""
    submission_ids = _user_submissions_index.get(user_id, [])
    
    if not submission_ids:
        return {
            "total_submissions": 0,
            "success_count": 0,
            "error_count": 0,
            "success_rate": 0.0,
            "languages": {},
            "error_types": {},
            "avg_execution_time": 0.0
        }
    
    success_count = 0
    error_count = 0
    languages: Dict[str, int] = {}
    error_types: Dict[str, int] = {}
    total_time = 0.0
    
    for sid in submission_ids:
        sub = _submissions_db.get(sid)
        if not sub:
            continue
        
        # Count success/error
        if sub.get("status") == "success":
            success_count += 1
        else:
            error_count += 1
        
        # Count by language
        lang = sub.get("language", "unknown")
        languages[lang] = languages.get(lang, 0) + 1
        
        # Count error types
        if sub.get("error_type"):
            et = sub.get("error_type")
            error_types[et] = error_types.get(et, 0) + 1
        
        # Sum execution time
        total_time += sub.get("execution_time", 0)
    
    total = len(submission_ids)
    
    return {
        "total_submissions": total,
        "success_count": success_count,
        "error_count": error_count,
        "success_rate": round((success_count / total) * 100, 2) if total > 0 else 0.0,
        "languages": languages,
        "error_types": error_types,
        "avg_execution_time": round(total_time / total, 3) if total > 0 else 0.0
    }


def delete_submission(submission_id: str, user_id: str) -> bool:
    """Delete a submission (only if owned by user)"""
    sub = _submissions_db.get(submission_id)
    if not sub or sub.get("user_id") != user_id:
        return False
    
    del _submissions_db[submission_id]
    if user_id in _user_submissions_index:
        _user_submissions_index[user_id].remove(submission_id)
    return True
