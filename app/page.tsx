"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Code2, TestTube2, FileText, Sun, Moon, Download, Share2, History, Copy } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Componente mejorado para emular el estilo de código de ChatGPT
const CodeBlock = ({ children, language }: { children: string; language: string }) => {
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

// Componente para explicaciones con estilo idéntico a ChatGPT
const ExplanationBlock = ({ children }: { children: string }) => {
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

const PROGRAMMING_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
];

const TEST_FRAMEWORKS = {
  javascript: ["Jest", "Mocha", "Jasmine"],
  typescript: ["Jest", "Vitest", "AVA"],
  python: ["Pytest", "Unittest", "Nose"],
  java: ["JUnit", "TestNG", "Mockito"],
  csharp: ["NUnit", "xUnit", "MSTest"],
  cpp: ["Google Test", "Catch2", "Boost.Test"],
  go: ["Go Test", "Testify", "GoCheck"],
  rust: ["Built-in Tests", "Tokio Test", "Proptest"],
  php: ["PHPUnit", "Codeception", "Pest"],
  ruby: ["RSpec", "Minitest", "Test::Unit"],
};

const EXPLANATION_LEVELS = [
  {
    value: "junior",
    label: "Junior Developer",
    description: "Detailed explanations with basic concepts and examples"
  },
  {
    value: "mid",
    label: "Mid-Level Developer",
    description: "Balanced explanations focusing on implementation details and best practices"
  },
  {
    value: "senior",
    label: "Senior Developer",
    description: "Advanced concepts, architecture patterns, and performance considerations"
  }
];

// Función para renderizar los resultados de código de manera consistente
const renderCodeResult = (result: string, language: string) => {
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

export default function Home() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [testFramework, setTestFramework] = useState("Jest");
  const [testType, setTestType] = useState("unit");
  const [explanationLevel, setExplanationLevel] = useState("mid");
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("refactor");
  const { setTheme, theme } = useTheme();

  // Ejemplo de respuestas para mostrar en la UI
  const exampleTest = `Generated unit tests using Jest for javascript code:

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FormValidator from './FormValidator';

describe('FormValidator', () => {
  test('validates email format correctly', () => {
    render(<FormValidator />);
    const emailInput = screen.getByRole('textbox');
    
    // Invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.submit(screen.getByRole('form'));
    expect(screen.getByText('El formato del email no es válido')).toBeInTheDocument();
    
    // Valid email
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.submit(screen.getByRole('form'));
    expect(screen.queryByText('El formato del email no es válido')).not.toBeInTheDocument();
  });

  test('shows error when email field is empty', () => {
    render(<FormValidator />);
    
    // Submit with empty field
    fireEvent.submit(screen.getByRole('form'));
    expect(screen.getByText('El campo no puede estar vacío')).toBeInTheDocument();
  });
});`;

  // Asegurarse de que la UI se renderiza correctamente después de cargar
  useEffect(() => {
    setMounted(true);
  }, []);

  // No renderizar contenido hasta que el componente esté montado
  if (!mounted) {
    return null;
  }

  const handleProcess = () => {
    let message = "";
    
    if (activeTab === "test") {
      message = `Generated ${testType} tests using ${testFramework} for ${language} code:\n\n`;
      
      // Example test response for FormValidator
      if (language === "javascript" || language === "typescript") {
        message += `import { render, screen, fireEvent } from '@testing-library/react';\nimport '@testing-library/jest-dom';\nimport FormValidator from './FormValidator';\n\ndescribe('FormValidator', () => {\n  test('validates email format correctly', () => {\n    render(<FormValidator />);\n    const emailInput = screen.getByRole('textbox');\n    \n    // Invalid email\n    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });\n    fireEvent.submit(screen.getByRole('form'));\n    expect(screen.getByText('El formato del email no es válido')).toBeInTheDocument();\n    \n    // Valid email\n    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });\n    fireEvent.submit(screen.getByRole('form'));\n    expect(screen.queryByText('El formato del email no es válido')).not.toBeInTheDocument();\n  });\n\n  test('shows error when email field is empty', () => {\n    render(<FormValidator />);\n    \n    // Submit with empty field\n    fireEvent.submit(screen.getByRole('form'));\n    expect(screen.getByText('El campo no puede estar vacío')).toBeInTheDocument();\n  });\n});`;
      }
    } else if (activeTab === "explain") {
      message = `Explaining code at ${explanationLevel} level for ${language}:\n\n`;
      
      // Example explanation response for FormValidator
      message += `Este componente FormValidator implementa un validador de formularios en React utilizando hooks.

Puntos clave:

✅ useState: Administra el estado del email y los mensajes de error
✅ validateEmail: Utiliza una expresión regular para verificar el formato del email
✅ handleSubmit: Maneja el envío del formulario, previniendo el comportamiento predeterminado
✅ Validación: Comprueba si el campo está vacío o si el email tiene un formato incorrecto

Ejemplo Comparativo

\`\`\`js
// Función tradicional de validación
function validateEmail(email) {
  const regex = /^[\\w-]+(\\.[\\w-]+)*@([\\w-]+\\.)+[a-zA-Z]{2,7}$/;
  return regex.test(email);
}

// Función flecha equivalente
const validateEmail = (email) => {
  const regex = /^[\\w-]+(\\.[\\w-]+)*@([\\w-]+\\.)+[a-zA-Z]{2,7}$/;
  return regex.test(email);
};
\`\`\`

El componente muestra mensajes de error apropiados y proporciona feedback visual al usuario durante la validación del formulario.`;
    } else {
      message = `Processed ${language} code:\n\n`;
      
      // Example refactored code for FormValidator
      if (language === "javascript" || language === "typescript") {
        message += `import { useState } from "react";\nimport styles from "../styles/FormValidator.module.scss";\n\nconst FormValidator = () => {\n  const [email, setEmail] = useState("");\n  const [error, setError] = useState("");\n  const [success, setSuccess] = useState(false);\n\n  const validateEmail = (email) => {\n    const emailRegex = /^[\\w-]+(\\.[\\w-]+)*@([\\w-]+\\.)+[a-zA-Z]{2,7}$/;\n    return emailRegex.test(email);\n  };\n\n  const handleSubmit = (e) => {\n    e.preventDefault();\n    setError("");\n    setSuccess(false);\n    \n    if (!email) {\n      setError("El campo no puede estar vacío.");\n      return;\n    }\n    \n    if (!validateEmail(email)) {\n      setError("El formato del email no es válido.");\n      return;\n    }\n    \n    // Si pasa todas las validaciones\n    setSuccess(true);\n    console.log("Email válido:", email);\n  };\n\n  return (\n    <div className={styles.formContainer}>\n      <form onSubmit={handleSubmit} role="form">\n        <div className={styles.inputGroup}>\n          <label htmlFor="email">Email:</label>\n          <input\
            type="text"\
            id="email"\
            value={email}\
            onChange={(e) => setEmail(e.target.value)}\
            className={error ? styles.inputError : ""}\
          />\
          {error && <p className={styles.errorMessage}>{error}</p>}\
          {success && <p className={styles.successMessage}>¡Email validado correctamente!</p>}\
        </div>\
        <button type="submit" className={styles.submitButton}>Validar</button>\
      </form>\
    </div>\
  );\
};\n\nexport default FormValidator;`;
      }
    }
    
    console.log("Procesando:", activeTab, message.substring(0, 50));
    setResult(message);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "result.txt";
    a.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Code2 className="h-6 w-6" />
            AI Dev Tools
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAMMING_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Paste your code here..."
              className="min-h-[400px] font-mono"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <div className="flex justify-end">
              <Button onClick={handleProcess}>Process</Button>
            </div>
          </div>

          <div className="space-y-4">
            <Tabs defaultValue="refactor" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="refactor">Refactor</TabsTrigger>
                <TabsTrigger value="test">Generate Tests</TabsTrigger>
                <TabsTrigger value="explain">Explain</TabsTrigger>
              </TabsList>

              <TabsContent value="refactor">
                <Card className="p-4">
                  <ScrollArea className="h-[400px]">
                    {result ? renderCodeResult(result, language === "typescript" ? "typescript" : language)
                      : <div className="text-muted-foreground">{"// Result will appear here..."}</div>
                    }
                  </ScrollArea>
                </Card>
              </TabsContent>

              <TabsContent value="test">
                <Card className="p-4">
                  <div className="space-y-4 mb-4">
                    <div>
                      <Label>Test Framework</Label>
                      <Select value={testFramework} onValueChange={setTestFramework}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select Framework" />
                        </SelectTrigger>
                        <SelectContent>
                          {TEST_FRAMEWORKS[language as keyof typeof TEST_FRAMEWORKS].map((framework) => (
                            <SelectItem key={framework} value={framework}>
                              {framework}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Test Type</Label>
                      <RadioGroup value={testType} onValueChange={setTestType} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="unit" id="unit" />
                          <Label htmlFor="unit">Unit Tests</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="integration" id="integration" />
                          <Label htmlFor="integration">Integration Tests</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="e2e" id="e2e" />
                          <Label htmlFor="e2e">E2E Tests</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                  <ScrollArea className="h-[300px]">
                    {result ? renderCodeResult(result, language === "typescript" ? "typescript" : language)
                      : <div className="text-muted-foreground">{"// Los tests aparecerán aquí después de procesar el código..."}</div>
                    }
                  </ScrollArea>
                </Card>
              </TabsContent>

              <TabsContent value="explain">
                <Card className="p-4">
                  <div className="space-y-4 mb-4">
                    <div>
                      <Label>Experience Level</Label>
                      <RadioGroup value={explanationLevel} onValueChange={setExplanationLevel} className="space-y-2 mt-2">
                        {EXPLANATION_LEVELS.map((level) => (
                          <div key={level.value} className="flex items-start space-x-2">
                            <RadioGroupItem value={level.value} id={level.value} className="mt-1" />
                            <div>
                              <Label htmlFor={level.value} className="font-medium">{level.label}</Label>
                              <p className="text-sm text-muted-foreground">{level.description}</p>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                  <ScrollArea className="h-[300px]">
                    {result ? (
                      <div className="chatgpt-message">
                        <ExplanationBlock>
                          {result.split('\n\n').slice(1).join('\n\n')}
                        </ExplanationBlock>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">{"// La explicación aparecerá aquí después de procesar el código..."}</div>
                    )}
                  </ScrollArea>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="icon" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <History className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}