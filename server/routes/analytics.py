"""
Analytics routes
"""
from fastapi import APIRouter
from models import AnalyticsResponse, HistoryItem, ErrorStat, PerformanceTrend, DifficultConcept
from typing import List

router = APIRouter()

# In-memory storage for demo (replace with Firebase in production)
submissions_history: List[dict] = []


@router.get("/dashboard", response_model=AnalyticsResponse)
async def get_dashboard_analytics():
    """Get instructor dashboard analytics"""
    # For demo, return sample analytics data
    return AnalyticsResponse(
        total_students=156,
        total_submissions=2847,
        success_rate=72.5,
        average_debug_time=4.2,
        common_errors=[
            ErrorStat(name="Syntax Error", count=423),
            ErrorStat(name="Runtime Error", count=312),
            ErrorStat(name="Logic Error", count=189),
            ErrorStat(name="Timeout", count=67),
            ErrorStat(name="Memory Error", count=45),
        ],
        performance_trend=[
            PerformanceTrend(date="Week 1", success=45, total=120),
            PerformanceTrend(date="Week 2", success=78, total=150),
            PerformanceTrend(date="Week 3", success=92, total=140),
            PerformanceTrend(date="Week 4", success=110, total=160),
            PerformanceTrend(date="Week 5", success=125, total=155),
            PerformanceTrend(date="Week 6", success=140, total=170),
        ],
        difficult_concepts=[
            DifficultConcept(concept="Recursion", error_rate=45),
            DifficultConcept(concept="Pointers", error_rate=62),
            DifficultConcept(concept="Dynamic Memory", error_rate=38),
            DifficultConcept(concept="OOP Concepts", error_rate=28),
            DifficultConcept(concept="File I/O", error_rate=22),
        ]
    )


@router.get("/history", response_model=List[HistoryItem])
async def get_submission_history():
    """Get student submission history"""
    # For demo, return sample history
    return [
        HistoryItem(id="1", code='print("Hello")', language="Python", status="success", timestamp="2024-01-15T10:30:00Z", execution_time=0.02),
        HistoryItem(id="2", code="int main() {...}", language="C", status="error", timestamp="2024-01-15T09:15:00Z", error_type="syntax", execution_time=0),
        HistoryItem(id="3", code="public class Main", language="Java", status="success", timestamp="2024-01-14T14:20:00Z", execution_time=0.15),
        HistoryItem(id="4", code='cout << "Test"', language="C++", status="error", timestamp="2024-01-14T11:45:00Z", error_type="runtime", execution_time=0.01),
        HistoryItem(id="5", code="def factorial(n):", language="Python", status="success", timestamp="2024-01-13T16:00:00Z", execution_time=0.03),
    ]
