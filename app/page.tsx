import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowRight, Wand2, Bot } from "lucide-react";
import { Background } from "@/components/ui/background";

// Data for steps
const steps = [
  {
    id: 1,
    title: "Ask Your Question",
    description:
      "Start by typing your initial question or prompt. Don't worry about making it perfect - we'll help refine it.",
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
    color: "orange",
    bgColor: "from-orange-500/20 to-red-600/20",
    borderColor: "border-orange-500/20",
    textColor: "text-orange-400",
    hoverColor: "hover:border-orange-500/30",
  },
];

// Data for AI providers
const aiProviders = [
  {
    name: "OpenAI",
    model: "GPT-4 & GPT-3.5",
    icon: "O",
    color: "green",
    hoverColor: "hover:border-green-500/30",
  },
  {
    name: "Anthropic",
    model: "Claude 3.5 Sonnet",
    icon: "A",
    color: "orange",
    hoverColor: "hover:border-orange-500/30",
  },
  {
    name: "Google Gemini",
    model: "Gemini Pro",
    icon: "G",
    color: "blue",
    hoverColor: "hover:border-blue-500/30",
  },
  {
    name: "Grok",
    model: "by xAI",
    icon: "X",
    color: "purple",
    hoverColor: "hover:border-purple-500/30",
  },
  {
    name: "DeepSeek",
    model: "Advanced Models",
    icon: "D",
    color: "teal",
    hoverColor: "hover:border-teal-500/30",
  },
  {
    name: "Perplexity",
    model: "Research AI",
    icon: "P",
    color: "pink",
    hoverColor: "hover:border-pink-500/30",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black relative">
      {/* Background */}
      <Background />

      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-30 p-4 sm:p-6 flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Bot className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
          </div>
          <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
            PimpMyPrompt
          </span>
        </div>
        <Link href="/login">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2">
            Get Started
          </Button>
        </Link>
      </nav>

      {/* Main content */}
      <div className="relative z-10">
        {/* Hero Section - Full Screen */}
        <div className="min-h-screen flex items-center justify-center px-4 pt-16 sm:pt-0">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo/Icon */}
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl">
                <Wand2 className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
                PimpMyPrompt
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-6 sm:mb-8 leading-relaxed px-2">
              Transform your AI prompts from ordinary to extraordinary.{" "}
              <span className="text-white font-semibold">
                Get better results, faster responses, and more creative outputs.
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              <Link href="/login" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-base sm:text-lg">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-600 text-white hover:bg-white/10 rounded-xl font-semibold transition-all duration-300 text-base sm:text-lg backdrop-blur-sm bg-transparent"
              >
                Watch Demo
                <Sparkles className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <section className="py-12 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto mb-8 sm:mb-16">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto px-2">
              Our intelligent 4-step process ensures you get the most out of
              every AI conversation
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto mb-8 sm:mb-16">
            {steps.map((step) => (
              <Card
                key={step.id}
                className={`bg-black/40 backdrop-blur-md border border-gray-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 ${step.hoverColor}`}
              >
                <CardContent className="p-6 sm:p-8 text-center">
                  <div
                    className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${step.bgColor} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 border ${step.borderColor}`}
                  >
                    <span className={`text-xl sm:text-2xl font-bold ${step.textColor}`}>
                      {step.id}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* AI Providers Section */}
        <section className="py-12 sm:py-20 px-4 sm:px-6 border-t border-gray-800/50 max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              AI Providers
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto px-2">
              Choose from leading AI models
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {aiProviders.map((provider, index) => (
              <Card
                key={index}
                className={`bg-black/40 backdrop-blur-md border border-gray-800/50 transition-all duration-300 ${provider.hoverColor}`}
              >
                <CardContent className="p-4 sm:p-6 text-center">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 bg-${provider.color}-500/20 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4`}
                  >
                    <span
                      className={`text-lg sm:text-xl font-bold text-${provider.color}-400`}
                    >
                      {provider.icon}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">
                    {provider.name}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm">{provider.model}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-6 sm:py-8 px-4 sm:px-6 border-t border-gray-800/50 max-w-6xl mx-auto mt-12 sm:mt-20">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <span className="text-white font-semibold text-sm sm:text-base">PimpMyPrompt</span>
            </div>
            <div className="text-gray-400 text-xs sm:text-sm text-center md:text-right px-2">
              © 2025 PimpMyPrompt. Enhancing AI conversations through
              intelligent prompt refinement.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
