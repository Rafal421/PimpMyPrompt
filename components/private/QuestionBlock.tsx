"use client";
import { Send, Sparkles } from "lucide-react";

interface QuestionBlockProps {
  currentQuestionOptions: string[];
  customAnswer: string;
  setCustomAnswer: (value: string) => void;
  onAnswerSubmit: (answer: string) => void;
  isBotResponding: boolean;
}

export default function QuestionBlock({
  currentQuestionOptions,
  customAnswer,
  setCustomAnswer,
  onAnswerSubmit,
  isBotResponding,
}: QuestionBlockProps) {
  const handleCustomAnswerSubmit = () => {
    if (customAnswer.trim()) {
      onAnswerSubmit(customAnswer);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && customAnswer.trim()) {
      handleCustomAnswerSubmit();
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-md border border-gray-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
        <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Choose an answer</h4>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {/* Pre-defined answer options */}
        {currentQuestionOptions.map((option, idx) => (
          <button
            key={idx}
            onClick={() => onAnswerSubmit(option)}
            className="w-full text-left p-3 sm:p-4 bg-gray-900/50 backdrop-blur-sm hover:bg-gray-800/50 border border-gray-800/50 hover:border-gray-700/50 rounded-lg sm:rounded-xl transition-all duration-300 disabled:opacity-50 group touch-target"
            disabled={isBotResponding}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="text-gray-200 group-hover:text-white font-medium leading-relaxed text-sm sm:text-base">
                {option}
              </span>
            </div>
          </button>
        ))}

        {/* Custom answer section */}
        <div className="pt-4 sm:pt-6 border-t border-gray-800/50">
          <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
            <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
              {String.fromCharCode(65 + currentQuestionOptions.length)}
            </span>
            <span className="text-gray-200 font-semibold text-sm sm:text-base">
              Or write your own answer:
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 ml-0 sm:ml-12">
            <input
              value={customAnswer}
              onChange={(e) => setCustomAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3 py-3 sm:px-4 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 hover:border-gray-700/50 transition-all duration-200 text-base"
              placeholder="Your answer..."
              disabled={isBotResponding}
            />
            <button
              onClick={handleCustomAnswerSubmit}
              className="px-4 py-3 sm:px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg sm:rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl touch-target text-sm sm:text-base"
              disabled={isBotResponding || !customAnswer.trim()}
            >
              <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
