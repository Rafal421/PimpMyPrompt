"use client";
import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import type { CompareResponse } from "@/lib/shared/types";
import { getProvider } from "@/lib/providers/ai-config";

interface CompareResponsesProps {
  responses: CompareResponse[];
  isLoading?: boolean;
  messageIndex?: number;
  chatId?: string | null;
  summary?: string;
}

export function CompareResponses({
  responses,
  isLoading,
  messageIndex = 0,
  chatId,
  summary,
}: CompareResponsesProps) {
  const storageKey = `compare-expanded-${chatId || "temp"}-${messageIndex}`;
  const [expandedResponses, setExpandedResponses] = useState<Set<string>>(
    () => {
      if (typeof window === "undefined") return new Set();

      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          return new Set(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to load expanded state:", e);
      }
      return new Set();
    }
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(Array.from(expandedResponses))
      );
    } catch (e) {
      console.error("Failed to save expanded state:", e);
    }
  }, [expandedResponses, storageKey]);

  const toggleExpanded = (modelId: string) => {
    setExpandedResponses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(modelId)) {
        newSet.delete(modelId);
      } else {
        newSet.add(modelId);
      }
      return newSet;
    });
  };

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-blue-400" />
        <span className="text-sm text-gray-300">
          Comparing {responses.length} AI models
        </span>
      </div>

      {responses.map((response, index) => {
        const isExpanded = expandedResponses.has(response.modelId);
        const showLoading = isLoading && !response.response;
        const provider = getProvider(response.provider);

        return (
          <motion.div
            key={response.modelId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="w-full bg-black/40 backdrop-blur-md border border-gray-800/50 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:border-gray-700/50 transition-all duration-300"
          >
            {/* Model Header - Clickable */}
            <button
              onClick={() => toggleExpanded(response.modelId)}
              className="w-full px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between hover:bg-gray-900/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 bg-gradient-to-br ${provider.colors.fadeBg} ${provider.colors.text} ${provider.colors.fadeBorder} rounded-xl flex items-center justify-center flex-shrink-0 border shadow-inner backdrop-blur-sm`}
                >
                  {React.createElement(provider.icon, {
                    className: "w-5 h-5",
                  })}
                </div>
                <h4 className="font-semibold text-white text-base sm:text-lg">
                  {response.model}
                </h4>
                {!response.success && (
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30">
                    Error
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {showLoading && (
                  <div className="flex gap-1 mr-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                )}
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Response Content - Expandable */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden border-t border-gray-800/50"
                >
                  <div className="px-4 pb-4 sm:px-6 sm:pb-6 pt-2">
                    <div className="prose prose-invert max-w-none">
                      {showLoading ? (
                        <div className="flex items-center gap-2 text-gray-400 py-4">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                          <span className="text-sm">Loading response...</span>
                        </div>
                      ) : response.response ? (
                        <MarkdownRenderer content={response.response} />
                      ) : (
                        <div className="text-gray-400 text-sm py-2">
                          No response available
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Collapsed Preview */}
            {!isExpanded && response.response && !showLoading && (
              <div className="px-4 pb-7 sm:px-6 sm:pb-4 text-sm text-gray-400 line-clamp-2">
                {response.response.slice(0, 150)}
                {response.response.length > 150 && "..."}
              </div>
            )}
          </motion.div>
        );
      })}

      {/* Summary at the bottom */}
      {summary && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="w-full bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-md border border-blue-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mt-4 shadow-2xl shadow-blue-500/10"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-blue-200 text-lg">
              AI Analysis Summary
            </h3>
          </div>
          <div className="prose prose-invert max-w-none">
            <MarkdownRenderer content={summary} />
          </div>
        </motion.div>
      )}
    </div>
  );
}
