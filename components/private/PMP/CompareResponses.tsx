import React, { useState } from "react";
import type { CompareResponse } from "@/lib/types";

interface CompareResponsesProps {
  responses: CompareResponse[];
}

export function CompareResponses({ responses }: CompareResponsesProps) {
  const [expandedResponses, setExpandedResponses] = useState<Set<string>>(
    new Set()
  );

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
    <div className="w-full space-y-3">
      <div className="text-sm text-gray-600 mb-4">
        Comparing responses from {responses.length} AI models:
      </div>

      {responses.map((response) => {
        const isExpanded = expandedResponses.has(response.modelId);
        const preview =
          response.response.slice(0, 100) +
          (response.response.length > 100 ? "..." : "");

        return (
          <div
            key={response.modelId}
            className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleExpanded(response.modelId)}
          >
            {/* Model Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900">{response.model}</h4>
                {!response.success && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                    Error
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {isExpanded ? "Click to collapse" : "Click to expand"}
              </div>
            </div>

            {/* Response Content */}
            <div className="text-sm text-gray-700">
              {isExpanded ? (
                <div className="whitespace-pre-wrap">{response.response}</div>
              ) : (
                <div className="text-gray-500">{preview}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
