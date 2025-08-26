"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  ArrowRight,
  Wand2,
  Bot,
  MessageSquare,
  Lightbulb,
  Cpu,
  Award,
  Brain,
  Zap,
  Search,
  Code,
} from "lucide-react";
import { Background } from "@/components/ui/background";

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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black relative">
      {/* Background */}
      <Background />

      {/* Navigation */}
      <motion.nav
        className="absolute top-0 left-0 right-0 z-30 p-4 sm:p-6 flex justify-between items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="flex items-center gap-2 sm:gap-3"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <motion.div
            className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <Bot className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
          </motion.div>
          <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
            PimpMyPrompt
          </span>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link href="/login">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2">
              Get Started
            </Button>
          </Link>
        </motion.div>
      </motion.nav>

      {/* Main content */}
      <div className="relative z-10">
        {/* Hero Section - Full Screen */}
        <div className="min-h-screen flex items-center justify-center px-4 pt-16 sm:pt-0">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo/Icon */}
            <motion.div
              className="flex justify-center mb-6 sm:mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl">
                <Wand2 className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              className="text-4xl sm:text-6xl md:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
                PimpMyPrompt
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-6 sm:mb-8 leading-relaxed px-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            >
              Transform your AI prompts from ordinary to extraordinary.{" "}
              <span className="text-white font-semibold">
                Get better results, faster responses, and more creative outputs.
              </span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            >
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
            </motion.div>
          </div>
        </div>

        {/* How It Works Section */}
        <section className="py-12 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto mb-8 sm:mb-16">
          <motion.div
            className="text-center mb-8 sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto px-2">
              Our intelligent 4-step process ensures you get the most out of
              every AI conversation
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto mb-8 sm:mb-16">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card
                    className={`bg-black/40 backdrop-blur-md border border-gray-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 ${step.hoverColor} h-full`}
                  >
                    <CardContent className="p-6 sm:p-8 text-center">
                      <motion.div
                        className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${step.bgColor} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 border ${step.borderColor}`}
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                      >
                        <IconComponent
                          className={`w-6 h-6 sm:w-8 sm:h-8 ${step.textColor}`}
                        />
                      </motion.div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
                        {step.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* AI Providers Section */}
        <section className="py-12 sm:py-20 px-4 sm:px-6 border-t border-gray-800/50 max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-8 sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              AI Providers
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto px-2">
              Choose from leading AI models
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {aiProviders.map((provider, index) => {
              const IconComponent = provider.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -3, scale: 1.02 }}
                >
                  <Card
                    className={`bg-black/40 backdrop-blur-md border border-gray-800/50 transition-all duration-300 ${provider.hoverColor} h-full`}
                  >
                    <CardContent className="p-4 sm:p-6 text-center">
                      <motion.div
                        className={`w-10 h-10 sm:w-12 sm:h-12 ${provider.bgColor} rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 border ${provider.borderColor}`}
                        initial={{ scale: 0, rotate: -45 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <IconComponent
                          className={`w-5 h-5 sm:w-6 sm:h-6 ${provider.textColor}`}
                        />
                      </motion.div>
                      <h3 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">
                        {provider.name}
                      </h3>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        {provider.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <motion.footer
          className="py-6 sm:py-8 px-4 sm:px-6 border-t border-gray-800/50 max-w-6xl mx-auto mt-12 sm:mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div
              className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-0"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <motion.div
                className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </motion.div>
              <span className="text-white font-semibold text-sm sm:text-base">
                PimpMyPrompt
              </span>
            </motion.div>
            <motion.div
              className="text-gray-400 text-xs sm:text-sm text-center md:text-right px-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              © 2025 PimpMyPrompt. Enhancing AI conversations through
              intelligent prompt refinement.
            </motion.div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
