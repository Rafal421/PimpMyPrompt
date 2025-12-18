// Shared types across the application

// ========================================
// Core Types & Enums
// ========================================

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

// ========================================
// User & Authentication
// ========================================

export interface User {
  id: string;
  email?: string;
}

// ========================================
// Chat & Messages
// ========================================

export interface Chat {
  id: string;
  title: string;
  created_at?: string;
  mode?: "PMP" | "CHAT" | "COMPARE";
}

export interface Message {
  from: "user" | "bot";
  text: string;
  isTyping?: boolean;
  compareResponses?: CompareResponse[];
  summary?: string;
}

export interface ChatMessage {
  from: "user" | "bot";
  content?: string;
  text?: string;
  compareResponses?: CompareResponse[];
  summary?: string;
}

// ========================================
// API Responses
// ========================================

export interface ChatsListResponse {
  chats: Chat[];
}

// ========================================
// AI Provider Types
// ========================================

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

export interface ProviderResponse {
  model: string;
  modelId: string;
  provider: string;
  response: string;
  success: boolean;
}

// ========================================
// Compare Mode Types
// ========================================

export interface CompareResponse {
  model: string;
  modelId: string;
  provider: string;
  response: string;
  success: boolean;
  isLoading?: boolean;
}

export interface DatabaseResponseData {
  user_id: string;
  chat_id: string | null;
  user_question: string;
  summary: string | null;
  openai_response?: string;
  anthropic_response?: string;
  gemini_response?: string;
  grok_response?: string;
  perplexity_response?: string;
  deepseek_response?: string;
}

// ========================================
// PMP Mode Types
// ========================================

export interface QuestionData {
  question: string;
  options: string[];
}
