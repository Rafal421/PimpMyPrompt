// Configuration for AI models and providers

// Best models for asking clarifying questions (fixed selection)
export const QUESTION_PROVIDERS = [
  {
    id: "anthropic",
    name: "Claude",
    modleName: "Opus 4",
    model: "claude-opus-4-20250514",
    endpoint: "/api/chat/anthropic",
  },
  {
    id: "openai",
    name: "OpenAI",
    modleName: "4o",
    model: "gpt-4o",
    endpoint: "/api/chat/openai",
  },
  {
    id: "gemini",
    name: "Gemini",
    modleName: "2.5 flash lite",
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
    recommendedModel: "claude-opus-4-20250514",
    models: [
      {
        id: "claude-opus-4-20250514",
        name: "Opus 4",
        description: "Najlepszy Claude - do trudnych zadań i analiz",
      },
      {
        id: "claude-sonnet-4-20250514",
        name: "Sonnet 4",
        description: "Dobry stosunek jakości do szybkości",
      },
      {
        id: "claude-3-7-sonnet-20250219",
        name: " Sonnet 3.7",
        description: "Ulepszona wersja - bardziej precyzyjny",
      },
      {
        id: "claude-3-5-sonnet-20241022",
        name: "Sonnet 3.5 v2",
        description: "Sprawdzony model do codziennej pracy",
      },
      {
        id: "claude-3-5-sonnet-20240620",
        name: "Claude Sonnet 3.5",
        description: "Starsza wersja 3.5 - nadal dobra",
      },
      {
        id: "claude-3-5-haiku-20241022",
        name: "Haiku 3.5",
        description: "Bardzo szybki - do prostych zadań",
      },
      {
        id: "claude-3-haiku-20240307",
        name: "Haiku 3",
        description: "Podstawowy model - tani i szybki",
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
        description: "Najlepszy GPT - świetny do pisania i kreatywności",
      },
      {
        id: "o3",
        name: "o3 (Reasoning)",
        description: "Myśli dłużej - idealny do trudnych problemów",
      },
      {
        id: "o4-mini",
        name: "o4 Mini",
        description: "Szybki do matematyki i nauki",
      },
      {
        id: "gpt-4.1",
        name: "GPT-4.1",
        description: "Najlepszy do programowania i kodu",
      },
      {
        id: "gpt-4o-mini",
        name: "GPT-4o Mini",
        description: "Szybki i tani - do prostych zadań",
      },
      {
        id: "o3-mini",
        name: "o3 Mini",
        description: "Tańsza wersja o3 - nadal myśli logicznie",
      },
      {
        id: "gpt-4-turbo",
        name: "GPT-4 Turbo",
        description: "Do długich tekstów i dokumentów",
      },
      {
        id: "gpt-4",
        name: "GPT-4",
        description: "Sprawdzony model - uniwersalny",
      },
    ],
  },
  {
    id: "gemini",
    name: "Google Gemini",
    icon: "🌟",
    endpoint: "/api/chat/gemini",
    recommendedModel: "gemini-2.5-pro",
    models: [
      {
        id: "gemini-2.5-pro",
        name: "Gemini 2.5 Pro",
        description: "Najlepszy Gemini - świetny do analizy i długich tekstów",
      },
      {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        description: "Bardzo szybki i tani - do dużej ilości zadań",
      },
      {
        id: "gemini-2.5-flash-lite-preview-06-17",
        name: "Gemini 2.5 Flash-Lite",
        description: "Najtańszy - do masowego przetwarzania",
      },
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        description: "Nowe funkcje - dobry do rozmów w czasie rzeczywistym",
      },
      {
        id: "gemini-pro-vision",
        name: "Gemini Pro Vision",
        description: "Analizuje obrazy i filmy + tekst",
      },
      {
        id: "gemini-1.5-pro",
        name: "Gemini 1.5 Pro",
        description: "Starsza wersja Pro - nadal dobra do analizy",
      },
      {
        id: "gemini-1.5-flash-8b",
        name: "Gemini 1.5 Flash 8B",
        description: "Bardzo szybki - do prostych zadań",
      },
      {
        id: "text-embedding-001",
        name: "Text Embedding 001",
        description: "Do wyszukiwania i porównywania tekstów",
      },
    ],
  },
  {
    id: "grok",
    name: "Grok (X.AI)",
    icon: "⚡",
    endpoint: "/api/chat/grok",
    recommendedModel: "grok-4-0709",
    models: [
      {
        id: "grok-4-0709",
        name: "Grok 4",
        description: "Najnowszy Grok - najlepszy do rozumowania",
      },
      {
        id: "grok-3",
        name: "Grok 3",
        description: "Szybki i inteligentny - dobry wybór",
      },
      {
        id: "grok-3-mini",
        name: "Grok 3 Mini",
        description: "Tańszy Grok 3 - nadal myśli logicznie",
      },
      {
        id: "grok-3-fast",
        name: "Grok 3 Fast",
        description: "Bardzo szybkie odpowiedzi",
      },
      {
        id: "grok-2-vision-1212",
        name: "Grok 2 Vision",
        description: "Analizuje obrazy i tekst",
      },
      {
        id: "grok-2-latest",
        name: "Grok 2 Latest",
        description: "Starsza wersja - nadal użyteczna",
      },
      {
        id: "grok-2-mini",
        name: "Grok 2 Mini",
        description: "Podstawowy model - tani i prosty",
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
        description: "Wyszukuje w internecie i daje aktualne informacje",
      },
      {
        id: "sonar",
        name: "Sonar",
        description: "Podstawowe wyszukiwanie w internecie",
      },
    ],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    icon: "🚀",
    endpoint: "/api/chat/deepseek",
    recommendedModel: "deepseek-v3",
    models: [
      {
        id: "deepseek-v3",
        name: "DeepSeek V3",
        description: "Najnowszy i najlepszy",
      },
      {
        id: "deepseek-r1",
        name: "DeepSeek R1",
        description: "Do trudnych problemów",
      },
      {
        id: "deepseek-chat",
        name: "DeepSeek Chat",
        description: "Do zwykłych rozmów",
      },
      {
        id: "deepseek-coder",
        name: "DeepSeek Coder",
        description: "Do pisania kodu",
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
