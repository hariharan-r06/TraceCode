"""
AI Hints routes
"""
from fastapi import APIRouter
from models import HintRequest, HintResponse, ConceptReference
from services.hint_service import generate_hints

router = APIRouter()


@router.post("/get", response_model=HintResponse)
async def get_hints(request: HintRequest):
    """Get AI-powered debugging hints"""
    result = generate_hints(
        code=request.code,
        language=request.language,
        error=request.error or "",
        expected_output=request.expected_output or ""
    )
    return HintResponse(
        error_type=result["error_type"],
        hints=result["hints"],
        root_cause=result["root_cause"],
        concept_references=[ConceptReference(**ref) for ref in result["concept_references"]],
        minimal_patch=result["minimal_patch"]
    )
