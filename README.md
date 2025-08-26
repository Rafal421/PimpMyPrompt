# 🎯 PimpMyPrompt

**An intelligent AI chat application that helps you craft better prompts through guided conversations**

> ⚠️ **Project Status**: Currently in active development. Features and APIs may change.

## What it does

PimpMyPrompt transforms your basic questions into optimized prompts by:

1. Asking smart clarifying questions
2. Refining your original prompt
3. Letting you choose from multiple AI providers
4. Delivering better, more targeted responses

## 🤖 Supported AI Providers

- **Anthropic Claude** (Sonnet, Haiku)
- **OpenAI GPT** (4o, 4o-mini)
- **Google Gemini**
- **Grok, Perplexity, DeepSeek**

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- AI Provider API keys

### Setup

```bash
# Clone and install
git clone https://github.com/Rafal421/PimpMyPrompt.git
cd PimpMyPrompt
npm install

# Create .env.local file
cp .env.example .env.local
# Add your API keys to .env.local

# Setup database
npm install -g supabase
supabase link --project-ref your_project_ref
supabase db push

# Run development server
npm run dev
```

Visit `http://localhost:3000`

## 🔧 Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Providers (at least one required)
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_google_key
GROK_API_KEY=your_grok_key
PERPLEXITY_API_KEY=your_perplexity_key
DEEPSEEK_API_KEY=your_deepseek_key
NGROK_AUTHTOKEN=your_ngrok_key
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase, Multiple AI SDKs
- **Auth**: Supabase Authentication

## 📝 Scripts

```bash
npm run dev        # Development server
npm run build      # Production build
npm run lint       # Code linting
```

## 🤝 Contributing

This is a personal project in development. Feel free to open issues or suggestions!

## 📄 License

Private project - All rights reserved.

---

_Built with Next.js • Powered by Supabase • Multiple AI Integrations_
