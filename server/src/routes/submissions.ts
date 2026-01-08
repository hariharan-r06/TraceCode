import { Router } from 'express';
import { submissionsService } from '../services/submissionsService';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get user submissions
router.get('/', authMiddleware, (req: any, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;
        const language = req.query.language as string;
        const status = req.query.status as string;

        const result = submissionsService.getUserSubmissions(
            req.user.id,
            limit,
            offset,
            language,
            status
        );

        res.json(result);
    } catch (error: any) {
        res.status(500).json({ detail: error.message || 'Failed to get submissions' });
    }
});

// Get user stats
router.get('/stats', authMiddleware, (req: any, res) => {
    try {
        const stats = submissionsService.getUserStats(req.user.id);
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ detail: error.message || 'Failed to get stats' });
    }
});

// Get single submission
router.get('/:id', authMiddleware, (req: any, res) => {
    try {
        const submission = submissionsService.getSubmission(req.params.id);

        if (!submission) {
            return res.status(404).json({ detail: 'Submission not found' });
        }

        if (submission.user_id !== req.user.id) {
            return res.status(403).json({ detail: 'Access denied' });
        }

        res.json(submission);
    } catch (error: any) {
        res.status(500).json({ detail: error.message || 'Failed to get submission' });
    }
});

// Delete submission
router.delete('/:id', authMiddleware, (req: any, res) => {
    try {
        const success = submissionsService.deleteSubmission(req.params.id, req.user.id);

        if (!success) {
            return res.status(404).json({ detail: 'Submission not found or access denied' });
        }

        res.json({ message: 'Submission deleted', id: req.params.id });
    } catch (error: any) {
        res.status(500).json({ detail: error.message || 'Failed to delete submission' });
    }
});

export default router;
