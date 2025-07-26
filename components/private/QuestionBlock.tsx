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
    <div className="bg-black/40 backdrop-blur-md border border-gray-800/50 rounded-2xl p-8 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-blue-400" />
        <h4 className="text-2xl font-bold text-white">Choose an answer</h4>
      </div>

      <div className="space-y-4">
        {/* Pre-defined answer options */}
        {currentQuestionOptions.map((option, idx) => (
          <button
            key={idx}
            onClick={() => onAnswerSubmit(option)}
            className="w-full text-left p-4 bg-gray-900/50 backdrop-blur-sm hover:bg-gray-800/50 border border-gray-800/50 hover:border-gray-700/50 rounded-xl transition-all duration-300 disabled:opacity-50 group"
            disabled={isBotResponding}
          >
            <div className="flex items-start gap-4">
              <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="text-gray-200 group-hover:text-white font-medium leading-relaxed">
                {option}
              </span>
            </div>
          </button>
        ))}

        {/* Custom answer section */}
        <div className="pt-6 border-t border-gray-800/50">
          <div className="flex items-start gap-4 mb-4">
            <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              {String.fromCharCode(65 + currentQuestionOptions.length)}
            </span>
            <span className="text-gray-200 font-semibold">
              Or write your own answer:
            </span>
          </div>
          <div className="flex gap-3 ml-12">
            <input
              value={customAnswer}
              onChange={(e) => setCustomAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 hover:border-gray-700/50 transition-all duration-200"
              placeholder="Your answer..."
              disabled={isBotResponding}
            />
            <button
              onClick={handleCustomAnswerSubmit}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl"
              disabled={isBotResponding || !customAnswer.trim()}
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
