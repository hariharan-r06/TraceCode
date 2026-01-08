import { Router } from 'express';
import { authService } from '../services/authService';
import { firebaseService } from '../services/firebaseService';
import { authMiddleware } from '../middleware/auth';
import { RegisterRequest, LoginRequest, FirebaseAuthRequest, TokenResponse } from '../types';

const router = Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role }: RegisterRequest = req.body;

        const user = await authService.registerUser(name, email, password, role);
        const token = authService.createAccessToken({
            user_id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        });

        const response: TokenResponse = {
            access_token: token,
            token_type: 'bearer',
            user,
        };

        res.json(response);
    } catch (error: any) {
        res.status(400).json({ detail: error.message || 'Registration failed' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password }: LoginRequest = req.body;

        const user = await authService.authenticateUser(email, password);
        if (!user) {
            return res.status(401).json({ detail: 'Invalid email or password' });
        }

        const token = authService.createAccessToken({
            user_id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        });

        const response: TokenResponse = {
            access_token: token,
            token_type: 'bearer',
            user,
        };

        res.json(response);
    } catch (error: any) {
        res.status(500).json({ detail: error.message || 'Login failed' });
    }
});

// Firebase auth
router.post('/firebase', async (req, res) => {
    try {
        const { id_token }: FirebaseAuthRequest = req.body;

        const firebaseUser = await firebaseService.verifyToken(id_token);
        if (!firebaseUser) {
            return res.status(401).json({ detail: 'Invalid Firebase token' });
        }

        const userProfile = await firebaseService.getOrCreateUserProfile(firebaseUser);

        const token = authService.createAccessToken({
            user_id: userProfile.id,
            email: userProfile.email,
            name: userProfile.name,
            role: userProfile.role || 'student',
        });

        const response: TokenResponse = {
            access_token: token,
            token_type: 'bearer',
            user: {
                id: userProfile.id,
                name: userProfile.name,
                email: userProfile.email,
                role: userProfile.role || 'student',
            },
        };

        res.json(response);
    } catch (error: any) {
        res.status(500).json({ detail: error.message || 'Firebase auth failed' });
    }
});

// Get current user
router.get('/me', authMiddleware, (req: any, res) => {
    res.json(req.user);
});

// Refresh token
router.post('/refresh', authMiddleware, (req: any, res) => {
    const user = req.user;
    const newToken = authService.createAccessToken({
        user_id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
    });

    const response: TokenResponse = {
        access_token: newToken,
        token_type: 'bearer',
        user,
    };

    res.json(response);
});

export default router;
