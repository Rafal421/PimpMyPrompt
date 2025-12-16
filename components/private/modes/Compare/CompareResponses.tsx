"use client";
import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import type { CompareResponse } from "@/lib/types";

interface CompareResponsesProps {
  responses: CompareResponse[];
  isLoading?: boolean;
  messageIndex?: number;
  chatId?: string | null;
}

export function CompareResponses({
  responses,
  isLoading,
  messageIndex = 0,
  chatId,
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

        return (
          <div
            key={response.modelId}
            className="w-full bg-black/40 backdrop-blur-md border border-gray-800/50 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:border-gray-700/50 transition-all duration-300"
          >
            {/* Model Header - Clickable */}
            <button
              onClick={() => toggleExpanded(response.modelId)}
              className="w-full px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between hover:bg-gray-900/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </span>
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
            {isExpanded && (
              <div className="px-4 pb-4 sm:px-6 sm:pb-6 pt-2 border-t border-gray-800/50">
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
            )}

            {/* Collapsed Preview */}
            {!isExpanded && response.response && !showLoading && (
              <div className="px-4 pb-3 sm:px-6 sm:pb-4 text-sm text-gray-400 line-clamp-2">
                {response.response.slice(0, 150)}
                {response.response.length > 150 && "..."}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
