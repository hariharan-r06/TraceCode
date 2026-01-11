import { useState, useCallback } from 'react';
import { API_BASE_URL } from '@/config/firebase';

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export interface CodeRunRequest {
  code: string;
  language?: 'python' | 'cpp' | 'c' | 'java';
  input?: string;
}


interface RunCodeResponse {
  success: boolean;
  output: string;
  compilationResult: string;
  executionTime: number;
  status: 'success' | 'compilation_error' | 'runtime_error' | 'timeout';
}

interface HintRequest {
  code: string;
  language: string;
  error?: string;
}

interface HintResponse {
  errorType: 'syntax' | 'runtime' | 'logical' | 'none';
  hints: string[];
  rootCause: string;
  conceptReferences: { title: string; url: string }[];
  minimalPatch: string;
}

interface AnalyticsResponse {
  totalStudents: number;
  totalSubmissions: number;
  successRate: number;
  averageDebugTime: number;
  commonErrors: { name: string; count: number }[];
  performanceTrend: { date: string; success: number; total: number }[];
  difficultConcepts: { concept: string; errorRate: number }[];
}

interface HistoryItem {
  id: string;
  code: string;
  language: string;
  status: 'success' | 'error';
  timestamp: string;
  errorType?: string;
  executionTime: number;
}

// Real API call to run code
const runCodeApi = async (request: CodeRunRequest): Promise<RunCodeResponse> => {
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
    throw new Error('Failed to execute code');
  }

  const data = await response.json();

  // Map backend response to frontend format
  return {
    success: data.success,
    output: data.output || '',
    compilationResult: data.compilation_result || '',
    executionTime: data.execution_time || 0,
    status: data.status
  };
};

// Real API call to get hints
const getHintApi = async (request: HintRequest): Promise<HintResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/hints/get`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: request.code,
      language: request.language || 'python',
      error: request.error || ''
    })
  });

  if (!response.ok) {
    throw new Error('Failed to get hints');
  }

  const data = await response.json();

  return {
    errorType: data.error_type || 'none',
    hints: data.hints || [],
    rootCause: data.root_cause || '',
    conceptReferences: data.concept_references || [],
    minimalPatch: data.minimal_patch || ''
  };
};

// Real API call to get history
const getHistoryApi = async (): Promise<HistoryItem[]> => {
  const token = localStorage.getItem('token');

  if (!token) {
    return [];
  }

  const response = await fetch(`${API_BASE_URL}/api/submissions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to load history');
  }

  const data = await response.json();

  return data.submissions.map((sub: any) => ({
    id: sub.id,
    code: sub.code,
    language: sub.language,
    status: sub.status,
    timestamp: sub.timestamp,
    errorType: sub.error_type,
    executionTime: sub.execution_time
  }));
};

export const useRunCode = () => {
  const [state, setState] = useState<ApiState<RunCodeResponse>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async (request: CodeRunRequest) => {
    setState({ data: null, isLoading: true, error: null });
    try {
      const data = await runCodeApi(request);
      setState({ data, isLoading: false, error: null });
      return data;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to run code';
      setState({ data: null, isLoading: false, error });
      throw err;
    }
  }, []);

  return { ...state, execute };
};

export const useGetHint = () => {
  const [state, setState] = useState<ApiState<HintResponse>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async (request: HintRequest) => {
    setState({ data: null, isLoading: true, error: null });
    try {
      const data = await getHintApi(request);
      setState({ data, isLoading: false, error: null });
      return data;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to get hints';
      setState({ data: null, isLoading: false, error });
      throw err;
    }
  }, []);

  return { ...state, execute };
};

export const useAnalytics = () => {
  const [state, setState] = useState<ApiState<AnalyticsResponse>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, isLoading: true, error: null });
    try {
      // Analytics is still mock for now (instructor feature)
      const data: AnalyticsResponse = {
        totalStudents: 0,
        totalSubmissions: 0,
        successRate: 0,
        averageDebugTime: 0,
        commonErrors: [],
        performanceTrend: [],
        difficultConcepts: []
      };
      setState({ data, isLoading: false, error: null });
      return data;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to load analytics';
      setState({ data: null, isLoading: false, error });
      throw err;
    }
  }, []);

  return { ...state, execute };
};

export const useHistory = () => {
  const [state, setState] = useState<ApiState<HistoryItem[]>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, isLoading: true, error: null });
    try {
      const data = await getHistoryApi();
      setState({ data, isLoading: false, error: null });
      return data;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to load history';
      setState({ data: null, isLoading: false, error });
      throw err;
    }
  }, []);

  return { ...state, execute };
};
