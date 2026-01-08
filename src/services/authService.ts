// Firebase authentication service for TraceCode
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    User
} from 'firebase/auth';
import { firebaseConfig, API_BASE_URL } from '@/config/firebase';
import type { UserRole } from '@/contexts/AuthContext';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Types
export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
}

export interface AuthResponse {
    access_token: string;
    user: AuthUser;
}

// Register with email/password
export const registerWithEmail = async (
    name: string,
    email: string,
    password: string
): Promise<AuthResponse> => {
    // First, create user in Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Then register with backend using Firebase UID
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name,
            email,
            password,
            role: 'student',
            firebase_uid: firebaseUser.uid
        })
    });

    if (!response.ok) {
        // If backend registration fails, delete the Firebase user
        await firebaseUser.delete();
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
    }

    return response.json();
};

// Login with email/password
export const loginWithEmail = async (
    email: string,
    password: string
): Promise<AuthResponse> => {
    // First, sign in with Firebase
    await signInWithEmailAndPassword(auth, email, password);

    // Then authenticate with backend
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
    }

    return response.json();
};

// Login with Google (Firebase)
export const loginWithGoogle = async (): Promise<AuthResponse> => {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();

    // Send Firebase token to backend
    const response = await fetch(`${API_BASE_URL}/api/auth/firebase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Google login failed');
    }

    return response.json();
};

// Logout
export const logout = async (): Promise<void> => {
    await signOut(auth);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// Get current Firebase user
export const getCurrentFirebaseUser = (): User | null => {
    return auth.currentUser;
};

// Auth state listener
export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

// Store auth data in localStorage
export const storeAuthData = (data: AuthResponse): void => {
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
};

// Get stored auth data
export const getStoredToken = (): string | null => {
    return localStorage.getItem('token');
};

export const getStoredUser = (): AuthUser | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
    return !!getStoredToken();
};

export { auth };
