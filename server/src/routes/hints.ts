import { Router } from 'express';
import { hintService } from '../services/hintService';
import { HintRequest } from '../types';

const router = Router();

router.post('/get', async (req, res) => {
    try {
        const { code, language, error, expected_output }: HintRequest = req.body;

        const hints = await hintService.generateHints(
            code,
            language || 'python',
            error || '',
            expected_output || ''
        );

        res.json(hints);
    } catch (error: any) {
        res.status(500).json({ detail: error.message || 'Failed to generate hints' });
    }
});

export default router;
