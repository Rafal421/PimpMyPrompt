"use client";

import { Settings } from "lucide-react";
import { QUESTION_PROVIDERS, getQuestionProviderById } from "@/lib/ai-config";
import type { Provider, Phase } from "@/lib/types";

interface ProviderSelectorProps {
  provider: Provider;
  setProvider: (provider: Provider) => void;
  phase: Phase;
  defaultModel?: string;
}

export default function ProviderSelector({
  provider,
  setProvider,
  phase,
  defaultModel = "claude-3-5-sonnet-20241022",
}: ProviderSelectorProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3">
        <Settings className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-300 font-medium">Provider:</span>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as Provider)}
          className="px-3 py-2 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-sm font-medium text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-600/50 transition-all duration-200"
          disabled={phase !== "init"}
        >
          {QUESTION_PROVIDERS.map((questionProvider) => (
            <option key={questionProvider.id} value={questionProvider.id}>
              {questionProvider.name}
            </option>
          ))}
        </select>
      </div>
      <div className="text-xs text-gray-400 bg-gray-900/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-700/50 font-mono">
        {getQuestionProviderById(provider)?.modelName || defaultModel}
      </div>
    </div>
  );
}
