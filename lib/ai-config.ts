// Configuration for AI models and providers

// Best models for asking clarifying questions (fixed selection)
export const QUESTION_PROVIDERS = [
  {
    id: "anthropic",
    name: "Claude",
    model: "claude-3-5-sonnet-20241022",
    endpoint: "/api/chat/anthropic",
  },
  {
    id: "openai",
    name: "OpenAI",
    model: "gpt-4o",
    endpoint: "/api/chat/openai",
  },
  {
    id: "gemini",
    name: "Gemini",
    model: "gemini-2.5-flash-lite-preview-06-17",
    endpoint: "/api/chat/gemini",
  },
];

// Default provider for asking questions (best overall)
export const DEFAULT_QUESTION_PROVIDER = "anthropic";

// Available providers for final responses (shown as tiles after questions)
export const RESPONSE_PROVIDERS = [
  {
    id: "anthropic",
    name: "Anthropic Claude",
    icon: "🧠",
    endpoint: "/api/chat/anthropic",
    recommendedModel: "claude-3-5-sonnet-20241022",
    models: [
      {
        id: "claude-3-5-sonnet-20241022",
        name: "Claude 3.5 Sonnet",
        description: "Najlepszy model Claude",
      },
      {
        id: "claude-3-5-haiku-20241022",
        name: "Claude 3.5 Haiku",
        description: "Szybki i ekonomiczny Claude",
      },
      {
        id: "claude-3-sonnet-20240229",
        name: "Claude 3 Sonnet",
        description: "Zbalansowany model Claude 3",
      },
      {
        id: "claude-3-haiku-20240307",
        name: "Claude 3 Haiku",
        description: "Podstawowy model Claude 3",
      },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    icon: "🤖",
    endpoint: "/api/chat/openai",
    recommendedModel: "gpt-4o",
    models: [
      {
        id: "gpt-4o",
        name: "GPT-4o",
        description: "Najnowszy model OpenAI z multimodalnymi możliwościami",
      },
      {
        id: "gpt-4o-mini",
        name: "GPT-4o Mini",
        description: "Lżejsza wersja GPT-4o",
      },
      {
        id: "gpt-4",
        name: "GPT-4",
        description: "Wydajny model do złożonych zadań",
      },
      {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        description: "Szybki i ekonomiczny",
      },
    ],
  },
  {
    id: "gemini",
    name: "Google Gemini",
    icon: "🌟",
    endpoint: "/api/chat/gemini",
    recommendedModel: "gemini-2.5-flash-lite-preview-06-17",
    models: [
      {
        id: "gemini-2.5-flash-lite-preview-06-17",
        name: "Gemini 2.5 Flash",
        description: "Najnowszy model Gemini",
      },
      {
        id: "gemini-1.5-pro",
        name: "Gemini 1.5 Pro",
        description: "Wydajny model Pro",
      },
    ],
  },
  {
    id: "grok",
    name: "Grok (X.AI)",
    icon: "⚡",
    endpoint: "/api/chat/grok",
    recommendedModel: "grok-2-latest",
    models: [
      {
        id: "grok-2-latest",
        name: "Grok 2",
        description: "Najnowszy model Grok",
      },
      {
        id: "grok-2-mini",
        name: "Grok 2 Mini",
        description: "Kompaktowy model Grok",
      },
    ],
  },
  {
    id: "perplexity",
    name: "Perplexity",
    icon: "🔍",
    endpoint: "/api/chat/perplexity",
    recommendedModel: "sonar-pro",
    models: [
      {
        id: "sonar-pro",
        name: "Sonar Pro",
        description: "Zaawansowany model z wyszukiwaniem w internecie",
      },
      {
        id: "sonar",
        name: "Sonar",
        description: "Podstawowy model Perplexity z wyszukiwaniem",
      },
    ],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    icon: "🚀",
    endpoint: "/api/chat/deepseek",
    recommendedModel: "deepseek-chat",
    models: [
      {
        id: "deepseek-chat",
        name: "DeepSeek Chat",
        description: "Model DeepSeek zoptymalizowany do konwersacji",
      },
      {
        id: "deepseek-coder",
        name: "DeepSeek Coder",
        description: "Model DeepSeek do programowania",
      },
    ],
  },
];

// Get provider config by ID
export function getProviderById(providerId: string) {
  return RESPONSE_PROVIDERS.find((provider) => provider.id === providerId);
}

// Get all response provider IDs
export function getAllProviderIds() {
  return RESPONSE_PROVIDERS.map((provider) => provider.id);
}

// Get question provider config by ID
export function getQuestionProviderById(providerId: string) {
  return QUESTION_PROVIDERS.find((provider) => provider.id === providerId);
}
