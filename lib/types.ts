// Shared types across the application

export type Provider =
  | "openai"
  | "perplexity"
  | "deepseek"
  | "gemini"
  | "anthropic"
  | "grok";

export type Phase =
  | "init"
  | "clarifying"
  | "improving"
  | "model-selection"
  | "final-response"
  | "done";

export interface Message {
  from: "user" | "bot";
  text: string;
  isTyping?: boolean;
}

export interface QuestionData {
  question: string;
  options: string[];
}

export interface User {
  id: string;
  email?: string;
}

export interface Chat {
  id: string;
  title: string;
}

export interface ProviderConfig {
  id: string;
  name: string;
  icon: string;
  models: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  recommendedModel: string;
}
