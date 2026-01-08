"""
Authentication routes with Firebase support
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from models import (
    UserRegister, UserLogin, TokenResponse, UserResponse,
    FirebaseAuthRequest, FirebaseAuthResponse
)
from services.auth_service import (
    register_user, authenticate_user, create_access_token, 
    decode_token, get_user_by_email
)
from services.firebase_service import verify_firebase_token, get_or_create_user_profile

router = APIRouter()
security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to get current authenticated user"""
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # Return user data from token payload
    return {
        "id": payload.get("user_id", payload.get("email")),
        "email": payload.get("email"),
        "name": payload.get("name", ""),
        "role": payload.get("role", "student")
    }


async def get_optional_user(
    authorization: Optional[str] = Header(None)
) -> Optional[dict]:
    """Optional authentication - returns user or None"""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)
    if not payload:
        return None
    
    return {
        "id": payload.get("user_id", payload.get("email")),
        "email": payload.get("email"),
        "name": payload.get("name", ""),
        "role": payload.get("role", "student")
    }


@router.post("/firebase", response_model=FirebaseAuthResponse)
async def firebase_auth(data: FirebaseAuthRequest):
    """
    Authenticate with Firebase ID token (from Google OAuth on frontend)
    Returns a JWT token for API authentication
    """
    # Verify Firebase token
    firebase_user = verify_firebase_token(data.id_token)
    
    if not firebase_user:
        raise HTTPException(status_code=401, detail="Invalid Firebase token")
    
    # Get or create user profile
    user_profile = get_or_create_user_profile(firebase_user)
    
    # Create our own JWT for API calls
    jwt_token = create_access_token({
        "user_id": user_profile["id"],
        "email": user_profile["email"],
        "name": user_profile.get("name", ""),
        "role": user_profile.get("role", "student")
    })
    
    return FirebaseAuthResponse(
        access_token=jwt_token,
        user=UserResponse(
            id=user_profile["id"],
            name=user_profile.get("name", ""),
            email=user_profile["email"],
            role=user_profile.get("role", "student")
        )
    )


@router.post("/register", response_model=TokenResponse)
async def register(data: UserRegister):
    """Register a new user (email/password)"""
    try:
        user = register_user(data.name, data.email, data.password, data.role)
        token = create_access_token({
            "user_id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"]
        })
        return TokenResponse(
            access_token=token,
            user=UserResponse(**user)
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    """Login with email/password and get access token"""
    user = authenticate_user(data.email, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({
        "user_id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"]
    })
    return TokenResponse(
        access_token=token,
        user=UserResponse(**user)
    )


@router.get("/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    """Get current authenticated user info"""
    return UserResponse(**user)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(user: dict = Depends(get_current_user)):
    """Refresh the JWT token"""
    new_token = create_access_token({
        "user_id": user["id"],
        "email": user["email"],
        "name": user.get("name", ""),
        "role": user.get("role", "student")
    })
    return TokenResponse(
        access_token=new_token,
        user=UserResponse(**user)
    )
