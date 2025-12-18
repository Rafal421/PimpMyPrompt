// Configuration for Compare mode models
import type { DatabaseResponseData } from "@/lib/types";

export interface CompareModel {
  id: string;
  name: string;
  provider: string;
}

export const COMPARE_MODELS: CompareModel[] = [
  { id: "gpt-4o-mini", name: "GPT-4o-mini", provider: "openai" },
  {
    id: "claude-3-haiku-20240307",
    name: "Claude Haiku 3",
    provider: "anthropic",
  },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "gemini" },
  {
    id: "grok-4-fast-reasoning",
    name: "Grok 4 fast reasoning",
    provider: "grok",
  },
  { id: "sonar", name: "Perplexity Sonar", provider: "perplexity" },
  { id: "deepseek-chat", name: "DeepSeek Chat", provider: "deepseek" },
];

export const PROVIDER_COLUMN: Record<string, keyof DatabaseResponseData> = {
  openai: "openai_response",
  anthropic: "anthropic_response",
  gemini: "gemini_response",
  grok: "grok_response",
  perplexity: "perplexity_response",
  deepseek: "deepseek_response",
};
