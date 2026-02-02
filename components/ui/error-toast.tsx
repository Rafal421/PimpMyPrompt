import React, { useEffect } from "react";
import { AlertCircle, X } from "lucide-react";

interface ErrorToastProps {
  message: string;
  details?: string;
  onClose: () => void;
  isVisible: boolean;
}

export function ErrorToast({
  message,
  details,
  onClose,
  isVisible,
}: ErrorToastProps) {
  // Auto-hide after 5 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-md">
      <div className="bg-red-900/90 backdrop-blur-sm border border-red-700/50 rounded-lg p-4 shadow-lg animate-in slide-in-from-top-2 fade-in duration-300">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-red-100 mb-1">{message}</h4>
            {details && (
              <p className="text-xs text-red-300 break-words">{details}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-300 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
