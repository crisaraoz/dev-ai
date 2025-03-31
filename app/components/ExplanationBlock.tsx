import React from "react";

interface ExplanationBlockProps {
  children: string;
}

// Componente para explicaciones con estilo idéntico a ChatGPT
const ExplanationBlock = ({ children }: ExplanationBlockProps) => {
  // Separar el contenido en secciones basadas en bloques de código y texto
  const processContent = () => {
    const parts = children.split(/```(\w*)\n([\s\S]*?)```/).filter(Boolean);
    const result = [];
    
    for (let i = 0; i < parts.length; i++) {
      if (i % 3 === 0) {
        // Texto normal
        const paragraphs = parts[i].split('\n\n').filter(Boolean);
        paragraphs.forEach((paragraph, idx) => {
          // Si es una sección principal
          if (paragraph.startsWith('Puntos') || paragraph.startsWith('Principal')) {
            result.push(
              <div key={`text-${i}-${idx}`} className="mt-5 mb-2">
                <h3 className="text-[#1a73e8] dark:text-[#8ab4f8] font-medium flex items-center">
                  <span className="text-[#1a73e8] dark:text-[#8ab4f8] mr-2">♦</span> {paragraph}
                </h3>
              </div>
            );
          } 
          // Si es un punto con numeración o viñeta
          else if (/^(\d+\.|✅)/.test(paragraph)) {
            result.push(
              <div key={`list-${i}-${idx}`} className="ml-2 flex items-start gap-2 mb-2">
                <div className="bg-green-500 rounded-sm min-w-[16px] h-4 flex items-center justify-center mt-1">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  {paragraph.startsWith('✅') ? (
                    <span className="text-gray-700 dark:text-gray-300">{paragraph.substring(2)}</span>
                  ) : (
                    <>
                      <span className="font-medium">{paragraph.split(' ')[0]}</span>
                      <span className="text-gray-700 dark:text-gray-300">{' ' + paragraph.substring(paragraph.indexOf(' ') + 1)}</span>
                    </>
                  )}
                </div>
              </div>
            );
          }
          // Si es un título de sección (como "Ejemplo Comparativo")
          else if (paragraph.startsWith('Ejemplo')) {
            result.push(
              <div key={`title-${i}-${idx}`} className="mt-5 mb-2">
                <h3 className="text-[#1a73e8] dark:text-[#8ab4f8] font-medium flex items-center">
                  <span className="text-[#1a73e8] dark:text-[#8ab4f8] mr-2">♦</span> {paragraph}
                </h3>
              </div>
            );
          }
          // Si contiene "this" formateado
          else if (paragraph.includes('this')) {
            result.push(
              <p key={`this-${i}-${idx}`} className="text-gray-800 dark:text-gray-200 leading-relaxed mb-3">
                {paragraph.split('this').map((part, partIdx) => 
                  partIdx === 0 ? part : <React.Fragment key={partIdx}><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded font-mono">this</code>{part}</React.Fragment>
                )}
              </p>
            );
          }
          // Pregunta final
          else if (paragraph.includes('¿Quieres')) {
            result.push(
              <p key={`question-${i}-${idx}`} className="text-gray-800 dark:text-gray-200 leading-relaxed mt-4">
                {'🖋️ ' + paragraph + ' 📝'}
              </p>
            );
          }
          // Párrafo normal
          else {
            result.push(
              <p key={`para-${i}-${idx}`} className="text-gray-800 dark:text-gray-200 leading-relaxed mb-3">
                {paragraph}
              </p>
            );
          }
        });
      } else if (i % 3 === 1) {
        // Lenguaje del bloque de código
        // No hacer nada, se usa en el siguiente paso
      } else {
        // Contenido del bloque de código
        const language = parts[i-1] || 'js';
        const code = parts[i];
        result.push(
          <div key={`code-${i}`} className="my-4 rounded-md overflow-hidden bg-[#1e1e1e] text-white">
            <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-[#444]">
              <span className="text-xs text-gray-400">{language}</span>
              <div className="flex space-x-2">
                <button className="text-xs text-gray-400 hover:text-white">Copiar</button>
                <button className="text-xs text-gray-400 hover:text-white">Editar</button>
              </div>
            </div>
            <pre className="p-4 m-0 overflow-auto font-mono text-sm leading-relaxed">
              <code>
                {code.split('\n').map((line, lineIdx) => (
                  <div key={lineIdx} className="whitespace-pre">
                    {line.replace(/(\bfunction\b|\bconst\b|\breturn\b|\bconsole\.log\b)/g, '<span class="text-blue-400">$1</span>')
                         .replace(/(\bsumar\b)/g, '<span class="text-yellow-300">$1</span>')
                         .replace(/(\=\>|\+)/g, '<span class="text-pink-400">$1</span>')
                         .replace(/(\/\/ .+)$/g, '<span class="text-green-400">$1</span>')
                         .replace(/("[^"]*")/g, '<span class="text-orange-300">$1</span>')}
                  </div>
                ))}
              </code>
            </pre>
          </div>
        );
      }
    }
    
    return result;
  };
  
  return (
    <div className="text-base leading-relaxed space-y-1 bg-white dark:bg-[#444654] p-4 rounded-lg shadow-sm">
      {processContent()}
    </div>
  );
};

export default ExplanationBlock; 