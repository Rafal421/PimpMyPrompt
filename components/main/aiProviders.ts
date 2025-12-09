import { Sparkles, Brain, Zap, Search, Code } from "lucide-react";

// Data for AI providers
const aiProviders = [
  {
    name: "OpenAI",
    description:
      "Perfect for creative writing, storytelling, and natural conversations. Excels at generating engaging content and brainstorming ideas.",
    icon: Brain,
    color: "green",
    bgColor: "bg-green-500/20",
    textColor: "text-green-400",
    borderColor: "border-green-500/30",
    hoverColor: "hover:border-green-500/50",
  },
  {
    name: "Anthropic",
    description:
      "Specializes in deep analysis, complex reasoning, and thoughtful responses. Best choice for research and detailed explanations.",
    icon: Brain,
    color: "orange",
    bgColor: "bg-orange-500/20",
    textColor: "text-orange-400",
    borderColor: "border-orange-500/30",
    hoverColor: "hover:border-orange-500/50",
  },
  {
    name: "Google Gemini",
    description:
      "Advanced multimodal AI that processes text, images, and data seamlessly. Ideal for complex analysis and structured information tasks.",
    icon: Sparkles,
    color: "blue",
    bgColor: "bg-blue-500/20",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/30",
    hoverColor: "hover:border-blue-500/50",
  },
  {
    name: "Grok",
    description:
      "Provides real-time information with a witty, conversational style. Great for current events and engaging discussions.",
    icon: Zap,
    color: "purple",
    bgColor: "bg-purple-500/20",
    textColor: "text-purple-400",
    borderColor: "border-purple-500/30",
    hoverColor: "hover:border-purple-500/50",
  },
  {
    name: "DeepSeek",
    description:
      "Engineering-focused AI that excels in coding, debugging, and technical problem-solving. Your go-to for development challenges.",
    icon: Code,
    color: "cyan",
    bgColor: "bg-cyan-500/20",
    textColor: "text-cyan-400",
    borderColor: "border-cyan-500/30",
    hoverColor: "hover:border-cyan-500/50",
  },
  {
    name: "Perplexity",
    description:
      "Research-powered AI that provides accurate, fact-checked information. Perfect for academic work and factual inquiries.",
    icon: Search,
    color: "rose",
    bgColor: "bg-rose-500/20",
    textColor: "text-rose-400",
    borderColor: "border-rose-500/30",
    hoverColor: "hover:border-rose-500/50",
  },
];

export { aiProviders };
