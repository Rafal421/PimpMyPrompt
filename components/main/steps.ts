import { MessageSquare, Lightbulb, Cpu, Award } from "lucide-react";

// Data for steps
const steps = [
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
];

export { steps };
