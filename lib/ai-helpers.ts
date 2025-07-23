// Helper function to parse questions with options from AI responses
export function parseQuestionsWithOptions(content: string) {
  const questions = [];
  const lines = content.split("\n");
  let currentQuestion = null;
  let currentOptions = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check if line starts with "PYTANIE" or "**PYTANIE" followed by number and colon
    if (trimmedLine.match(/^(\*\*)?PYTANIE\s+\d+(\*\*)?:/)) {
      // Save previous question if exists
      if (currentQuestion && currentOptions.length > 0) {
        questions.push({
          question: currentQuestion,
          options: [...currentOptions],
        });
      }
      // Start new question - remove PYTANIE X: or **PYTANIE X**: prefix
      currentQuestion = trimmedLine.replace(
        /^(\*\*)?PYTANIE\s+\d+(\*\*)?:\s*/,
        ""
      );
      currentOptions = [];
    }
    // Check if line is an option (A), B), C))
    else if (trimmedLine.match(/^[A-C]\)/)) {
      const option = trimmedLine.replace(/^[A-C]\)\s*/, "");
      if (option) {
        currentOptions.push(option);
      }
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

// Template for clarification prompt with structured output
export function createClarifyPrompt(question: string): string {
  return `Jako asystent AI, wygeneruj 3-5 pytań doprecyzowujących z 3 opcjami odpowiedzi każde, aby lepiej zrozumieć intencję użytkownika.

Format odpowiedzi:
PYTANIE 1: [treść pytania]
A) [opcja A]
B) [opcja B] 
C) [opcja C]

PYTANIE 2: [treść pytania]
A) [opcja A]
B) [opcja B]
C) [opcja C]

Pytanie użytkownika: ${question}`;
}

// Template for improvement prompt
export function createImprovePrompt(
  question: string,
  answers: string[]
): string {
  const answerSummary = answers
    .map((a: string, i: number) => `Pytanie: ${i + 1}\nOdpowiedź: ${a}`)
    .join("\n\n");

  return `Na podstawie poniższego pytania użytkownika oraz odpowiedzi na pytania precyzujące, wygeneruj ulepszony prompt do AI:

Pytanie użytkownika:
${question}

Odpowiedzi:
${answerSummary}

Wygeneruj najlepszy możliwy prompt.`;
}
