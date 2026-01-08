// Request/Response Types

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'instructor' | 'admin';
}

export interface UserWithPassword extends User {
    password: string;
    created_at: string;
}

// Auth
export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    role?: 'student' | 'instructor' | 'admin';
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface FirebaseAuthRequest {
    id_token: string;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
    user: User;
}

// Code Execution
export interface CodeRunRequest {
    code: string;
    language?: string;
    input?: string;
}

export interface CodeRunResponse {
    success: boolean;
    output: string;
    compilation_result: string;
    execution_time: number;
    status: 'success' | 'compilation_error' | 'runtime_error' | 'timeout';
}

export interface CodeRunAndSaveRequest extends CodeRunRequest {
    expected_output?: string;
    get_hints?: boolean;
}

export interface CodeRunAndSaveResponse extends CodeRunResponse {
    submission_id?: string;
    error_type?: string;
    hints?: string[];
    root_cause?: string;
}

// Hints
export interface HintRequest {
    code: string;
    language: string;
    error?: string;
    expected_output?: string;
}

export interface ConceptReference {
    title: string;
    url: string;
}

export interface HintResponse {
    error_type: 'syntax' | 'runtime' | 'logical' | 'none';
    hints: string[];
    root_cause: string;
    concept_references: ConceptReference[];
    minimal_patch: string;
}

// Submissions
export interface Submission {
    id: string;
    user_id: string;
    code: string;
    language: string;
    output: string;
    status: 'success' | 'error';
    execution_time: number;
    error_type?: string;
    hints: string[];
    root_cause?: string;
    timestamp: string;
    created_at: string;
}

export interface SubmissionCreate {
    code: string;
    language: string;
    output: string;
    status: 'success' | 'error';
    execution_time: number;
    error_type?: string;
    hints?: string[];
    root_cause?: string;
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

// Express Request with User
export interface AuthRequest extends Express.Request {
    user?: User;
}
