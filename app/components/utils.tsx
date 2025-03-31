import React from "react";

// Función para renderizar los resultados de código de manera consistente
export const renderCodeResult = (result: string, language: string) => {
  if (!result) return <div className="text-muted-foreground">{"// Result will appear here..."}</div>;
  
  const parts = result.split('\n\n');
  if (parts.length >= 2) {
    return (
      <>
        <p className="text-sm text-muted-foreground mb-3">{parts[0]}</p>
        <div className="rounded-md overflow-hidden bg-[#1e1e1e] text-white">
          <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-[#444]">
            <span className="text-xs text-gray-400">{language}</span>
          </div>
          <pre className="p-4 m-0 overflow-auto font-mono text-sm leading-relaxed">
            <code>{parts[1]}</code>
          </pre>
        </div>
      </>
    );
  }
  
  return <pre className="font-mono whitespace-pre-wrap">{result}</pre>;
}; 