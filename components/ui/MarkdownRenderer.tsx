import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      components={{
        h1: ({ ...props }) => (
          <h1
            className="text-xl sm:text-2xl font-bold mt-6 mb-4 text-blue-300 border-b border-gray-700 pb-2"
            {...props}
          />
        ),
        h2: ({ ...props }) => (
          <h2
            className="text-lg sm:text-xl font-bold mt-5 mb-3 text-blue-300"
            {...props}
          />
        ),
        h3: ({ ...props }) => (
          <h3
            className="text-base sm:text-lg font-bold mt-4 mb-2 text-purple-300"
            {...props}
          />
        ),
        h4: ({ ...props }) => (
          <h4
            className="text-sm sm:text-base font-bold mt-3 mb-2 text-purple-300"
            {...props}
          />
        ),
        p: ({ ...props }) => (
          <p
            className="mb-3 leading-relaxed text-gray-100"
            {...props}
          />
        ),
        ul: ({ ...props }) => (
          <ul
            className="list-disc pl-6 mb-4 space-y-1"
            {...props}
          />
        ),
        ol: ({ ...props }) => (
          <ol
            className="list-decimal pl-6 mb-4 space-y-1"
            {...props}
          />
        ),
        li: ({ ...props }) => (
          <li
            className="mb-1 text-gray-100 leading-relaxed"
            {...props}
          />
        ),
        strong: ({ ...props }) => (
          <strong className="font-bold text-white" {...props} />
        ),
        em: ({ ...props }) => (
          <em className="italic text-gray-200" {...props} />
        ),
        code: ({ className, children, ...props }) => {
          const isInline = !className;
          return isInline ? (
            <code
              className="bg-gray-800/60 text-blue-300 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-700/50"
              {...props}
            >
              {children}
            </code>
          ) : (
            <code {...props}>{children}</code>
          );
        },
        pre: ({ children, ...props }) => (
          <pre
            className="bg-gray-900/80 border border-gray-700/50 p-4 rounded-lg mb-4 overflow-x-auto text-sm font-mono shadow-lg"
            {...props}
          >
            <div className="text-gray-300">{children}</div>
          </pre>
        ),
        blockquote: ({ ...props }) => (
          <blockquote
            className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-gray-800/30 rounded-r-lg italic text-gray-200"
            {...props}
          />
        ),
        a: ({ ...props }) => (
          <a
            className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
        table: ({ ...props }) => (
          <div className="overflow-x-auto mb-4">
            <table
              className="min-w-full border border-gray-700 rounded-lg"
              {...props}
            />
          </div>
        ),
        thead: ({ ...props }) => (
          <thead className="bg-gray-800/50" {...props} />
        ),
        tbody: ({ ...props }) => (
          <tbody className="bg-gray-900/30" {...props} />
        ),
        th: ({ ...props }) => (
          <th
            className="px-4 py-2 text-left font-bold text-gray-200 border-b border-gray-700"
            {...props}
          />
        ),
        td: ({ ...props }) => (
          <td
            className="px-4 py-2 text-gray-300 border-b border-gray-700/50"
            {...props}
          />
        ),
        hr: ({ ...props }) => (
          <hr className="my-6 border-gray-700" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}