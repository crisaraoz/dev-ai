import React from "react";

interface CodeBlockProps {
  children: string;
  language: string;
}

const CodeBlock = ({ children, language }: CodeBlockProps) => {
  return (
    <div className="rounded-md overflow-hidden bg-[#1e1e1e] text-white">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-[#444]">
        <span className="text-xs text-gray-400">{language}</span>
      </div>
      <pre className="p-4 m-0 overflow-auto font-mono text-sm leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  );
};

export default CodeBlock; 