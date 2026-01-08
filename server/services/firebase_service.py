"""
Firebase Admin SDK service for authentication
"""
import firebase_admin
from firebase_admin import credentials, auth, firestore
from typing import Optional, Dict, Any
from config import settings
import os

# Firebase initialization flag
_firebase_initialized = False
_db = None


def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    global _firebase_initialized, _db
    
    if _firebase_initialized:
        return True
    
    try:
        # Check for credentials file path
        cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            _db = firestore.client()
            _firebase_initialized = True
            print("Firebase initialized with credentials file")
            return True
        elif settings.FIREBASE_PROJECT_ID:
            # Initialize with project ID only (for development/testing)
            # This works when running on Google Cloud or with default credentials
            try:
                firebase_admin.initialize_app(options={
                    'projectId': settings.FIREBASE_PROJECT_ID
                })
                _firebase_initialized = True
                print(f"Firebase initialized with project ID: {settings.FIREBASE_PROJECT_ID}")
                return True
            except Exception as e:
                print(f"Firebase initialization with project ID failed: {e}")
                return False
        else:
            print("Firebase credentials not configured - running in demo mode")
            return False
    except Exception as e:
        print(f"Firebase initialization error: {e}")
        return False


def get_firestore_db():
    """Get Firestore database client"""
    global _db
    if not _firebase_initialized:
        initialize_firebase()
    return _db


def verify_firebase_token(id_token: str) -> Optional[Dict[str, Any]]:
    """
    Verify a Firebase ID token from the frontend
    Returns decoded token data or None if invalid
    """
    if not _firebase_initialized:
        if not initialize_firebase():
            return None
    
    try:
        decoded_token = auth.verify_id_token(id_token)
        return {
            "uid": decoded_token.get("uid"),
            "email": decoded_token.get("email"),
            "name": decoded_token.get("name", decoded_token.get("email", "").split("@")[0]),
            "picture": decoded_token.get("picture"),
            "email_verified": decoded_token.get("email_verified", False),
            "auth_provider": decoded_token.get("firebase", {}).get("sign_in_provider", "unknown")
        }
    except auth.ExpiredIdTokenError:
        print("Firebase token expired")
        return None
    except auth.InvalidIdTokenError as e:
        print(f"Invalid Firebase token: {e}")
        return None
    except Exception as e:
        print(f"Firebase token verification error: {e}")
        return None


def get_or_create_user_profile(firebase_user: Dict[str, Any]) -> Dict[str, Any]:
    """
    Get existing user profile from Firestore or create new one
    """
    db = get_firestore_db()
    
    if db is None:
        # Demo mode - return user data without Firestore
        return {
            "id": firebase_user["uid"],
            "email": firebase_user["email"],
            "name": firebase_user["name"],
            "picture": firebase_user.get("picture"),
            "role": "student",
            "created_at": None,
            "auth_provider": firebase_user.get("auth_provider", "unknown")
        }
    
    try:
        user_ref = db.collection("users").document(firebase_user["uid"])
        user_doc = user_ref.get()
        
        if user_doc.exists:
            # User exists, return profile
            user_data = user_doc.to_dict()
            user_data["id"] = firebase_user["uid"]
            return user_data
        else:
            # Create new user profile
            from datetime import datetime
            new_user = {
                "email": firebase_user["email"],
                "name": firebase_user["name"],
                "picture": firebase_user.get("picture"),
                "role": "student",
                "created_at": datetime.utcnow().isoformat(),
                "auth_provider": firebase_user.get("auth_provider", "unknown"),
                "submission_count": 0,
                "success_count": 0
            }
            user_ref.set(new_user)
            new_user["id"] = firebase_user["uid"]
            return new_user
    except Exception as e:
        print(f"Firestore user profile error: {e}")
        # Fallback to basic user data
        return {
            "id": firebase_user["uid"],
            "email": firebase_user["email"],
            "name": firebase_user["name"],
            "role": "student"
        }


def update_user_stats(user_id: str, success: bool):
    """Update user submission stats in Firestore"""
    db = get_firestore_db()
    if db is None:
        return
    
    try:
        user_ref = db.collection("users").document(user_id)
        user_ref.update({
            "submission_count": firestore.Increment(1),
            "success_count": firestore.Increment(1 if success else 0)
        })
    except Exception as e:
        print(f"Error updating user stats: {e}")


# Initialize on module load
initialize_firebase()
