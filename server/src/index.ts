import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import authRoutes from './routes/auth';
import codeRoutes from './routes/code';
import hintsRoutes from './routes/hints';
import submissionsRoutes from './routes/submissions';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/hints', hintsRoutes);
app.use('/api/submissions', submissionsRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'TraceCode API',
        status: 'running',
        version: '1.0.0',
        docs: '/api/info',
    });
});

// API info
app.get('/api/info', (req, res) => {
    res.json({
        name: 'TraceCode API',
        version: '1.0.0',
        endpoints: {
            auth: {
                'POST /api/auth/register': 'Register new user',
                'POST /api/auth/login': 'Login with email/password',
                'POST /api/auth/firebase': 'Authenticate with Firebase ID token',
                'GET /api/auth/me': 'Get current user info',
                'POST /api/auth/refresh': 'Refresh JWT token',
            },
            code: {
                'POST /api/code/run': 'Execute code (no auth required)',
                'POST /api/code/run-and-save': 'Execute and save to history (auth required)',
                'POST /api/code/debug': 'Execute with debugging hints',
            },
            hints: {
                'POST /api/hints/get': 'Get AI debugging hints',
            },
            submissions: {
                'GET /api/submissions': "List user's submissions",
                'POST /api/submissions': 'Create new submission',
                'GET /api/submissions/stats': 'Get user statistics',
                'GET /api/submissions/:id': 'Get specific submission',
                'DELETE /api/submissions/:id': 'Delete submission',
            },
        },
        supported_languages: ['python'],
    });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        detail: err.message || 'Internal server error',
    });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`TraceCode API running on http://localhost:${PORT}`);
    console.log(`API Documentation: http://localhost:${PORT}/api/info`);
    console.log(`Health Check: http://localhost:${PORT}/health`);
});

export default app;
