"""
AI Hint generation service using OpenAI API
"""
from openai import OpenAI
from config import settings
import json
import re

# Initialize OpenAI client
client = None
if settings.OPENAI_API_KEY:
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

# System prompt for educational hints (NOT solutions)
HINT_SYSTEM_PROMPT = """You are an educational programming assistant for TraceCode system. 
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

Example for a missing colon in Python:
- Hint 1: "Look carefully at your function or loop definitions"
- Hint 2: "Check if all compound statements are properly formatted"
- Hint 3: "In Python, certain statements require a specific character at the end before the block"

Remember: You are a TEACHER, not a code fixer. Help them LEARN."""


def generate_hints(code: str, language: str, error: str = "", expected_output: str = "") -> dict:
    """Generate educational hints for student code using OpenAI"""
    
    if not client:
        # Return mock response if no API key
        return get_mock_hints(code, language, error)
    
    try:
        prompt = f"""Student's Code ({language}):
```{language}
{code}
```

Error/Output:
{error if error else "No error message provided"}

Expected Output:
{expected_output if expected_output else "Not specified"}

Analyze this code and provide educational hints. Respond ONLY with the JSON object, no other text."""

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": HINT_SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        response_text = response.choices[0].message.content
        
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
            # Ensure all required fields exist
            return {
                "error_type": result.get("error_type", "none"),
                "hints": result.get("hints", ["Check your code carefully"]),
                "root_cause": result.get("root_cause", "Unable to determine root cause"),
                "concept_references": result.get("concept_references", []),
                "minimal_patch": result.get("minimal_patch", "Review the error message and code structure")
            }
        else:
            return get_mock_hints(code, language, error)
            
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return get_mock_hints(code, language, error)


def get_mock_hints(code: str, language: str, error: str) -> dict:
    """Fallback mock hints when AI is unavailable"""
    
    # Simple error detection for demo
    error_type = "none"
    if error:
        error_lower = error.lower()
        if "syntax" in error_lower or "unexpected" in error_lower or "invalid" in error_lower:
            error_type = "syntax"
        elif "runtime" in error_lower or "exception" in error_lower or "error" in error_lower:
            error_type = "runtime"
        elif "undefined" in error_lower or "not defined" in error_lower or "name" in error_lower:
            error_type = "syntax"
        elif "indentation" in error_lower:
            error_type = "syntax"
        else:
            error_type = "logical"
    
    hints_by_type = {
        "syntax": [
            "Look at the structure of your code - something seems off with the syntax",
            "Check colons, brackets, parentheses, and indentation carefully",
            f"In {language}, pay attention to proper statement formatting and required punctuation"
        ],
        "runtime": [
            "Your code runs but encounters an error during execution",
            "Check for issues like division by zero, accessing invalid indices, or type mismatches",
            "Trace through your code with sample input to find where it fails"
        ],
        "logical": [
            "Your code runs but doesn't produce the expected output",
            "Review your algorithm logic and loop conditions",
            "Add print statements to see intermediate values and trace the flow"
        ],
        "none": [
            "No obvious errors detected in your code",
            "Check if the output matches what you expect",
            "Consider edge cases and boundary conditions"
        ]
    }
    
    concepts_by_type = {
        "syntax": [{"title": "Python Syntax", "url": "https://docs.python.org/3/tutorial/"}, {"title": "Common Errors", "url": "#"}],
        "runtime": [{"title": "Exception Handling", "url": "https://docs.python.org/3/tutorial/errors.html"}, {"title": "Debugging", "url": "#"}],
        "logical": [{"title": "Algorithm Design", "url": "#"}, {"title": "Debugging Techniques", "url": "#"}],
        "none": [{"title": "Code Review", "url": "#"}]
    }
    
    return {
        "error_type": error_type,
        "hints": hints_by_type.get(error_type, hints_by_type["none"]),
        "root_cause": f"Detected a {error_type} issue in your code. Review the error message carefully." if error else "Code appears to be working.",
        "concept_references": concepts_by_type.get(error_type, []),
        "minimal_patch": "Focus on the error location and think about what the code should be doing there."
    }
