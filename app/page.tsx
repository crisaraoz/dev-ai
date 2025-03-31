"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Code2 } from "lucide-react";

// Importación de componentes
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import MessageHistory from "./components/MessageHistory";
import InputArea from "./components/InputArea";
import ResultsArea from "./components/ResultsArea";
import LanguageSelector from "./components/LanguageSelector";

export default function Home() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [testFramework, setTestFramework] = useState("Jest");
  const [testType, setTestType] = useState("unit");
  const [explanationLevel, setExplanationLevel] = useState("mid");
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("refactor");
  const [messages, setMessages] = useState<{type: 'user' | 'ai', content: string, response?: string, tab?: string}[]>([]);
  const { setTheme, theme } = useTheme();
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<{id: string, title: string, messages: any[], date: string}[]>([
    { 
      id: "1", 
      title: "Funciones flecha en JavaScript", 
      messages: [], 
      date: "Hoy" 
    },
    { 
      id: "2", 
      title: "Validación de formularios", 
      messages: [], 
      date: "Ayer" 
    },
    { 
      id: "3", 
      title: "Async/Await en React", 
      messages: [], 
      date: "7 días anteriores" 
    }
  ]);
  const [activeConversation, setActiveConversation] = useState<string | null>("1");

  // Asegurarse de que la UI se renderiza correctamente después de cargar
  useEffect(() => {
    setMounted(true);
  }, []);

  // Efecto para actualizar el panel derecho cuando cambia el mensaje seleccionado
  useEffect(() => {
    if (selectedMessage !== null && messages[selectedMessage]) {
      setResult(messages[selectedMessage].response || '');
      if (messages[selectedMessage].tab) {
        setActiveTab(messages[selectedMessage].tab as string);
      }
    }
  }, [selectedMessage, messages]);

  // No renderizar contenido hasta que el componente esté montado
  if (!mounted) {
    return null;
  }

  const handleProcess = () => {
    if (!code.trim()) return;
    
    let message = "";
    
    if (activeTab === "test") {
      message = `Generated ${testType} tests using ${testFramework} for ${language} code:\n\n`;
      
      // Example test response for FormValidator
      if (language === "javascript" || language === "typescript") {
        message += `import { render, screen, fireEvent } from '@testing-library/react';\nimport '@testing-library/jest-dom';\nimport FormValidator from './FormValidator';\n\ndescribe('FormValidator', () => {\n  test('validates email format correctly', () => {\n    render(<FormValidator />);\n    const emailInput = screen.getByRole('textbox');\n    \n    // Invalid email\n    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });\n    fireEvent.submit(screen.getByRole('form'));\n    expect(screen.getByText('El formato del email no es válido')).toBeInTheDocument();\n    \n    // Valid email\n    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });\n    fireEvent.submit(screen.getByRole('form'));\n    expect(screen.queryByText('El formato del email no es válido')).not.toBeInTheDocument();\n  });\n\n  test('shows error when email field is empty', () => {\n    render(<FormValidator />);\n    \n    // Submit with empty field\n    fireEvent.submit(screen.getByRole('form'));\n    expect(screen.getByText('El campo no puede estar vacío')).toBeInTheDocument();\n  });\n});`;
      }
    } else if (activeTab === "explain") {
      // Aseguramos un formato consistente para la explicación
      const explanation = `Este componente FormValidator implementa un validador de formularios en React utilizando hooks.

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

      // Usamos formato estándar para las explicaciones (encabezado + contenido)
      message = `Explaining code at ${explanationLevel} level for ${language}:\n\n${explanation}`;
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
    
    const newMessage = {
      type: 'user' as const,
      content: code,
      response: message,
      tab: activeTab
    };
    
    // Añadir el mensaje del usuario y la respuesta al historial
    setMessages(prev => [...prev, newMessage]);
    
    // Limpiar el campo de código para el siguiente mensaje
    setCode("");
    setSelectedMessage(null);
    
    // Establecer el resultado para mostrarlo
    setResult(message);
    
    // Scrollear hacia abajo al añadir un nuevo mensaje (mediante setTimeout para asegurar que el DOM se ha actualizado)
    setTimeout(() => {
      const chatContainer = document.querySelector('.messages-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  };

  const handleContinueConversation = (idx: number) => {
    setSelectedMessage(idx);
    setCode(messages[idx].content);
    if (messages[idx].tab) {
      setActiveTab(messages[idx].tab as string);
    }
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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const startNewConversation = () => {
    const newId = Date.now().toString();
    const newConversation = {
      id: newId,
      title: "Nueva conversación",
      messages: [],
      date: "Hoy"
    };
    
    setConversations([newConversation, ...conversations]);
    setActiveConversation(newId);
    setMessages([]);
    setCode("");
    setResult("");
  };

  const selectConversation = (id: string) => {
    setActiveConversation(id);
    // Aquí cargaríamos los mensajes de la conversación seleccionada
    // Por ahora, solo simulamos este comportamiento
    setMessages([]);
    setResult("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar Component */}
      <Sidebar 
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        conversations={conversations}
        activeConversation={activeConversation}
        startNewConversation={startNewConversation}
        selectConversation={selectConversation}
      />

      {/* Contenido principal con margen cuando el sidebar está abierto */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        {/* Header Component */}
        <Header theme={theme} setTheme={setTheme} />

        <main className="container mx-auto px-4 py-8">
          <div className={`grid ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-6 relative`}>
            <div className={`space-y-4 ${isFullscreen ? 'hidden' : ''}`}>
              {/* Language Selector Component */}
              <LanguageSelector 
                language={language}
                setLanguage={setLanguage}
                explanationLevel={explanationLevel}
                setExplanationLevel={setExplanationLevel}
              />
              
              {/* Message History Component */}
              <MessageHistory 
                messages={messages}
                language={language}
                handleContinueConversation={handleContinueConversation}
              />
              
              {/* Input Area Component */}
              <InputArea 
                code={code}
                setCode={setCode}
                handleProcess={handleProcess}
                selectedMessage={selectedMessage}
              />
            </div>

            {/* Results Area Component */}
            <div className={`${isFullscreen ? 'w-full' : ''}`}>
              <ResultsArea 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                result={result}
                language={language}
                testFramework={testFramework}
                setTestFramework={setTestFramework}
                testType={testType}
                setTestType={setTestType}
                isFullscreen={isFullscreen}
                toggleFullscreen={toggleFullscreen}
                handleCopy={handleCopy}
                handleDownload={handleDownload}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 