// Helper function to parse questions with options from AI responses
export function parseQuestionsWithOptions(content: string) {
  const questions = [];
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);
  let currentQuestion = null;
  let currentOptions = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Enhanced question detection - support multiple formats
    const questionPatterns = [
      /^(\*\*)?QUESTION\s+\d+(\*\*)?:/i,
      /^(\d+\.\s*)/,
      /^(\*\*)?Q\d+(\*\*)?:/i,
      /^Question\s*\d*/i,
      /^\d+\)\s*/,
    ];

    const isQuestion = questionPatterns.some((pattern) =>
      pattern.test(trimmedLine)
    );

    if (isQuestion) {
      // Save previous question if exists
      if (currentQuestion && currentOptions.length > 0) {
        questions.push({
          question: currentQuestion,
          options: [...currentOptions],
        });
      }

      // Start new question - clean up the line
      currentQuestion = trimmedLine
        .replace(/^(\*\*)?QUESTION\s+\d+(\*\*)?:\s*/i, "")
        .replace(/^(\d+\.\s*)/, "")
        .replace(/^(\*\*)?Q\d+(\*\*)?:\s*/i, "")
        .replace(/^Question\s*\d*:?\s*/i, "")
        .replace(/^\d+\)\s*/, "")
        .trim();

      currentOptions = [];
    }
    // Enhanced option detection
    else if (trimmedLine.match(/^[A-F]\)/) || trimmedLine.match(/^[a-f]\)/)) {
      const option = trimmedLine.replace(/^[A-Fa-f]\)\s*/, "").trim();
      if (option) {
        currentOptions.push(option);
      }
    }
    // Also handle lines that might have extra formatting like **A)** or *A)*
    else if (trimmedLine.match(/^(\*\*?)?[A-Fa-f]\)(\*\*?)?/)) {
      const option = trimmedLine
        .replace(/^(\*\*?)?[A-Fa-f]\)(\*\*?)?\s*/, "")
        .trim();
      if (option) {
        currentOptions.push(option);
      }
    } else if (
      currentQuestion &&
      !trimmedLine.match(/^[A-Fa-f]\)/) &&
      currentOptions.length === 0
    ) {
      currentQuestion += " " + trimmedLine;
    }
  }

  // Don't forget the last question
  if (currentQuestion && currentOptions.length > 0) {
    questions.push({
      question: currentQuestion,
      options: [...currentOptions],
    });
  }

  return questions;
}

// Token limits configuration
export const TOKEN_LIMITS = {
  CLARIFY: 512,
  IMPROVE: 512,
  GENERAL: 1000, // For general message processing (Anthropic, Gemini, DeepSeek)
} as const;

// Template for clarification prompt with structured output
export function createClarifyPrompt(question: string): string {
  return `You are an expert AI assistant specialized in prompt optimization. Analyze the user's question and generate **exactly 3-5 precise clarifying questions** to eliminate ambiguity and better understand their intent.

**CRITICAL REQUIREMENTS:**
- Each question MUST have exactly 3 answer options labeled A), B), C)
- Questions must address specific ambiguities or missing context
- Use the EXACT format shown below
- Be concise and directly relevant
- Avoid generic questions
- IMPORTANT RESPOND IN THE SAME LANGUAGE AS THE USER'S ORIGINAL QUESTION

**OUTPUT FORMAT (follow exactly):**

QUESTION 1: [Your first specific clarifying question]
A) [First clear option]
B) [Second clear option] 
C) [Third clear option]

QUESTION 2: [Your second specific clarifying question]
A) [First clear option]
B) [Second clear option]
C) [Third clear option]

[Continue with QUESTION 3 and QUESTION 5 if needed]

**User's original question:**
"${question}"

Generate clarifying questions that will help create the most effective AI prompt possible.`;
}

export function createImprovePrompt(
  question: string,
  answers: string[]
): string {
  const answersFormatted = answers
    .map((answer, index) => `${index + 1}. ${answer}`)
    .join("\n");

  return `You are an expert prompt engineer. Create an optimized, professional AI prompt based on the user's original question and their clarifying answers.

**GOAL:** Transform the input into a clear, specific, and highly effective prompt that will generate the best possible AI response.

**OPTIMIZATION CRITERIA:**
- Clear and unambiguous language
- Specific context and requirements
- Professional structure
- Actionable instructions
- Eliminates all identified ambiguities
- RESPOND IN THE SAME LANGUAGE AS THE USER'S ORIGINAL QUESTION
- IMPORTANT RESPOND IN THE SAME LANGUAGE AS THE USER'S ORIGINAL QUESTION


**ORIGINAL QUESTION:**
${question}

**CLARIFYING ANSWERS:**
${answersFormatted}

**INSTRUCTIONS:**
Create the final optimized prompt that incorporates all clarifying information. Make it specific, contextual, and ready to use with any AI system. 

Respond with ONLY the final improved prompt - no explanations or meta-commentary.`;
}
