"""
Pydantic models for request/response schemas (Simplified for Python-only)
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Literal, Dict


# ========== Auth Models ==========

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Literal["student", "instructor", "admin"] = "student"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Firebase Auth Models
class FirebaseAuthRequest(BaseModel):
    id_token: str


class FirebaseAuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ========== Code Execution Models ==========

class CodeRunRequest(BaseModel):
    code: str
    language: Literal["python"] = "python"  # Python only for now
    input: Optional[str] = ""


class CodeRunResponse(BaseModel):
    success: bool
    output: str
    compilation_result: str
    execution_time: float
    status: Literal["success", "compilation_error", "runtime_error", "timeout"]


class CodeRunAndSaveRequest(BaseModel):
    code: str
    language: Literal["python"] = "python"
    input: Optional[str] = ""
    expected_output: Optional[str] = ""
    get_hints: bool = True


class CodeRunAndSaveResponse(BaseModel):
    success: bool
    output: str
    compilation_result: str
    execution_time: float
    status: Literal["success", "compilation_error", "runtime_error", "timeout"]
    submission_id: Optional[str] = None
    error_type: Optional[str] = None
    hints: Optional[List[str]] = None
    root_cause: Optional[str] = None


# ========== Hint Models ==========

class HintRequest(BaseModel):
    code: str
    language: str = "python"
    error: Optional[str] = ""
    expected_output: Optional[str] = ""


class ConceptReference(BaseModel):
    title: str
    url: str


class HintResponse(BaseModel):
    error_type: Literal["syntax", "runtime", "logical", "none"]
    hints: List[str]
    root_cause: str
    concept_references: List[ConceptReference]
    minimal_patch: str


# ========== Submission Models ==========

class SubmissionCreate(BaseModel):
    code: str
    language: str = "python"
    output: str
    status: Literal["success", "error"]
    execution_time: float
    error_type: Optional[str] = None
    hints: Optional[List[str]] = None
    root_cause: Optional[str] = None


class SubmissionResponse(BaseModel):
    id: str
    user_id: str
    code: str
    language: str
    output: str
    status: str
    execution_time: float
    error_type: Optional[str] = None
    hints: List[str] = []
    root_cause: Optional[str] = None
    timestamp: str
    created_at: str


class SubmissionListResponse(BaseModel):
    submissions: List[SubmissionResponse]
    total: int
    limit: int
    offset: int
    has_more: bool


# ========== User Stats Models ==========

class UserStatsResponse(BaseModel):
    total_submissions: int
    success_count: int
    error_count: int
    success_rate: float
    languages: Dict[str, int]
    error_types: Dict[str, int]
    avg_execution_time: float


# ========== Analytics Models ==========

class ErrorStat(BaseModel):
    name: str
    count: int


class PerformanceTrend(BaseModel):
    date: str
    success: int
    total: int


class DifficultConcept(BaseModel):
    concept: str
    error_rate: float


class AnalyticsResponse(BaseModel):
    total_students: int
    total_submissions: int
    success_rate: float
    average_debug_time: float
    common_errors: List[ErrorStat]
    performance_trend: List[PerformanceTrend]
    difficult_concepts: List[DifficultConcept]


class HistoryItem(BaseModel):
    id: str
    code: str
    language: str
    status: Literal["success", "error"]
    timestamp: str
    error_type: Optional[str] = None
    execution_time: float
