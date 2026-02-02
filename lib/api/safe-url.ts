const ALLOWED_PROVIDERS = [
  "openai",
  "anthropic",
  "gemini",
  "grok",
  "deepseek",
  "perplexity",
] as const;

export type AllowedProvider = (typeof ALLOWED_PROVIDERS)[number];

export function isValidProvider(provider: string): provider is AllowedProvider {
  return ALLOWED_PROVIDERS.includes(provider as AllowedProvider);
}

export function getInternalBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  const port = process.env.PORT || 3000;
  return `http://localhost:${port}`;
}

export function getProviderUrl(provider: string): URL {
  if (!isValidProvider(provider)) {
    throw new Error(`Invalid provider: ${provider}`);
  }
  const baseUrl = getInternalBaseUrl();
  return new URL(`/api/providers/${provider}`, baseUrl);
}
