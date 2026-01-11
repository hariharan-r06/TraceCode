import dotenv from 'dotenv';

dotenv.config();

export const config = {
    // Server
    port: process.env.PORT || 8001,
    environment: process.env.ENVIRONMENT || 'development',

    // JWT
    jwtSecret: process.env.JWT_SECRET_KEY || 'dev-secret-key-change-in-production',
    jwtAlgorithm: 'HS256',
    jwtExpirationHours: parseInt(process.env.JWT_EXPIRATION_HOURS || '24'),

    // Firebase
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',

    // OpenAI
    openaiApiKey: process.env.OPENAI_API_KEY || '',

    // Gemini (optional backup)
    geminiApiKey: process.env.GEMINI_API_KEY || '',
};
