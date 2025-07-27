"use client";

import { RESPONSE_PROVIDERS } from "@/lib/ai-config";
import type { Provider } from "@/lib/types";
import ProviderTile from "./ProviderTile";

interface ModelSelectionProps {
  onModelSelect: (provider: Provider, model: string) => void;
  isBotResponding: boolean;
}

export default function ModelSelection({
  onModelSelect,
  isBotResponding,
}: ModelSelectionProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-4xl font-bold text-white mb-4">
          What do AI models contain?
        </h3>
        <p className="text-xl text-gray-400">
          Everything you need to generate perfect responses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
        {RESPONSE_PROVIDERS.map((providerConfig) => (
          <ProviderTile
            key={providerConfig.id}
            providerConfig={providerConfig}
            onSelect={onModelSelect}
            disabled={isBotResponding}
          />
        ))}
      </div>
    </div>
  );
}
