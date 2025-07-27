"use client";
import { useState, useEffect } from "react";
import { ChevronDown, Check, ArrowRight, Sparkles } from "lucide-react";
import type { Provider, ProviderConfig } from "@/lib/types";

interface ProviderTileProps {
  providerConfig: ProviderConfig;
  onSelect: (provider: Provider, model: string) => void;
  disabled: boolean;
}

export default function ProviderTile({
  providerConfig,
  onSelect,
  disabled,
}: ProviderTileProps) {
  const [selectedModel, setSelectedModel] = useState(
    providerConfig.recommendedModel
  );
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isExpanded]);

  return (
    <div
      className={`group relative bg-black/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 hover:bg-black/60 hover:border-gray-700/50 transition-all duration-300 ${
        isExpanded ? "z-[1000]" : "z-10"
      }`}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
            {providerConfig.icon}
          </div>
          <div>
            <h5 className="font-bold text-white text-lg group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
              {providerConfig.name}
            </h5>
            <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
              AI Provider
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl text-sm font-medium text-gray-200 hover:bg-gray-800/50 hover:border-gray-600/50 transition-all duration-200"
              disabled={disabled}
            >
              <span className="flex items-center gap-2">
                {
                  providerConfig.models.find((m) => m.id === selectedModel)
                    ?.name
                }
                {selectedModel === providerConfig.recommendedModel && (
                  <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-0.5 rounded-full font-medium">
                    Recommended
                  </span>
                )}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>

            {isExpanded && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl z-[999] max-h-60 overflow-y-auto">
                {providerConfig.models.map((modelOption) => (
                  <button
                    key={modelOption.id}
                    onClick={() => {
                      setSelectedModel(modelOption.id);
                      setIsExpanded(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-800/60 flex items-center justify-between text-gray-200 hover:text-white transition-all duration-200 first:rounded-t-xl last:rounded-b-xl"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {modelOption.name}
                      </div>
                      {modelOption.description && (
                        <div className="text-xs text-gray-400 mt-1 truncate">
                          {modelOption.description}
                        </div>
                      )}
                    </div>
                    {selectedModel === modelOption.id && (
                      <Check className="w-4 h-4 text-blue-400 flex-shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Backdrop to close dropdown when clicking outside */}
            {isExpanded && (
              <div
                className="fixed inset-0 z-[998]"
                onClick={() => setIsExpanded(false)}
              />
            )}
          </div>

          <button
            onClick={() =>
              onSelect(providerConfig.id as Provider, selectedModel)
            }
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group/btn shadow-lg hover:shadow-xl"
            disabled={disabled}
          >
            <Sparkles className="w-4 h-4" />
            Select
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
