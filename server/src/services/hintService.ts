import OpenAI from 'openai';
import { config } from '../config/env';
import { HintResponse } from '../types';

// Initialize OpenAI client
const openai = config.openaiApiKey ? new OpenAI({ apiKey: config.openaiApiKey }) : null;

const HINT_SYSTEM_PROMPT = `You are an educational programming assistant for TraceCode system. 
Your role is to help students learn by providing HINTS, not solutions.

CRITICAL RULES:
1. NEVER provide the complete corrected code
2. NEVER give away the exact fix line-by-line
3. Focus on teaching concepts and guiding discovery
4. Provide progressive hints from vague to more specific
5. Reference relevant programming concepts they should review

When analyzing code errors, respond with a JSON object containing:
{
    "error_type": "syntax" | "runtime" | "logical" | "none",
    "hints": ["hint1", "hint2", "hint3"],
    "root_cause": "Simple explanation of what went wrong",
    "concept_references": [{"title": "Concept Name", "url": "#"}],
    "minimal_patch": "Direction to fix without exact code"
}

The hints should be:
- Hint 1: Very vague, just points to the problem area
- Hint 2: More specific about what type of issue it is
- Hint 3: Gives direction without the exact solution

Remember: You are a TEACHER, not a code fixer. Help them LEARN.`;

export const hintService = {
    async generateHints(
        code: string,
        language: string,
        error: string = '',
        expectedOutput: string = ''
    ): Promise<HintResponse> {
        if (!openai) {
            return this.getMockHints(code, language, error);
        }

        try {
            const prompt = `Student's Code (${language}):
\`\`\`${language}
${code}
\`\`\`

Error/Output:
${error || 'No error message provided'}

Expected Output:
${expectedOutput || 'Not specified'}

Analyze this code and provide educational hints. Respond ONLY with the JSON object, no other text.`;

            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: HINT_SYSTEM_PROMPT },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.7,
                max_tokens: 1000,
            });

            const responseText = response.choices[0]?.message?.content || '';
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                return {
                    error_type: result.error_type || 'none',
                    hints: result.hints || ['Check your code carefully'],
                    root_cause: result.root_cause || 'Unable to determine root cause',
                    concept_references: result.concept_references || [],
                    minimal_patch: result.minimal_patch || 'Review the error message and code structure',
                };
            }

            return this.getMockHints(code, language, error);
        } catch (error) {
            console.error('OpenAI API error:', error);
            return this.getMockHints(code, language, error);
        }
    },

    getMockHints(code: string, language: string, error: string): HintResponse {
        const errorLower = error.toLowerCase();
        let errorType: 'syntax' | 'runtime' | 'logical' | 'none' = 'none';

        if (errorLower.includes('syntax') || errorLower.includes('invalid')) {
            errorType = 'syntax';
        } else if (errorLower.includes('error') || errorLower.includes('exception')) {
            errorType = 'runtime';
        } else if (error) {
            errorType = 'logical';
        }

        const hintsByType: Record<string, string[]> = {
            syntax: [
                'Look at the structure of your code - something seems off with the syntax',
                'Check colons, brackets, parentheses, and indentation carefully',
                `In ${language}, pay attention to proper statement formatting and required punctuation`,
            ],
            runtime: [
                'Your code runs but encounters an error during execution',
                'Check for issues like division by zero, accessing invalid indices, or type mismatches',
                'Trace through your code with sample input to find where it fails',
            ],
            logical: [
                'Your code runs but doesn\'t produce the expected output',
                'Review your algorithm logic and loop conditions',
                'Add print statements to see intermediate values and trace the flow',
            ],
            none: [
                'No obvious errors detected in your code',
                'Check if the output matches what you expect',
                'Consider edge cases and boundary conditions',
            ],
        };

        const conceptsByType: Record<string, Array<{ title: string; url: string }>> = {
            syntax: [
                { title: 'Python Syntax', url: 'https://docs.python.org/3/tutorial/' },
                { title: 'Common Errors', url: '#' },
            ],
            runtime: [
                { title: 'Exception Handling', url: 'https://docs.python.org/3/tutorial/errors.html' },
                { title: 'Debugging', url: '#' },
            ],
            logical: [
                { title: 'Algorithm Design', url: '#' },
                { title: 'Debugging Techniques', url: '#' },
            ],
            none: [{ title: 'Code Review', url: '#' }],
        };

        return {
            error_type: errorType,
            hints: hintsByType[errorType],
            root_cause: error
                ? `Detected a ${errorType} issue in your code. Review the error message carefully.`
                : 'Code appears to be working.',
            concept_references: conceptsByType[errorType],
            minimal_patch: 'Focus on the error location and think about what the code should be doing there.',
        };
    },
};
