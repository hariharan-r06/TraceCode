import { useState, useCallback } from 'react';

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface RunCodeRequest {
  code: string;
  language: string;
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

// Mock data generators
const mockRunCode = async (request: RunCodeRequest): Promise<RunCodeResponse> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const hasError = request.code.includes('error') || Math.random() > 0.7;
  
  if (hasError) {
    return {
      success: false,
      output: '',
      compilationResult: `Error: undefined variable 'x' at line 3`,
      executionTime: 0,
      status: 'compilation_error',
    };
  }
  
  return {
    success: true,
    output: 'Hello, World!\nProgram executed successfully.',
    compilationResult: 'Compilation successful',
    executionTime: 0.042,
    status: 'success',
  };
};

const mockGetHint = async (request: HintRequest): Promise<HintResponse> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    errorType: 'syntax',
    hints: [
      'Check if all variables are declared before use',
      'Verify that your loop conditions are correct',
      'Make sure all brackets are properly closed',
    ],
    rootCause: 'The variable "x" is being used before it has been declared. In most programming languages, variables must be declared before they can be used.',
    conceptReferences: [
      { title: 'Variable Declaration', url: '#' },
      { title: 'Scope in Programming', url: '#' },
    ],
    minimalPatch: 'Add variable declaration: int x = 0; before line 3',
  };
};

const mockGetAnalytics = async (): Promise<AnalyticsResponse> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    totalStudents: 156,
    totalSubmissions: 2847,
    successRate: 72.5,
    averageDebugTime: 4.2,
    commonErrors: [
      { name: 'Syntax Error', count: 423 },
      { name: 'Runtime Error', count: 312 },
      { name: 'Logic Error', count: 189 },
      { name: 'Timeout', count: 67 },
      { name: 'Memory Error', count: 45 },
    ],
    performanceTrend: [
      { date: 'Week 1', success: 45, total: 120 },
      { date: 'Week 2', success: 78, total: 150 },
      { date: 'Week 3', success: 92, total: 140 },
      { date: 'Week 4', success: 110, total: 160 },
      { date: 'Week 5', success: 125, total: 155 },
      { date: 'Week 6', success: 140, total: 170 },
    ],
    difficultConcepts: [
      { concept: 'Recursion', errorRate: 45 },
      { concept: 'Pointers', errorRate: 62 },
      { concept: 'Dynamic Memory', errorRate: 38 },
      { concept: 'OOP Concepts', errorRate: 28 },
      { concept: 'File I/O', errorRate: 22 },
    ],
  };
};

const mockGetHistory = async (): Promise<HistoryItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return [
    { id: '1', code: 'print("Hello")', language: 'Python', status: 'success', timestamp: '2024-01-15T10:30:00Z', executionTime: 0.02 },
    { id: '2', code: 'int main() {...}', language: 'C', status: 'error', timestamp: '2024-01-15T09:15:00Z', errorType: 'syntax', executionTime: 0 },
    { id: '3', code: 'public class Main', language: 'Java', status: 'success', timestamp: '2024-01-14T14:20:00Z', executionTime: 0.15 },
    { id: '4', code: 'cout << "Test"', language: 'C++', status: 'error', timestamp: '2024-01-14T11:45:00Z', errorType: 'runtime', executionTime: 0.01 },
    { id: '5', code: 'def factorial(n):', language: 'Python', status: 'success', timestamp: '2024-01-13T16:00:00Z', executionTime: 0.03 },
  ];
};

export const useRunCode = () => {
  const [state, setState] = useState<ApiState<RunCodeResponse>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async (request: RunCodeRequest) => {
    setState({ data: null, isLoading: true, error: null });
    try {
      // Replace with actual API call: await fetch('/api/run', { method: 'POST', body: JSON.stringify(request) })
      const data = await mockRunCode(request);
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
      // Replace with actual API call: await fetch('/api/hint', { method: 'POST', body: JSON.stringify(request) })
      const data = await mockGetHint(request);
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
      // Replace with actual API call: await fetch('/api/analytics')
      const data = await mockGetAnalytics();
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
      // Replace with actual API call: await fetch('/api/history')
      const data = await mockGetHistory();
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
