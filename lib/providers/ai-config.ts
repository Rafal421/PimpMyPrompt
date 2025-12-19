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
    description:
      "Perfect for creative writing, storytelling, and natural conversations. Excels at generating engaging content and brainstorming ideas.",
    icon: Brain,
    emoji: "🧠",
    recommendedModel: "gpt-4o-mini",
    models: [
      { id: "gpt-4o", name: "GPT-4o", description: "Best for writing and creativity" },
      { id: "o3", name: "o3 (Reasoning)", description: "Ideal for complex problems" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Fast and efficient" },
    ],
    colors: {
      icon: "text-green-400",
      bg: "bg-green-500/20",
      border: "border-green-500/30",
      hover: "hover:border-green-500/50",
      text: "text-green-400",
      fadeBg: "from-green-500/20 to-green-600/5",
      fadeBorder: "border-green-500/20",
    },
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    description:
      "Specializes in deep analysis, complex reasoning, and thoughtful responses. Best choice for research and detailed explanations.",
    icon: Cloud,
    emoji: "☁️",
    recommendedModel: "claude-sonnet-4-5-20250929",
    models: [
      { id: "claude-sonnet-4-5-20250929", name: "Claude Sonnet 4.5", description: "Smartest model" },
      { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5", description: "Fastest model" },
      { id: "claude-3-7-sonnet-20250219", name: "Sonnet 3.7", description: "Precise and balanced" },
    ],
    colors: {
      icon: "text-orange-400",
      bg: "bg-orange-500/20",
      border: "border-orange-500/30",
      hover: "hover:border-orange-500/50",
      text: "text-orange-400",
      fadeBg: "from-orange-500/20 to-orange-600/5",
      fadeBorder: "border-orange-500/20",
    },
  },
  gemini: {
    id: "gemini",
    name: "Google Gemini",
    description:
      "Advanced multimodal AI that processes text, images, and data seamlessly. Ideal for complex analysis and structured information tasks.",
    icon: Sparkles,
    emoji: "✨",
    recommendedModel: "gemini-2.5-flash",
    models: [
      { id: "gemini-3.0-flash", name: "Gemini 3.0 Flash", description: "High volume tasks" },
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", description: "Best for long texts" },
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", description: "Fast and cheap" },
    ],
    colors: {
      icon: "text-blue-400",
      bg: "bg-blue-500/20",
      border: "border-blue-500/30",
      hover: "hover:border-blue-500/50",
      text: "text-blue-400",
      fadeBg: "from-blue-500/20 to-blue-600/5",
      fadeBorder: "border-blue-500/20",
    },
  },
  grok: {
    id: "grok",
    name: "Grok",
    description:
      "Provides real-time information with a witty, conversational style. Great for current events and engaging discussions.",
    icon: Zap,
    emoji: "⚡",
    recommendedModel: "grok-3-mini",
    models: [
      { id: "grok-4-fast-reasoning", name: "Grok 4 Fast", description: "Complex tasks" },
      { id: "grok-3", name: "Grok 3", description: "Intelligent choice" },
      { id: "grok-3-mini", name: "Grok 3 Mini", description: "Logical and cheap" },
    ],
    colors: {
      icon: "text-purple-400",
      bg: "bg-purple-500/20",
      border: "border-purple-500/30",
      hover: "hover:border-purple-500/50",
      text: "text-purple-400",
      fadeBg: "from-purple-500/20 to-purple-600/5",
      fadeBorder: "border-purple-500/20",
    },
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    description:
      "Engineering-focused AI that excels in coding, debugging, and technical problem-solving. Your go-to for development challenges.",
    icon: Code,
    emoji: "💻",
    recommendedModel: "deepseek-chat",
    models: [
      { id: "deepseek-chat", name: "Chat", description: "General conversations" },
      { id: "deepseek-coder", name: "Coder", description: "Coding tasks" },
    ],
    colors: {
      icon: "text-cyan-400",
      bg: "bg-cyan-500/20",
      border: "border-cyan-500/30",
      hover: "hover:border-cyan-500/50",
      text: "text-cyan-400",
      fadeBg: "from-cyan-500/20 to-cyan-600/5",
      fadeBorder: "border-cyan-500/20",
    },
  },
  perplexity: {
    id: "perplexity",
    name: "Perplexity",
    description:
      "Research-powered AI that provides accurate, fact-checked information. Perfect for academic work and factual inquiries.",
    icon: Search,
    emoji: "🔍",
    recommendedModel: "llama-3.1-sonar-large-128k-online",
    models: [
      { id: "llama-3.1-sonar-large-128k-online", name: "Sonar Large", description: "Fact-checked search" },
    ],
    colors: {
      icon: "text-rose-400",
      bg: "bg-rose-500/20",
      border: "border-rose-500/30",
      hover: "hover:border-rose-500/50",
      text: "text-rose-400",
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
