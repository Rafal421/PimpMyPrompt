"use client";

import React from "react";
import { Check } from "lucide-react";
import { COMPARE_MODELS, type CompareModel } from "@/lib/chat/compare-config";
import { getProvider } from "@/lib/providers/ai-config";

interface CompareModelSelectionProps {
  selectedProviders: string[];
  onToggleProvider: (providerId: string) => void;
  disabled?: boolean;
}

export default function CompareModelSelection({
  selectedProviders,
  onToggleProvider,
  disabled = false,
}: CompareModelSelectionProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-2 pb-4 space-y-4">
      <div className="text-center">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
          Select AI Models to Compare
        </h3>
        <p className="text-xs sm:text-sm text-gray-400">
          Choose which providers you want to include in the comparison
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {COMPARE_MODELS.map((model) => {
          const provider = getProvider(model.provider);
          const isSelected = selectedProviders.includes(model.provider);

          return (
            <button
              key={model.id}
              onClick={() => onToggleProvider(model.provider)}
              disabled={disabled}
              className={`
                group relative flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5
                rounded-xl border transition-all duration-300
                ${
                  isSelected
                    ? `bg-gradient-to-br ${provider.colors.fadeBg} ${provider.colors.border} ${provider.colors.text}`
                    : "bg-black/40 border-gray-700/50 text-gray-400 hover:border-gray-600/50"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"}
              `}
            >
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-colors
                  ${isSelected ? provider.colors.text : "text-gray-500"}`}
              >
                {React.createElement(provider.icon, {
                  className: "w-4 h-4 sm:w-5 sm:h-5",
                })}
              </div>

              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                {model.name}
              </span>

              {isSelected && (
                <div
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${provider.colors.bg} flex items-center justify-center`}
                >
                  <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="text-center text-xs sm:text-sm text-gray-500">
        {selectedProviders.length === 0 ? (
          <span className="text-amber-400">
            Select at least one provider to compare
          </span>
        ) : (
          <span>
            {selectedProviders.length} of {COMPARE_MODELS.length} models
            selected
          </span>
        )}
      </div>
    </div>
  );
}
