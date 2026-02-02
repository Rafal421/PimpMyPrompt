"use client";

import React from "react";
import { Check } from "lucide-react";
import { COMPARE_MODELS, CompareModel } from "@/lib/chat/compare-config";
import { getProvider } from "@/lib/providers/ai-config";

interface CompareModelSelectionProps {
  selectedModels: string[];
  onToggleModel: (modelId: string) => void;
  disabled?: boolean;
}

export default function CompareModelSelection({
  selectedModels,
  onToggleModel,
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
          const isSelected = selectedModels.includes(model.id);

          return (
            <button
              key={model.id}
              onClick={() => onToggleModel(model.id)}
              disabled={disabled}
              className={`
                group relative flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5
                rounded-xl border transition-all duration-300 min-w-[140px] sm:min-w-[170px] justify-between
                ${
                  isSelected
                    ? `bg-gradient-to-br ${provider.colors.fadeBg} ${provider.colors.border} ${provider.colors.text}`
                    : "bg-black/40 border-gray-700/50 text-gray-400 hover:border-gray-600/50"
                }
                ${
                  disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer hover:scale-105"
                }
              `}
            >
              <div className="flex items-center gap-2">
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
              </div>

              <div
                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${
                  provider.colors.bg
                } flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                  isSelected ? "opacity-100 scale-100" : "opacity-0 scale-50"
                }`}
              >
                <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="text-center text-xs sm:text-sm text-gray-500">
        {selectedModels.length === 0 ? (
          <span className="text-amber-400">
            Select at least one model to compare
          </span>
        ) : (
          <span>
            {selectedModels.length} of {COMPARE_MODELS.length} models selected
          </span>
        )}
      </div>
    </div>
  );
}
