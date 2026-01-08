import admin from 'firebase-admin';
import { config } from '../config/env';

let firebaseInitialized = false;
let db: admin.firestore.Firestore | null = null;

export const firebaseService = {
    initialize(): boolean {
        if (firebaseInitialized) {
            return true;
        }

        try {
            const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

            if (credPath) {
                admin.initializeApp({
                    credential: admin.credential.cert(credPath),
                });
                db = admin.firestore();
                firebaseInitialized = true;
                console.log('Firebase initialized with credentials file');
                return true;
            } else if (config.firebaseProjectId) {
                admin.initializeApp({
                    projectId: config.firebaseProjectId,
                });
                firebaseInitialized = true;
                console.log(`Firebase initialized with project ID: ${config.firebaseProjectId}`);
                return true;
            } else {
                console.log('Firebase credentials not configured - running in demo mode');
                return false;
            }
        } catch (error) {
            console.error('Firebase initialization error:', error);
            return false;
        }
    },

    async verifyToken(idToken: string): Promise<any> {
        if (!firebaseInitialized) {
            this.initialize();
        }

        if (!firebaseInitialized) {
            return null;
        }

        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            return {
                uid: decodedToken.uid,
                email: decodedToken.email,
                name: decodedToken.name || decodedToken.email?.split('@')[0],
                picture: decodedToken.picture,
                email_verified: decodedToken.email_verified || false,
            };
        } catch (error) {
            console.error('Firebase token verification error:', error);
            return null;
        }
    },

    async getOrCreateUserProfile(firebaseUser: any): Promise<any> {
        if (!db) {
            // Demo mode - return user data without Firestore
            return {
                id: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.name,
                role: 'student',
            };
        }

        try {
            const userRef = db.collection('users').doc(firebaseUser.uid);
            const userDoc = await userRef.get();

            if (userDoc.exists) {
                const userData = userDoc.data();
                return {
                    id: firebaseUser.uid,
                    ...userData,
                };
            } else {
                // Create new user profile
                const newUser = {
                    email: firebaseUser.email,
                    name: firebaseUser.name,
                    role: 'student',
                    created_at: new Date().toISOString(),
                    submission_count: 0,
                    success_count: 0,
                };
                await userRef.set(newUser);
                return {
                    id: firebaseUser.uid,
                    ...newUser,
                };
            }
        } catch (error) {
            console.error('Firestore user profile error:', error);
            return {
                id: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.name,
                role: 'student',
            };
        }
    },
};

// Initialize on module load
firebaseService.initialize();
