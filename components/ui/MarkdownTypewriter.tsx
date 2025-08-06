"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

interface MarkdownTypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

export default function MarkdownTypewriter({
  text,
  speed = 45,
  onComplete,
  className = "",
}: MarkdownTypewriterProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, text, speed, onComplete, isComplete]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  const textWithCursor = displayedText + (!isComplete ? "▍" : ""); // you can use "|" instead of "▍" if you prefer

  return (
    <div className={className}>
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ ...props }) => (
            <h1 className="text-xl font-bold mt-4 mb-2" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-lg font-bold mt-3 mb-2" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-md font-bold mt-3 mb-1" {...props} />
          ),
          h4: ({ ...props }) => (
            <h4 className="text-base font-bold mt-2 mb-1" {...props} />
          ),
          p: ({ ...props }) => <p className="mb-2" {...props} />,
          ul: ({ ...props }) => (
            <ul className="list-disc pl-6 mb-2" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="list-decimal pl-6 mb-2" {...props} />
          ),
          li: ({ ...props }) => <li className="mb-1" {...props} />,
          strong: ({ ...props }) => <strong className="font-bold" {...props} />,
          em: ({ ...props }) => <em className="italic" {...props} />,
          code: ({ ...props }) => (
            <code className="bg-gray-800 px-1 rounded" {...props} />
          ),
          pre: ({ ...props }) => (
            <pre
              className="bg-gray-800 p-2 rounded mb-3 overflow-x-auto"
              {...props}
            />
          ),
        }}
      >
        {textWithCursor}
      </ReactMarkdown>
    </div>
  );
}
