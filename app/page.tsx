import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowRight, Wand2, Bot } from "lucide-react";

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
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]" />
      </div>

      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-30 p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
            PimpMyPrompt
          </span>
        </div>
        <Link href="/login">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
            Get Started
          </Button>
        </Link>
      </nav>

      {/* Main content */}
      <div className="relative z-10">
        {/* Hero Section - Full Screen */}
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo/Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <Wand2 className="h-10 w-10 text-white" />
              </div>
            </div>

            {/* Main heading */}
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
                PimpMyPrompt
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Transform your AI prompts from ordinary to extraordinary.{" "}
              <span className="text-white font-semibold">
                Get better results, faster responses, and more creative outputs.
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/login">
                <Button className="w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-lg">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full sm:w-auto h-14 px-8 border-2 border-gray-600 text-white hover:bg-white/10 rounded-xl font-semibold transition-all duration-300 text-lg backdrop-blur-sm bg-transparent"
              >
                Watch Demo
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <section className="py-20 px-6 max-w-6xl mx-auto mb-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our intelligent 4-step process ensures you get the most out of
              every AI conversation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
            {steps.map((step) => (
              <Card
                key={step.id}
                className={`bg-black/40 backdrop-blur-md border border-gray-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 ${step.hoverColor}`}
              >
                <CardContent className="p-8 text-center">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${step.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 border ${step.borderColor}`}
                  >
                    <span className={`text-2xl font-bold ${step.textColor}`}>
                      {step.id}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* AI Providers Section */}
        <section className="py-20 px-6 border-t border-gray-800/50 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              AI Providers
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Choose from leading AI models
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {aiProviders.map((provider, index) => (
              <Card
                key={index}
                className={`bg-black/40 backdrop-blur-md border border-gray-800/50 transition-all duration-300 ${provider.hoverColor}`}
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-12 h-12 bg-${provider.color}-500/20 rounded-xl flex items-center justify-center mx-auto mb-4`}
                  >
                    <span
                      className={`text-xl font-bold text-${provider.color}-400`}
                    >
                      {provider.icon}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {provider.name}
                  </h3>
                  <p className="text-gray-400 text-sm">{provider.model}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-gray-800/50 max-w-6xl mx-auto mt-20">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <span className="text-white font-semibold">PimpMyPrompt</span>
            </div>
            <div className="text-gray-400 text-sm text-center md:text-right">
              © 2025 PimpMyPrompt. Enhancing AI conversations through
              intelligent prompt refinement.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
