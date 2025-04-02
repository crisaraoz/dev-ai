"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Code2 } from "lucide-react";

// Importación de componentes
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import MessageHistory from "./components/MessageHistory";
import InputArea from "./components/InputArea";
import ResultsArea from "./components/ResultsArea";
import LanguageSelector from "./components/LanguageSelector";
import Footer from "./components/Footer";
import YouTubePlayer from "./components/YouTubePlayer";
import YoutubeResume from "../components/YoutubeResume";

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
  const [isLoading, setIsLoading] = useState(false);
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
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);
  const [videoSeekTime, setVideoSeekTime] = useState<number | undefined>(undefined);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [previousScrollPosition, setPreviousScrollPosition] = useState<number>(0);
  const [userScrolling, setUserScrolling] = useState<boolean>(false);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showYoutubeResume, setShowYoutubeResume] = useState(false);

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

  // Efecto para detectar cuando el usuario está haciendo scroll manualmente
  useEffect(() => {
    const handleScroll = () => {
      setUserScrolling(true);
      
      // Limpiar cualquier temporizador existente
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
      
      // Después de 2 segundos sin scroll, considerar que el usuario terminó de scrollear
      scrollTimerRef.current = setTimeout(() => {
        setUserScrolling(false);
      }, 2000);
    };
    
    // Agregar listener al contenedor de transcripción
    const scrollContainer = document.querySelector('.transcript-scroll-area');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      // Limpiar event listeners y temporizadores
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
      
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, [result]); // Recrear este efecto cuando cambia el resultado (nueva transcripción)

  // Segundo efecto para asegurarse de que la línea activa se mantenga resaltada
  useEffect(() => {
    // Solo ejecutar cuando hay resultado y tiempo de video
    if (!result || currentVideoTime <= 0) return;
    
    // Crear una función para actualizar el resaltado
    const updateHighlight = () => {
      // Convertir segundos a formato MM:SS
      const minutes = Math.floor(currentVideoTime / 60);
      const seconds = Math.floor(currentVideoTime % 60);
      const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      const lines = result.split('\n');
      let closestLineIndex = -1;
      let closestTimeDiff = Infinity;
      
      // Buscar la línea apropiada
      lines.forEach((line, index) => {
        if (line.match(/^\d{2}:\d{2}/)) {
          const lineTime = line.substring(0, 5);
          const [lineMin, lineSec] = lineTime.split(':').map(Number);
          const lineTimeInSeconds = lineMin * 60 + lineSec;
          
          if (lineTimeInSeconds <= currentVideoTime && (currentVideoTime - lineTimeInSeconds) < closestTimeDiff) {
            closestTimeDiff = currentVideoTime - lineTimeInSeconds;
            closestLineIndex = index;
          }
        }
      });
      
      // Aplicar el estilo directamente a la línea activa usando JavaScript (más fiable)
      const applyActiveStyle = (lineElement: HTMLElement) => {
        // Detectar si estamos en modo oscuro
        const isDarkMode = document.documentElement.classList.contains('dark');
        
        if (isDarkMode) {
          // Colores para modo oscuro
          lineElement.style.backgroundColor = '#ff6600'; // Naranjo más intenso
          lineElement.style.borderLeft = '6px solid #ff3333'; // Rojo brillante
          lineElement.style.color = 'black';
          lineElement.style.outline = '2px solid #ff3333';
        } else {
          // Colores para modo claro
          lineElement.style.backgroundColor = 'rgba(255, 165, 0, 0.9)';
          lineElement.style.borderLeft = '6px solid crimson';
          lineElement.style.color = 'black';
          lineElement.style.outline = '2px solid crimson';
        }
        
        // Estilos comunes para ambos temas
        lineElement.style.fontWeight = '700';
        lineElement.style.paddingLeft = '0.75rem';
        lineElement.style.position = 'relative';
        lineElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        lineElement.style.borderRadius = '4px';
        lineElement.style.transform = 'scale(1.02)';
        lineElement.style.zIndex = '10';
        lineElement.style.margin = '4px 0';
        
        // Agregar un marcador visual aún más obvio
        const marker = document.createElement('div');
        marker.style.position = 'absolute';
        marker.style.left = '-20px';
        marker.style.top = '50%';
        marker.style.transform = 'translateY(-50%)';
        marker.style.width = '10px';
        marker.style.height = '10px';
        marker.style.borderRadius = '50%';
        marker.style.backgroundColor = isDarkMode ? '#ff3333' : 'crimson';
        marker.style.animation = 'pulse 1s infinite';
        
        // Asegurarse de que no se duplique el marcador
        const existingMarker = lineElement.querySelector('.line-marker');
        if (existingMarker) {
          lineElement.removeChild(existingMarker);
        }
        
        marker.className = 'line-marker';
        lineElement.appendChild(marker);
        
        // Agregar una animación de pulso si no existe
        if (!document.getElementById('pulse-animation')) {
          const style = document.createElement('style');
          style.id = 'pulse-animation';
          style.textContent = `
            @keyframes pulse {
              0% { opacity: 0.6; transform: translateY(-50%) scale(1); }
              50% { opacity: 1; transform: translateY(-50%) scale(1.3); }
              100% { opacity: 0.6; transform: translateY(-50%) scale(1); }
            }
          `;
          document.head.appendChild(style);
        }
      };
      
      // Quitar los estilos aplicados directamente
      const removeActiveStyle = (element: HTMLElement) => {
        element.style.backgroundColor = '';
        element.style.borderLeft = '';
        element.style.fontWeight = '';
        element.style.paddingLeft = '';
        element.style.color = '';
        element.style.position = '';
        element.style.boxShadow = '';
        element.style.borderRadius = '';
        element.style.transform = '';
        element.style.zIndex = '';
        element.style.margin = '';
        element.style.outline = '';
      };
      
      // Limpiar todos los estilos primero
      document.querySelectorAll('[id^="transcript-line-"]').forEach(el => {
        el.classList.remove('transcript-line-active');
        removeActiveStyle(el as HTMLElement);
      });
      
      // Aplicar el resaltado a la línea correcta
      if (closestLineIndex >= 0) {
        const lineElement = document.getElementById(`transcript-line-${closestLineIndex}`);
        if (lineElement) {
          console.log(`Resaltando línea: ${closestLineIndex} para tiempo ${timeString}`);
          
          // Aplicar clase y también estilos directos
          lineElement.classList.add('transcript-line-active');
          applyActiveStyle(lineElement);
          
          // Solo hacer scroll si el auto-scroll está activado Y el usuario no está scrolleando
          if (autoScroll && !userScrolling) {
            const scrollContainer = document.querySelector('.transcript-scroll-area');
            if (scrollContainer) {
              const containerRect = scrollContainer.getBoundingClientRect();
              const elementRect = lineElement.getBoundingClientRect();
              
              // Verificar si el elemento está fuera de la vista
              const isVisible = 
                elementRect.top >= containerRect.top && 
                elementRect.bottom <= containerRect.bottom;
              
              if (!isVisible) {
                lineElement.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                  inline: 'nearest'
                });
              }
            }
          }
        }
      }
    };
    
    // Ejecutar inmediatamente
    updateHighlight();
    
    // Y también configurar un intervalo para actualizar cada 200ms (más frecuente)
    const intervalId = setInterval(updateHighlight, 200);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [result, currentVideoTime, autoScroll, userScrolling]);

  // Observador para detectar cambios en el DOM y asegurar que el resaltado se mantenga
  useEffect(() => {
    // Solo ejecutar cuando hay resultado
    if (!result) return;
    
    // Configurar un observador del DOM para asegurarse de que el resaltado se mantenga
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
          // Verificar si el resaltado sigue aplicado
          const activeElement = document.querySelector('.transcript-line-active');
          if (!activeElement && currentVideoTime > 0) {
            // Si no hay línea resaltada, forzar una actualización
            const minutes = Math.floor(currentVideoTime / 60);
            const seconds = Math.floor(currentVideoTime % 60);
            console.log(`Forzando actualización de resaltado para tiempo ${minutes}:${seconds}`);
            
            // Usar un pequeño retardo para asegurarse de que todo está renderizado
            setTimeout(() => {
              const event = new CustomEvent('forceHighlightUpdate', { detail: { time: currentVideoTime } });
              window.dispatchEvent(event);
            }, 50);
          }
        }
      });
    });
    
    // Observar cambios en el contenedor de transcripción
    const transcriptContainer = document.querySelector('.transcript-scroll-area');
    if (transcriptContainer) {
      observer.observe(transcriptContainer, { 
        childList: true, 
        subtree: true, 
        attributes: true 
      });
    }
    
    // Crear un listener para el evento forzado
    const forceUpdateHandler = (e: Event) => {
      if (e instanceof CustomEvent) {
        const time = e.detail?.time;
        if (typeof time === 'number') {
          // Ejecutar la actualización del resaltado
          console.log(`Ejecutando actualización forzada para tiempo ${time}`);
          // El manejador específico estará en el otro efecto
        }
      }
    };
    
    window.addEventListener('forceHighlightUpdate', forceUpdateHandler);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('forceHighlightUpdate', forceUpdateHandler);
    };
  }, [result, currentVideoTime]);

  // Verificar si una línea es visible
  const isElementInViewport = (el: Element, container: Element) => {
    const rect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    return (
      rect.top >= containerRect.top &&
      rect.bottom <= containerRect.bottom
    );
  };

  // No renderizar contenido hasta que el componente esté montado
  if (!mounted) {
    return null;
  }

  const handleProcess = () => {
    setIsLoading(true);
    
    // Simulamos el tiempo de respuesta de una API
    setTimeout(() => {
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
      } else if (activeTab === "transcript") {
        message = `Transcript of the code:\n\n${code}\n\nAnalysis and comments:\n- The code appears to be written in ${language}\n- It follows standard coding conventions\n- The structure is clear and well-organized`;
      } else {
        // Refactor case
        message = `// Refactored version of your ${language} code:\n\n${code}\n\n// Additional improvements could include:\n// - Better variable naming\n// - Code organization\n// - Performance optimizations`;
      }

      const newMessage = {
        type: 'user' as const,
        content: code,
        response: message,
        tab: activeTab
      };
      setMessages(prev => [...prev, newMessage]);
      setCode("");
      setSelectedMessage(null);
      setResult(message);
      setIsLoading(false);
      setTimeout(() => {
        const chatContainer = document.querySelector('.messages-container');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
    }, 1500); // Simulamos un tiempo de respuesta de 1.5 segundos
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
    // Si es una transcripción, usar siempre .txt
    if (activeTab === "transcript") {
      const blob = new Blob([result], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const fileName = videoUrl ? 
        `transcription_${new Date().toISOString().slice(0, 10)}` : 
        "transcription";
      a.download = `${fileName}.txt`;
      a.click();
      return;
    }

    // Para otros tipos de contenido, seguir con la lógica existente
    // Determinar la extensión del archivo según el lenguaje seleccionado
    let fileExtension = ".txt";
    switch (language) {
      case "javascript":
        fileExtension = ".js";
        break;
      case "typescript":
        fileExtension = ".ts";
        break;
      case "python":
        fileExtension = ".py";
        break;
      case "java":
        fileExtension = ".java";
        break;
      case "csharp":
        fileExtension = ".cs";
        break;
      case "cpp":
        fileExtension = ".cpp";
        break;
      case "go":
        fileExtension = ".go";
        break;
      case "rust":
        fileExtension = ".rs";
        break;
      case "php":
        fileExtension = ".php";
        break;
      case "ruby":
        fileExtension = ".rb";
        break;
      default:
        fileExtension = ".txt";
    }

    // Extraer solo el código si el resultado tiene formato específico
    let codeToDownload = result;
    if (result.includes('\n\n')) {
      codeToDownload = result.split('\n\n')[1]; // Obtener solo la parte del código
    }

    const blob = new Blob([codeToDownload], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code${fileExtension}`;
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
      title: "New conversation",
      messages: [],
      date: "Today"
    };
    
    setConversations([newConversation, ...conversations]);
    setActiveConversation(newId);
    
    // Limpiar todos los estados primero
    setMessages([]);
    setCode("");
    
    // Importante: Limpiar primero el URL del video para que los componentes se desmonte correctamente
    setVideoUrl(null);
    
    // Esperar un pequeño tiempo para asegurarse que los efectos relacionados al video se completen
    setTimeout(() => {
      setResult("");
      setSelectedMessage(null);
      setLanguage("javascript"); // Valor predeterminado
      setExplanationLevel("mid"); // Valor predeterminado
      setActiveTab("refactor"); // Restablecer la pestaña activa
      setCurrentVideoTime(0); // Reiniciar el tiempo del video
      setVideoSeekTime(undefined); // Reiniciar el tiempo de búsqueda
      setIsLoading(false); // Asegurarse de que no se muestre el indicador de carga
    }, 50);
  };

  const selectConversation = (id: string) => {
    setActiveConversation(id);
    
    // Limpiar todos los estados primero
    setMessages([]);
    setCode("");
    
    // Importante: Limpiar primero el URL del video para que los componentes se desmonte correctamente
    setVideoUrl(null);
    
    // Esperar un pequeño tiempo para asegurarse que los efectos relacionados al video se completen
    setTimeout(() => {
      setResult("");
      setSelectedMessage(null);
      setActiveTab("refactor");
      setCurrentVideoTime(0);
      setVideoSeekTime(undefined);
      setIsLoading(false);
    }, 50);
  };

  const deleteConversation = (id: string) => {
    setConversations(prevConversations => prevConversations.filter(conv => conv.id !== id));
    
    // Si la conversación eliminada es la activa, seleccionar otra o crear una nueva
    if (activeConversation === id) {
      const remainingConversations = conversations.filter(conv => conv.id !== id);
      if (remainingConversations.length > 0) {
        selectConversation(remainingConversations[0].id);
      } else {
        startNewConversation();
      }
    }
  };

  const handleYouTubeUrl = async (url: string) => {
    setVideoUrl(url);
    setActiveTab("transcript");
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/transcription/youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          video_url: url,
          // No especificamos language_code para que el backend use su lógica de fallback
          use_generated: true   // Permitir transcripciones auto-generadas
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al obtener la transcripción');
      }

      const data = await response.json();
      setResult(data.transcription);
    } catch (error: any) {
      console.error('Error:', error);
      setResult(`Error al procesar el video: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }

    // Si es una URL de YouTube válida, también ofrecemos la opción de resumir
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      setShowYoutubeResume(true);
    } else {
      setShowYoutubeResume(false);
    }
  };

  const handleVideoTimeUpdate = (time: number) => {
    if (time !== currentVideoTime) {
      setCurrentVideoTime(time);
    }
  };

  // Función para manejar los clics en los timestamps de la transcripción
  const handleTranscriptTimeClick = (timeString: string) => {
    if (timeString.match(/^\d{2}:\d{2}/)) {
      const [minutes, seconds] = timeString.split(':').map(Number);
      const timeInSeconds = minutes * 60 + seconds;
      console.log(`Clicking timestamp ${timeString}, seeking to ${timeInSeconds} seconds`);
      
      // Reset para forzar actualización incluso si el valor es el mismo
      setVideoSeekTime(undefined);
      
      // Pequeño retardo para asegurar que el reset surta efecto
      setTimeout(() => {
        setVideoSeekTime(timeInSeconds);
      }, 50);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sidebar Component */}
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
        conversations={conversations} 
        activeConversation={activeConversation} 
        startNewConversation={startNewConversation}
        selectConversation={selectConversation}
        deleteConversation={deleteConversation}
      />

      <div className={`transition-all duration-300 flex flex-col flex-grow ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        {/* Header Component */}
        <Header theme={theme} setTheme={setTheme} />

        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className={`grid ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-6 relative`}>
            <div className={`space-y-4 ${isFullscreen ? 'hidden' : ''}`}>
              {/* Language Selector Component */}
              <LanguageSelector 
                language={language} 
                setLanguage={setLanguage}
                explanationLevel={explanationLevel}
                setExplanationLevel={setExplanationLevel}
                isDisabled={activeTab === "transcript" || !!videoUrl}
              />
              
              {/* YouTube Player / Welcome Screen */}
              <div className="bg-card rounded-lg overflow-hidden border">
                <YouTubePlayer 
                  videoUrl={videoUrl} 
                  onTimeUpdate={handleVideoTimeUpdate}
                  seekTo={videoSeekTime}
                  isProcessing={isLoading}
                />
              </div>
              
              {/* Input Area Component */}
              <InputArea 
                code={code}
                setCode={setCode}
                handleProcess={handleProcess}
                selectedMessage={selectedMessage}
                isLoading={isLoading}
                onYouTubeUrl={handleYouTubeUrl}
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
                isLoading={isLoading}
                isYouTubeMode={!!videoUrl}
                onTimeClick={handleTranscriptTimeClick}
                autoScroll={autoScroll}
                setAutoScroll={setAutoScroll}
              />
              
              {/* Nuevo componente para resumir videos de YouTube */}
              {showYoutubeResume && videoUrl && (
                <div className="mt-4">
                  <YoutubeResume initialTranscription={result} />
                </div>
              )}
            </div>
          </div>
        </main>
        
        {/* Footer Component */}
        <Footer />
      </div>
    </div>
  );
} 