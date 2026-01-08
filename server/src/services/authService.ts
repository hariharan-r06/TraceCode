import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { User, UserWithPassword } from '../types';

// In-memory user store (for demo)
const usersDb: Map<string, UserWithPassword> = new Map();

export const authService = {
    // Hash password
    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    },

    // Verify password
    async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    },

    // Create JWT token
    createAccessToken(data: Record<string, any>): string {
        const expiresIn = `${config.jwtExpirationHours}h`;
        return jwt.sign(data, config.jwtSecret, {
            algorithm: config.jwtAlgorithm as jwt.Algorithm,
            expiresIn,
        });
    },

    // Verify and decode JWT token
    verifyToken(token: string): any {
        try {
            return jwt.verify(token, config.jwtSecret);
        } catch (error) {
            return null;
        }
    },

    // Register new user
    async registerUser(
        name: string,
        email: string,
        password: string,
        role: 'student' | 'instructor' | 'admin' = 'student'
    ): Promise<User> {
        if (usersDb.has(email)) {
            throw new Error('Email already registered');
        }

        const userId = `user_${usersDb.size + 1}`;
        const hashedPassword = await this.hashPassword(password);

        const user: UserWithPassword = {
            id: userId,
            name,
            email,
            password: hashedPassword,
            role,
            created_at: new Date().toISOString(),
        };

        usersDb.set(email, user);

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    },

    // Authenticate user
    async authenticateUser(email: string, password: string): Promise<User | null> {
        const user = usersDb.get(email);
        if (!user) {
            return null;
        }

        const isValid = await this.verifyPassword(password, user.password);
        if (!isValid) {
            return null;
        }

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    },

    // Get user by email
    getUserByEmail(email: string): User | null {
        const user = usersDb.get(email);
        if (!user) {
            return null;
        }

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    },
};
