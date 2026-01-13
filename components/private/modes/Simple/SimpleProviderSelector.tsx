"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";
import { PROVIDERS, getProvider } from "@/lib/providers/ai-config";
import { motion, AnimatePresence } from "framer-motion";

interface SimpleProviderSelectorProps {
  selectedProvider: string;
  selectedModel: string;
  onProviderChange: (provider: string, model: string) => void;
  disabled?: boolean;
}

export default function SimpleProviderSelector({
  selectedProvider,
  selectedModel,
  onProviderChange,
  disabled = false,
}: SimpleProviderSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentProvider = getProvider(selectedProvider);
  const currentModel =
    currentProvider.models.find((m) => m.id === selectedModel) ||
    currentProvider.models[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsExpanded(!isExpanded)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3.5 py-2
          bg-gray-900/40 backdrop-blur-md border border-gray-700/50 
          rounded-2xl text-[11px] sm:text-[13px] font-semibold text-gray-200 
          hover:bg-gray-800/60 hover:border-gray-600/50 transition-all duration-200
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${isExpanded ? "border-blue-500/50 ring-1 ring-blue-500/20" : ""}
          min-w-[120px] justify-between shadow-lg
        `}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div
            className={`flex items-center justify-center ${currentProvider.colors.text} flex-shrink-0`}
          >
            <currentProvider.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <span className="truncate">
            {currentProvider.name} · {currentModel.name}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-full right-0 mb-2 w-64 bg-black/95 backdrop-blur-xl border border-gray-800 shadow-2xl rounded-2xl overflow-hidden z-[1001]"
          >
            <div className="py-2.5 max-h-80 overflow-y-auto custom-scrollbar">
              <div className="px-4 py-2 text-[11px] uppercase tracking-wider font-bold text-gray-500 border-b border-gray-800/50 mb-1.5">
                AI Provider & Model
              </div>
              {Object.values(PROVIDERS).map((provider) => (
                <div key={provider.id} className="mb-3 last:mb-0">
                  <div className="px-4 py-1.5 flex items-center gap-2.5 mb-1 text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                    <div
                      className={`p-1.5 rounded-lg bg-gradient-to-br ${provider.colors.fadeBg} ${provider.colors.text}`}
                    >
                      <provider.icon className="w-4 h-4" />
                    </div>
                    {provider.name}
                  </div>
                  {provider.models.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        onProviderChange(provider.id, model.id);
                        setIsExpanded(false);
                      }}
                      className={`
                        w-full flex items-center justify-between px-4 py-3
                        hover:bg-white/5 transition-colors text-left
                        ${
                          selectedProvider === provider.id &&
                          selectedModel === model.id
                            ? "bg-white/5"
                            : ""
                        }
                      `}
                    >
                      <div className="flex-1 min-w-0 ml-2">
                        <div
                          className={`text-sm font-semibold leading-tight ${
                            selectedProvider === provider.id &&
                            selectedModel === model.id
                              ? "text-white"
                              : "text-gray-300"
                          }`}
                        >
                          {model.name}
                        </div>
                        {model.description && (
                          <div className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                            {model.description}
                          </div>
                        )}
                      </div>
                      {selectedProvider === provider.id &&
                        selectedModel === model.id && (
                          <Check className="w-4 h-4 text-blue-400 flex-shrink-0 ml-2" />
                        )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
