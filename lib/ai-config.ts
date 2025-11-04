// Configuration for AI models and providers

export const QUESTION_PROVIDER = {
  id: "openai",
  name: "OpenAI",
  modelName: "4o mini",
  model: "gpt-4o-mini",
  endpoint: "/api/chat/openai",
} as const;

// Default provider for asking questions (best overall)
export const DEFAULT_QUESTION_PROVIDER = "openai" as const;

// Available providers for final responses (shown as tiles after questions)
export const RESPONSE_PROVIDERS = [
  {
    id: "anthropic",
    name: "Anthropic",
    icon: "🧠",
    endpoint: "/api/chat/anthropic",
    recommendedModel: "claude-sonnet-4-5-20250929",
    models: [
      {
        id: "claude-sonnet-4-5-20250929",
        name: "Claude Sonnet 4.5",
        description: "Our smartest model for complex agents and coding",
      },
      {
        id: "claude-haiku-4-5-20251001",
        name: "Claude Haiku 4.5",
        description: "Our fastest model with near-frontier intelligence",
      },
      {
        id: "claude-opus-4-1-20250805",
        name: "Claude Opus 4.1",
        description: "Exceptional model for specialized reasoning tasks",
      },
      {
        id: "claude-opus-4-20250514",
        name: "Opus 4",
        description: "Best Claude - for complex tasks and analysis",
      },
      {
        id: "claude-sonnet-4-20250514",
        name: "Sonnet 4",
        description: "Good balance of quality and speed",
      },
      {
        id: "claude-3-7-sonnet-20250219",
        name: " Sonnet 3.7",
        description: "Improved version - more precise",
      },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    icon: "🤖",
    endpoint: "/api/chat/openai",
    recommendedModel: "gpt-4o-mini",
    models: [
      {
        id: "gpt-4o",
        name: "GPT-4o",
        description: "Best GPT - great for writing and creativity",
      },
      {
        id: "o3",
        name: "o3 (Reasoning)",
        description: "Thinks longer - ideal for complex problems",
      },
      {
        id: "gpt-4o-mini",
        name: "GPT-4o Mini",
        description: "Fast for math and science",
      },
      {
        id: "gpt-4.1",
        name: "GPT-4.1",
        description: "Best for programming and code",
      },
      {
        id: "o3-mini",
        name: "o3 Mini",
        description: "Cheaper o3 version - still thinks logically",
      },
      {
        id: "gpt-4-turbo",
        name: "GPT-4 Turbo",
        description: "For long texts and documents",
      },
      {
        id: "gpt-4",
        name: "GPT-4",
        description: "Proven model - universal",
      },
    ],
  },
  {
    id: "gemini",
    name: "Google Gemini",
    icon: "🌟",
    endpoint: "/api/chat/gemini",
    recommendedModel: "gemini-2.5-flash",
    models: [
      {
        id: "gemini-2.5-pro",
        name: "Gemini 2.5 Pro",
        description: "Best Gemini - great for analysis and long texts",
      },
      {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        description: "Very fast and cheap - for high volume tasks",
      },
      {
        id: "gemini-2.5-flash-lite-preview-06-17",
        name: "Gemini 2.5 Flash-Lite",
        description: "Cheapest - for mass processing",
      },
      {
        id: "gemini-1.5-flash-8b",
        name: "Gemini 1.5 Flash 8B",
        description: "Very fast - for simple tasks",
      },
    ],
  },
  {
    id: "grok",
    name: "Grok (X.AI)",
    icon: "⚡",
    endpoint: "/api/chat/grok",
    recommendedModel: "grok-3-mini",
    models: [
      {
        id: "grok-4-0709",
        name: "Grok 4",
        description: "Latest Grok - best for reasoning",
      },
      {
        id: "grok-3",
        name: "Grok 3",
        description: "Fast and intelligent - good choice",
      },
      {
        id: "grok-3-mini",
        name: "Grok 3 Mini",
        description: "Cheaper Grok 3 - still thinks logically",
      },
      {
        id: "grok-3-fast",
        name: "Grok 3 Fast",
        description: "Very fast responses",
      },
      {
        id: "grok-2-vision-1212",
        name: "Grok 2 Vision",
        description: "Analyzes images and text",
      },
      {
        id: "grok-2-latest",
        name: "Grok 2 Latest",
        description: "Older version - still useful",
      },
      {
        id: "grok-2-mini",
        name: "Grok 2 Mini",
        description: "Basic model - cheap and simple",
      },
    ],
  },
  {
    id: "perplexity",
    name: "Perplexity",
    icon: "🔍",
    endpoint: "/api/chat/perplexity",
    recommendedModel: "sonar",
    models: [
      {
        id: "sonar-pro",
        name: "Sonar Pro",
        description: "Searches the internet and provides current information",
      },
      {
        id: "sonar",
        name: "Sonar",
        description: "Basic internet search",
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
        name: " Chat",
        description: "Main model for general conversations",
      },
      {
        id: "deepseek-coder",
        name: "Coder",
        description: "For coding tasks",
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
  return QUESTION_PROVIDER.id === providerId ? QUESTION_PROVIDER : undefined;
}
