import { Router } from 'express';
import { codeService } from '../services/codeService';
import { hintService } from '../services/hintService';
import { submissionsService } from '../services/submissionsService';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import { CodeRunRequest, CodeRunAndSaveRequest } from '../types';

const router = Router();

// Run code (no auth)
router.post('/run', async (req, res) => {
    try {
        const { code, language, input }: CodeRunRequest = req.body;
        const result = await codeService.runCode(code, language || 'python', input || '');
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ detail: error.message || 'Code execution failed' });
    }
});

// Run and save (auth required)
router.post('/run-and-save', authMiddleware, async (req: any, res) => {
    try {
        const { code, language, input, expected_output, get_hints }: CodeRunAndSaveRequest = req.body;

        // Run code
        const result = await codeService.runCode(code, language || 'python', input || '');

        // Generate hints if error
        let hintsData = null;
        if (!result.success && (get_hints !== false)) {
            const errorMsg = result.compilation_result || result.output || '';
            hintsData = await hintService.generateHints(
                code,
                language || 'python',
                errorMsg,
                expected_output || ''
            );
        }

        // Save submission
        const submission = submissionsService.createSubmission(req.user.id, {
            code,
            language: language || 'python',
            output: result.output,
            status: result.success ? 'success' : 'error',
            execution_time: result.execution_time,
            error_type: hintsData?.error_type,
            hints: hintsData?.hints,
            root_cause: hintsData?.root_cause,
        });

        res.json({
            ...result,
            submission_id: submission.id,
            error_type: hintsData?.error_type,
            hints: hintsData?.hints,
            root_cause: hintsData?.root_cause,
        });
    } catch (error: any) {
        res.status(500).json({ detail: error.message || 'Failed to run and save' });
    }
});

// Debug code (optional auth)
router.post('/debug', optionalAuthMiddleware, async (req: any, res) => {
    try {
        const { code, language, input, expected_output }: CodeRunAndSaveRequest = req.body;

        // Run code
        const result = await codeService.runCode(code, language || 'python', input || '');

        // Generate hints if error
        let hintsData = null;
        if (!result.success) {
            const errorMsg = result.compilation_result || result.output || '';
            hintsData = await hintService.generateHints(
                code,
                language || 'python',
                errorMsg,
                expected_output || ''
            );
        }

        // Save if authenticated
        let submissionId;
        if (req.user) {
            const submission = submissionsService.createSubmission(req.user.id, {
                code,
                language: language || 'python',
                output: result.output,
                status: result.success ? 'success' : 'error',
                execution_time: result.execution_time,
                error_type: hintsData?.error_type,
                hints: hintsData?.hints,
                root_cause: hintsData?.root_cause,
            });
            submissionId = submission.id;
        }

        res.json({
            ...result,
            submission_id: submissionId,
            error_type: hintsData?.error_type,
            hints: hintsData?.hints,
            root_cause: hintsData?.root_cause,
        });
    } catch (error: any) {
        res.status(500).json({ detail: error.message || 'Debug failed' });
    }
});

export default router;
