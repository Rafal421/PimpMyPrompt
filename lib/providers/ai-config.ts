import {
  Brain,
  Cloud,
  Sparkles,
  Zap,
  Code,
  Search,
  type LucideIcon,
} from "lucide-react";
import { Provider, AIModel, AIProvider } from "@/lib/shared/types";

export const PROVIDERS: Record<string, AIProvider> = {
  openai: {
    id: "openai",
    name: "OpenAI",
    icon: Brain,
    emoji: "🧠",
    recommendedModel: "gpt-4o-mini",
    models: [
      {
        id: "gpt-4o",
        name: "GPT-4o",
        description: "Best for writing, creativity and complex instructions",
      },
      {
        id: "o3",
        name: "o3 (Reasoning)",
        description: "Master of logic, math and complex programming",
      },
      {
        id: "gpt-4o-mini",
        name: "GPT-4o Mini",
        description: "Lightning fast and ideal for simple questions",
      },
    ],
    colors: {
      icon: "text-green-400",
      bg: "bg-green-500/20",
      border: "border-green-500/30",
      hover: "hover:border-green-500/50",
      text: "text-green-400",
      glow: "shadow-green-500/20",
      fadeBg: "from-green-500/20 to-green-600/5",
      fadeBorder: "border-green-500/20",
    },
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    icon: Cloud,
    emoji: "☁️",
    recommendedModel: "claude-sonnet-4-5-20250929",
    models: [
      {
        id: "claude-sonnet-4-5-20250929",
        name: "Claude Sonnet 4.5",
        description: "Smartest model, most human-like responses",
      },
      {
        id: "claude-haiku-4-5-20251001",
        name: "Claude Haiku 4.5",
        description: "Extremely fast analysis and answers",
      },
      {
        id: "claude-3-7-sonnet-20250219",
        name: "Sonnet 3.7",
        description: "Balanced power and precision",
      },
    ],
    colors: {
      icon: "text-orange-400",
      bg: "bg-orange-500/20",
      border: "border-orange-500/30",
      hover: "hover:border-orange-500/50",
      text: "text-orange-400",
      glow: "shadow-orange-500/20",
      fadeBg: "from-orange-500/20 to-orange-600/5",
      fadeBorder: "border-orange-500/20",
    },
  },
  gemini: {
    id: "gemini",
    name: "Google Gemini",
    icon: Sparkles,
    emoji: "✨",
    recommendedModel: "gemini-2.5-flash",
    models: [
      {
        id: "gemini-3-flash-preview",
        name: "Gemini 3.0 Flash",
        description: "Modern, fast and multi-modal",
      },
      {
        id: "gemini-2.5-pro",
        name: "Gemini 2.5 Pro",
        description: "Powerful, best for file and PDF analysis",
      },
      {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        description: "Super fast for simple inquiries",
      },
    ],
    colors: {
      icon: "text-blue-400",
      bg: "bg-blue-500/20",
      border: "border-blue-500/30",
      hover: "hover:border-blue-500/50",
      text: "text-blue-400",
      glow: "shadow-blue-500/20",
      fadeBg: "from-blue-500/20 to-blue-600/5",
      fadeBorder: "border-blue-500/20",
    },
  },
  grok: {
    id: "grok",
    name: "Grok",
    icon: Zap,
    emoji: "⚡",
    recommendedModel: "grok-3-mini",
    models: [
      {
        id: "grok-4-fast-reasoning",
        name: "Grok 4 Fast",
        description: "Best for fast reasoning and real-time insights",
      },
      {
        id: "grok-3",
        name: "Grok 3",
        description: "Balanced intelligence and speed",
      },
      {
        id: "grok-3-mini",
        name: "Grok 3 Mini",
        description: "Efficient and smart for everyday tasks",
      },
    ],
    colors: {
      icon: "text-purple-400",
      bg: "bg-purple-500/20",
      border: "border-purple-500/30",
      hover: "hover:border-purple-500/50",
      text: "text-purple-400",
      glow: "shadow-purple-500/20",
      fadeBg: "from-purple-500/20 to-purple-600/5",
      fadeBorder: "border-purple-500/20",
    },
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    icon: Code,
    emoji: "💻",
    recommendedModel: "deepseek-chat",
    models: [
      {
        id: "deepseek-chat",
        name: "DeepSeek Chat",
        description: "Versatile model for conversations and logic",
      },
      {
        id: "deepseek-coder",
        name: "DeepSeek Coder",
        description: "Specialist for code and technical tasks",
      },
    ],
    colors: {
      icon: "text-cyan-400",
      bg: "bg-cyan-500/20",
      border: "border-cyan-500/30",
      hover: "hover:border-cyan-500/50",
      text: "text-cyan-400",
      glow: "shadow-cyan-500/20",
      fadeBg: "from-cyan-500/20 to-cyan-600/5",
      fadeBorder: "border-cyan-500/20",
    },
  },
  perplexity: {
    id: "perplexity",
    name: "Perplexity",
    icon: Search,
    emoji: "🔍",
    recommendedModel: "llama-3.1-sonar-large-128k-online",
    models: [
      {
        id: "llama-3.1-sonar-large-128k-online",
        name: "Sonar Online",
        description: "Best for real-time fact checking and source searching",
      },
    ],
    colors: {
      icon: "text-rose-400",
      bg: "bg-rose-500/20",
      border: "border-rose-500/30",
      hover: "hover:border-rose-500/50",
      text: "text-rose-400",
      glow: "shadow-rose-500/20",
      fadeBg: "from-rose-500/20 to-rose-600/5",
      fadeBorder: "border-rose-500/20",
    },
  },
};

export const getProvider = (id: string): AIProvider => {
  const provider = PROVIDERS[id.toLowerCase()];
  if (!provider) {
    return PROVIDERS.openai;
  }
  return provider;
};

export const getAllProviders = () => Object.values(PROVIDERS);

export const RESPONSE_PROVIDERS = getAllProviders();

export const getAllowedModelsForProvider = (providerId: string): string[] => {
  const provider = PROVIDERS[providerId.toLowerCase()];
  if (!provider) return [];
  return provider.models.map((m) => m.id);
};

export const DEFAULT_QUESTION_PROVIDER: Provider = "openai";
export const getQuestionProviderById = getProvider;
