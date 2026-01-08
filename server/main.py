"""
TraceCode - FastAPI Backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Import routers
from routes.auth import router as auth_router
from routes.code import router as code_router
from routes.hints import router as hints_router
from routes.analytics import router as analytics_router
from routes.submissions import router as submissions_router

# Create FastAPI app
app = FastAPI(
    title="TraceCode",
    description="Secure code execution, debugging, and explanation platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(code_router, prefix="/api/code", tags=["Code Execution"])
app.include_router(hints_router, prefix="/api/hints", tags=["AI Hints"])
app.include_router(submissions_router, prefix="/api/submissions", tags=["Submissions"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics"])


@app.get("/")
async def root():
    return {
        "message": "TraceCode API",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/api/info")
async def api_info():
    """Get API information and available endpoints"""
    return {
        "name": "TraceCode API",
        "version": "1.0.0",
        "endpoints": {
            "auth": {
                "POST /api/auth/register": "Register new user",
                "POST /api/auth/login": "Login with email/password",
                "POST /api/auth/firebase": "Authenticate with Firebase ID token",
                "GET /api/auth/me": "Get current user info",
                "POST /api/auth/refresh": "Refresh JWT token"
            },
            "code": {
                "POST /api/code/run": "Execute code (no auth required)",
                "POST /api/code/run-and-save": "Execute and save to history (auth required)",
                "POST /api/code/debug": "Execute with debugging hints"
            },
            "hints": {
                "POST /api/hints/get": "Get AI debugging hints"
            },
            "submissions": {
                "GET /api/submissions": "List user's submissions",
                "POST /api/submissions": "Create new submission",
                "GET /api/submissions/stats": "Get user statistics",
                "GET /api/submissions/{id}": "Get specific submission",
                "DELETE /api/submissions/{id}": "Delete submission"
            }
        },
        "supported_languages": ["python", "c", "cpp", "java"]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
