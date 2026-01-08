import { v4 as uuidv4 } from 'uuid';
import { Submission, SubmissionCreate, UserStats } from '../types';

// In-memory storage
const submissionsDb = new Map<string, Submission>();
const userSubmissionsIndex = new Map<string, string[]>();

export const submissionsService = {
    createSubmission(
        userId: string,
        data: SubmissionCreate
    ): Submission {
        const submissionId = uuidv4();
        const timestamp = new Date().toISOString();

        const submission: Submission = {
            id: submissionId,
            user_id: userId,
            ...data,
            hints: data.hints || [],
            timestamp,
            created_at: timestamp,
        };

        submissionsDb.set(submissionId, submission);

        // Update user index
        const userSubs = userSubmissionsIndex.get(userId) || [];
        userSubs.unshift(submissionId); // Latest first
        userSubmissionsIndex.set(userId, userSubs);

        return submission;
    },

    getSubmission(submissionId: string): Submission | null {
        return submissionsDb.get(submissionId) || null;
    },

    getUserSubmissions(
        userId: string,
        limit: number = 20,
        offset: number = 0,
        language?: string,
        status?: string
    ): {
        submissions: Submission[];
        total: number;
        limit: number;
        offset: number;
        has_more: boolean;
    } {
        const submissionIds = userSubmissionsIndex.get(userId) || [];

        // Filter submissions
        let filtered: Submission[] = [];
        for (const sid of submissionIds) {
            const sub = submissionsDb.get(sid);
            if (!sub) continue;

            if (language && sub.language !== language) continue;
            if (status && sub.status !== status) continue;

            filtered.push(sub);
        }

        const total = filtered.length;
        const paginated = filtered.slice(offset, offset + limit);

        return {
            submissions: paginated,
            total,
            limit,
            offset,
            has_more: offset + limit < total,
        };
    },

    getUserStats(userId: string): UserStats {
        const submissionIds = userSubmissionsIndex.get(userId) || [];

        if (submissionIds.length === 0) {
            return {
                total_submissions: 0,
                success_count: 0,
                error_count: 0,
                success_rate: 0,
                languages: {},
                error_types: {},
                avg_execution_time: 0,
            };
        }

        let successCount = 0;
        let errorCount = 0;
        const languages: Record<string, number> = {};
        const errorTypes: Record<string, number> = {};
        let totalTime = 0;

        for (const sid of submissionIds) {
            const sub = submissionsDb.get(sid);
            if (!sub) continue;

            if (sub.status === 'success') {
                successCount++;
            } else {
                errorCount++;
            }

            languages[sub.language] = (languages[sub.language] || 0) + 1;

            if (sub.error_type) {
                errorTypes[sub.error_type] = (errorTypes[sub.error_type] || 0) + 1;
            }

            totalTime += sub.execution_time;
        }

        const total = submissionIds.length;

        return {
            total_submissions: total,
            success_count: successCount,
            error_count: errorCount,
            success_rate: parseFloat(((successCount / total) * 100).toFixed(2)),
            languages,
            error_types: errorTypes,
            avg_execution_time: parseFloat((totalTime / total).toFixed(3)),
        };
    },

    deleteSubmission(submissionId: string, userId: string): boolean {
        const sub = submissionsDb.get(submissionId);
        if (!sub || sub.user_id !== userId) {
            return false;
        }

        submissionsDb.delete(submissionId);

        const userSubs = userSubmissionsIndex.get(userId) || [];
        const index = userSubs.indexOf(submissionId);
        if (index > -1) {
            userSubs.splice(index, 1);
            userSubmissionsIndex.set(userId, userSubs);
        }

        return true;
    },
};
