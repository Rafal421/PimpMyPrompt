import {
  Zap,
  MessageSquare,
  GitCompare,
  Lightbulb,
  Cpu,
  Award,
  Send,
  BarChart3,
  LucideIcon,
} from "lucide-react";

export type Mode = "pmp" | "chat" | "compare";

export interface ModeConfig {
  id: Mode;
  label: string;
  icon: LucideIcon;
  description: string;
}

export interface ModeStep {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  hoverColor: string;
}

export const modes: ModeConfig[] = [
  {
    id: "pmp",
    label: "PMP",
    icon: Zap,
    description: "Intelligent prompt improvement",
  },
  {
    id: "chat",
    label: "Chat",
    icon: MessageSquare,
    description: "Simple AI conversation",
  },
  {
    id: "compare",
    label: "Compare",
    icon: GitCompare,
    description: "Compare AI models",
  },
];

export const modeSteps: Record<Mode, ModeStep[]> = {
  pmp: [
    {
      id: 1,
      title: "Ask Your Question",
      description:
        "Start by typing your initial question or prompt. Don't worry about making it perfect - we'll help refine it.",
      icon: MessageSquare,
      color: "blue",
      bgColor: "from-blue-500/20 to-purple-600/20",
      borderColor: "border-blue-500/20",
      textColor: "text-blue-400",
      hoverColor: "hover:border-blue-500/30",
    },
    {
      id: 2,
      title: "Smart Clarification",
      description:
        "Our AI asks targeted follow-up questions to understand your context, goals, and preferences better.",
      icon: Lightbulb,
      color: "purple",
      bgColor: "from-purple-500/20 to-pink-600/20",
      borderColor: "border-purple-500/20",
      textColor: "text-purple-400",
      hoverColor: "hover:border-purple-500/30",
    },
    {
      id: 3,
      title: "Choose AI Provider",
      description:
        "Select the best AI provider for your specific task - each excels in different areas like coding, writing, or analysis.",
      icon: Cpu,
      color: "green",
      bgColor: "from-green-500/20 to-teal-600/20",
      borderColor: "border-green-500/20",
      textColor: "text-green-400",
      hoverColor: "hover:border-green-500/30",
    },
    {
      id: 4,
      title: "Get Enhanced Results",
      description:
        "Receive a detailed, accurate response based on your refined prompt, with the option to improve it further.",
      icon: Award,
      color: "orange",
      bgColor: "from-orange-500/20 to-red-600/20",
      borderColor: "border-orange-500/20",
      textColor: "text-orange-400",
      hoverColor: "hover:border-orange-500/30",
    },
  ],
  chat: [
    {
      id: 1,
      title: "Select AI Provider",
      description:
        "Choose your preferred AI model from our selection of leading providers like OpenAI, Anthropic, or Gemini.",
      icon: Cpu,
      color: "blue",
      bgColor: "from-blue-500/20 to-cyan-600/20",
      borderColor: "border-blue-500/20",
      textColor: "text-blue-400",
      hoverColor: "hover:border-blue-500/30",
    },
    {
      id: 2,
      title: "Type Your Message",
      description:
        "Simply type your question or request. No complex prompts needed - just natural conversation.",
      icon: MessageSquare,
      color: "green",
      bgColor: "from-green-500/20 to-emerald-600/20",
      borderColor: "border-green-500/20",
      textColor: "text-green-400",
      hoverColor: "hover:border-green-500/30",
    },
    {
      id: 3,
      title: "Get Instant Response",
      description:
        "Receive quick, direct answers from your chosen AI model in a conversational format.",
      icon: Send,
      color: "purple",
      bgColor: "from-purple-500/20 to-violet-600/20",
      borderColor: "border-purple-500/20",
      textColor: "text-purple-400",
      hoverColor: "hover:border-purple-500/30",
    },
  ],
  compare: [
    {
      id: 1,
      title: "Select Multiple Models",
      description:
        "Choose 2-4 AI providers you want to compare. Mix and match different models to find the best fit.",
      icon: Cpu,
      color: "blue",
      bgColor: "from-blue-500/20 to-indigo-600/20",
      borderColor: "border-blue-500/20",
      textColor: "text-blue-400",
      hoverColor: "hover:border-blue-500/30",
    },
    {
      id: 2,
      title: "Ask Your Question",
      description:
        "Enter your prompt once - it will be sent to all selected AI models simultaneously.",
      icon: MessageSquare,
      color: "purple",
      bgColor: "from-purple-500/20 to-fuchsia-600/20",
      borderColor: "border-purple-500/20",
      textColor: "text-purple-400",
      hoverColor: "hover:border-purple-500/30",
    },
    {
      id: 3,
      title: "View Side-by-Side",
      description:
        "See all AI responses displayed side-by-side for easy comparison of quality, style, and accuracy.",
      icon: GitCompare,
      color: "green",
      bgColor: "from-green-500/20 to-teal-600/20",
      borderColor: "border-green-500/20",
      textColor: "text-green-400",
      hoverColor: "hover:border-green-500/30",
    },
    {
      id: 4,
      title: "Choose the Best",
      description:
        "Evaluate responses and pick the AI that best suits your needs for future conversations.",
      icon: BarChart3,
      color: "orange",
      bgColor: "from-orange-500/20 to-amber-600/20",
      borderColor: "border-orange-500/20",
      textColor: "text-orange-400",
      hoverColor: "hover:border-orange-500/30",
    },
  ],
};

export const modeDescriptions: Record<Mode, string> = {
  pmp: "Our intelligent 4-step process ensures you get the most out of every AI conversation",
  chat: "Simple and direct - just pick a model and start chatting instantly",
  compare:
    "Send one prompt to multiple AI models and compare their responses side-by-side",
};
