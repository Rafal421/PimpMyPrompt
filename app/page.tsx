"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bot } from "lucide-react";
import { Background } from "@/components/ui/background";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  modes,
  modeSteps,
  modeDescriptions,
  Mode,
} from "@/components/main/modes-config";

export default function HomePage() {
  const [selectedMode, setSelectedMode] = useState<Mode>("pmp");
  const currentSteps = modeSteps[selectedMode];
  return (
    <div className="min-h-screen bg-black relative">
      <Background />

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
          <Link href="/sign-in">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2">
              Get Started
            </Button>
          </Link>
        </motion.div>
      </motion.nav>

      <div className="relative z-10">
        <div className="min-h-screen flex items-center justify-center px-4 pt-16 sm:pt-0">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              className="flex justify-center mb-6 sm:mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <DotLottieReact src="/MainAnimation.json" loop autoplay />
            </motion.div>

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
          </div>
        </div>

        <section className="pt-12 pb-6 sm:pt-20 sm:pb-10 px-4 sm:px-6 max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 sm:mb-8">
              Choose Your Mode
            </h2>

            {/* Mode Switcher */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 bg-gray-900/60 backdrop-blur-md rounded-2xl p-2 sm:p-3 border border-gray-700/50 max-w-fit mx-auto mb-8 sm:mb-10">
              {modes.map((mode) => {
                const Icon = mode.icon;
                const isActive = selectedMode === mode.id;

                return (
                  <motion.button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold
                      transition-all duration-300
                      ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/25"
                          : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{mode.label}</span>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={selectedMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto px-2"
              >
                {modeDescriptions[selectedMode]}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className={`grid grid-cols-1 sm:grid-cols-2 ${currentSteps.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-4 sm:gap-6 max-w-5xl mx-auto mb-8 sm:mb-16`}
            >
              {currentSteps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
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
                          animate={{ scale: 1 }}
                          transition={{
                            duration: 0.5,
                            delay: index * 0.1 + 0.2,
                          }}
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
            </motion.div>
          </AnimatePresence>
        </section>

        <motion.footer
          className="py-6 sm:py-8 px-4 sm:px-6 border-t border-gray-800/50 max-w-6xl mx-auto mt-0 sm:mt-0"
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
              © 2026 PimpMyPrompt. Enhancing AI conversations through
              intelligent prompt refinement.
            </motion.div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
