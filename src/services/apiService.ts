// API service for TraceCode backend
import { getStoredToken } from './authService';
import { API_BASE_URL } from '@/config/firebase';

// Types
export interface CodeRunRequest {
    code: string;
    language?: string;
    input?: string;
    expected_output?: string;
    get_hints?: boolean;
}

export interface CodeRunResponse {
    success: boolean;
    output: string;
    compilation_result: string;
    execution_time: number;
    status: string;
    submission_id?: string;
    error_type?: string;
    hints?: string[];
    root_cause?: string;
}

export interface Submission {
    id: string;
    user_id: string;
    code: string;
    language: string;
    output: string;
    status: string;
    execution_time: number;
    error_type?: string;
    hints: string[];
    root_cause?: string;
    timestamp: string;
}

export interface UserStats {
    total_submissions: number;
    success_count: number;
    error_count: number;
    success_rate: number;
    languages: Record<string, number>;
    error_types: Record<string, number>;
    avg_execution_time: number;
}

// Helper function for authenticated requests
const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = getStoredToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || 'Request failed');
    }

    return response.json();
};

// Run code (no auth required)
export const runCode = async (request: CodeRunRequest): Promise<CodeRunResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/code/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            code: request.code,
            language: request.language || 'python',
            input: request.input || ''
        })
    });

    if (!response.ok) {
        throw new Error('Code execution failed');
    }

    return response.json();
};

// Run code with debugging hints (saves to history if authenticated)
export const debugCode = async (request: CodeRunRequest): Promise<CodeRunResponse> => {
    const token = getStoredToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/code/debug`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            code: request.code,
            language: request.language || 'python',
            input: request.input || '',
            expected_output: request.expected_output || '',
            get_hints: request.get_hints ?? true
        })
    });

    if (!response.ok) {
        throw new Error('Debug request failed');
    }

    return response.json();
};

// Run code and save to history (auth required)
export const runAndSaveCode = async (request: CodeRunRequest): Promise<CodeRunResponse> => {
    return authFetch(`${API_BASE_URL}/api/code/run-and-save`, {
        method: 'POST',
        body: JSON.stringify({
            code: request.code,
            language: request.language || 'python',
            input: request.input || '',
            expected_output: request.expected_output || '',
            get_hints: request.get_hints ?? true
        })
    });
};

// Get user's submission history
export const getSubmissions = async (
    limit = 20,
    offset = 0
): Promise<{ submissions: Submission[]; total: number; has_more: boolean }> => {
    return authFetch(`${API_BASE_URL}/api/submissions?limit=${limit}&offset=${offset}`);
};

// Get user statistics
export const getUserStats = async (): Promise<UserStats> => {
    return authFetch(`${API_BASE_URL}/api/submissions/stats`);
};

// Get single submission
export const getSubmission = async (id: string): Promise<Submission> => {
    return authFetch(`${API_BASE_URL}/api/submissions/${id}`);
};

// Delete submission
export const deleteSubmission = async (id: string): Promise<void> => {
    return authFetch(`${API_BASE_URL}/api/submissions/${id}`, { method: 'DELETE' });
};

// Get AI hints for code
export const getHints = async (
    code: string,
    language: string,
    error?: string
): Promise<{ hints: string[]; root_cause: string; error_type: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/hints/get`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            code,
            language,
            error: error || ''
        })
    });

    if (!response.ok) {
        throw new Error('Hints request failed');
    }

    return response.json();
};
