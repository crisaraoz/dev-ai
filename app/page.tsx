"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Code2, Maximize2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LayoutGrid } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

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
import DocumentAnalyzer from "../components/DocumentAnalyzer";

export default function Home() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState("");
  const [videoResult, setVideoResult] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [testFramework, setTestFramework] = useState("Jest");
  const [testType, setTestType] = useState("unit");
  const [explanationLevel, setExplanationLevel] = useState("mid");
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("refactor");
  const [messages, setMessages] = useState<{type: 'user' | 'ai', content: string, response?: string, tab?: string}[]>([]);
  const { setTheme, theme } = useTheme();
  const { data: session } = useSession();
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
  const [transcriptCollapsed, setTranscriptCollapsed] = useState<boolean>(false);
  const [summarizeCollapsed, setSummarizeCollapsed] = useState<boolean>(true);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [youtubeResumePosition, setYoutubeResumePosition] = useState({ x: 20, y: 500 });
  const [youtubeResumeSize, setYoutubeResumeSize] = useState({ width: 500, height: 250 });
  const [activeFeature, setActiveFeature] = useState<'code' | 'youtube' | 'docAnalyzer'>('code');
  const [videoSummary, setVideoSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryLanguage, setSummaryLanguage] = useState("spanish");

  // Asegurarse de que la UI se renderiza correctamente después de cargar
  useEffect(() => {
    setMounted(true);
    
    // Detectar si es un dispositivo móvil por el ancho de la ventana
    const handleResize = () => {
      // Considerar móvil si el ancho es menor a 768px (estándar para tabletas/móviles)
      const isMobile = window.innerWidth < 768;
      setTranscriptCollapsed(isMobile);
    };
    
    // Verificar al cargar
    handleResize();
    
    // Escuchar cambios de tamaño para adaptarse a rotaciones de pantalla
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
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

  // Efecto para limpiar el video al cambiar a la pestaña de Code
  useEffect(() => {
    if (activeFeature === 'code') {
      setVideoUrl(null);
      setVideoResult("");
    }
  }, [activeFeature]);

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
  }, [videoResult]); // Recrear este efecto cuando cambia la transcripción del video

  // Segundo efecto para asegurarse de que la línea activa se mantenga resaltada
  useEffect(() => {
    // Solo ejecutar cuando hay resultado y tiempo de video
    if (!videoResult || currentVideoTime <= 0) return;
    
    // Crear una función para actualizar el resaltado
    const updateHighlight = () => {
      // Convertir segundos a formato MM:SS
      const minutes = Math.floor(currentVideoTime / 60);
      const seconds = Math.floor(currentVideoTime % 60);
      const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      const lines = videoResult.split('\n');
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
  }, [videoResult, currentVideoTime, autoScroll, userScrolling]);

  // Observador para detectar cambios en el DOM y asegurar que el resaltado se mantenga
  useEffect(() => {
    // Solo ejecutar cuando hay resultado
    if (!videoResult) return;
    
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
  }, [videoResult, currentVideoTime]);

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
    const newId = String(conversations.length + 1);
    const newConversation = {
      id: newId,
      title: `Nueva conversación ${newId}`,
      messages: [],
      date: "Hoy"
    };
    setConversations([...conversations, newConversation]);
    setActiveConversation(newId);
  };

  const selectConversation = (id: string) => {
    setActiveConversation(id);
    setSidebarOpen(false);
  };

  const deleteConversation = (id: string) => {
    setConversations(conversations.filter(conv => conv.id !== id));
    if (activeConversation === id) {
      setActiveConversation(conversations[0]?.id || null);
    }
  };

  const handleYouTubeUrl = async (url: string) => {
    setVideoUrl(url);
    setActiveFeature('youtube'); // Cambiar automáticamente a la vista de YouTube
    setIsLoading(true);
    setVideoSummary(null); // Limpiar el resumen del video anterior
    setSummaryError(null); // Limpiar cualquier error anterior
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/transcription/youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          video_url: url,
          use_generated: true
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al obtener la transcripción');
      }

      const data = await response.json();
      setVideoResult(data.transcription);
    } catch (error: any) {
      console.error('Error:', error);
      setVideoResult(`Error al procesar el video: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoTimeUpdate = (time: number) => {
    if (time !== currentVideoTime) {
      setCurrentVideoTime(time);
    }
  };

  // Función para manejar los clics en los timestamps de la transcripción
  const handleTranscriptTimeClick = (timeString: string) => {
    // Extraer solo el timestamp si se pasa una línea completa
    const timeMatch = timeString.match(/^(\d{2}:\d{2})/);
    const timestamp = timeMatch ? timeMatch[1] : timeString;
    
    // Verificar formato válido de timestamp (MM:SS)
    if (timestamp.match(/^\d{2}:\d{2}$/)) {
      const [minutes, seconds] = timestamp.split(':').map(Number);
      const timeInSeconds = minutes * 60 + seconds;
      // Reset para forzar actualización incluso si el valor es el mismo
      setVideoSeekTime(undefined);
      
      // Pequeño retardo para asegurar que el reset surta efecto
      setTimeout(() => {
        setVideoSeekTime(timeInSeconds);
      }, 50);
    }
  };

  // Función para manejar el resumen del video
  const handleSummarizeVideo = async () => {
    if (!videoUrl || !videoResult) return;
    
    setIsSummarizing(true);
    setSummaryError(null);
    setVideoSummary(null);
    
    try {
      const response = await fetch('/api/v1/transcription/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcription: videoResult,
          language: summaryLanguage
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al generar el resumen');
      }
      
      const data = await response.json();
      setVideoSummary(data.summary);
    } catch (error) {
      console.error('Error:', error);
      setSummaryError('Error al generar el resumen. Por favor intenta de nuevo.');
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-black">
      {mounted && (
        <>
          <Header />
          
          <div className="relative flex-1 flex flex-col overflow-hidden">
            {/* Button for sidebar - toggle open/close */}
            <div className="fixed top-4 left-3 z-50">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-1 sm:p-2 bg-white dark:bg-black rounded"
              >
                <LayoutGrid className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>

            <Sidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              conversations={conversations}
              activeConversation={activeConversation}
              onNewConversation={startNewConversation}
              onSelectConversation={setActiveConversation}
              onDeleteConversation={deleteConversation}
            />

            {/* Feature Selector Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
              <div className="flex justify-center mx-auto py-1">
                <div className="w-full max-w-[800px] px-2 sm:px-4 mx-auto">
                  <Tabs 
                    value={activeFeature} 
                    onValueChange={(value) => setActiveFeature(value as 'code' | 'youtube' | 'docAnalyzer')}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-transparent p-0 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                      <TabsTrigger 
                        value="code"
                        className="flex items-center justify-center h-8 sm:h-10 px-2 sm:px-6 py-0 border-0 border-r border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-black text-center text-gray-500 dark:text-gray-400 data-[state=active]:!bg-blue-500 data-[state=active]:!text-white rounded-tl-lg rounded-bl-lg rounded-tr-none rounded-br-none transition-colors text-xs sm:text-sm"
                      >
                        <Code2 className="h-4 w-4 mr-1" /> Code
                      </TabsTrigger>
                      <TabsTrigger 
                        value="youtube"
                        className="flex items-center justify-center h-8 sm:h-10 px-2 sm:px-6 py-0 border-0 border-r border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-black text-center text-gray-500 dark:text-gray-400 data-[state=active]:!bg-blue-500 data-[state=active]:!text-white rounded-none transition-colors text-xs sm:text-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1">
                          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"></path>
                          <path d="m10 15 5-3-5-3z"></path>
                        </svg> YouTube
                      </TabsTrigger>
                      <TabsTrigger 
                        value="docAnalyzer"
                        className="flex items-center justify-center h-8 sm:h-10 px-2 sm:px-6 py-0 border-0 bg-gray-100 dark:bg-black text-center text-gray-500 dark:text-gray-400 data-[state=active]:!bg-blue-500 data-[state=active]:!text-white rounded-tr-lg rounded-br-lg rounded-tl-none rounded-bl-none transition-colors text-xs sm:text-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1">
                          <circle cx="11" cy="11" r="8"></circle>
                          <path d="m21 21-4.3-4.3"></path>
                        </svg> Docs AI
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </div>

            {/* Main Content Area with fixed padding to account for footer height */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-black" style={{ paddingBottom: "60px" }}>
              <div className="max-w-7xl mx-auto p-2 sm:p-4">
                {activeFeature === 'code' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                    {/* Left Column */}
                    <div className="space-y-3 sm:space-y-6">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <LanguageSelector 
                          language={language} 
                          setLanguage={setLanguage}
                          explanationLevel={explanationLevel}
                          setExplanationLevel={setExplanationLevel}
                          isDisabled={activeTab === "transcript" || !!videoUrl}
                        />
                      </div>
                      <div className="bg-card rounded-lg overflow-hidden border">
                        {videoUrl ? (
                          <YouTubePlayer 
                            videoUrl={videoUrl} 
                            onTimeUpdate={handleVideoTimeUpdate}
                            seekTo={videoSeekTime}
                            isProcessing={isLoading}
                            onYouTubeUrl={handleYouTubeUrl}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 px-4 sm:p-8 h-[200px] bg-white dark:bg-black rounded-lg">
                            <div className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-300">&lt;/&gt;</div>
                            <h1 className="text-2xl font-bold mb-8 text-center text-gray-900 dark:text-white">Welcome to AI Dev Tools</h1>
                            <div className="w-full max-w-md">
                              <button className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-left hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                                onClick={() => document.querySelector('textarea')?.focus()}>
                                Write your code or question to start the conversation
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <InputArea 
                        code={code}
                        setCode={setCode}
                        handleProcess={handleProcess}
                        selectedMessage={selectedMessage}
                        isLoading={isLoading}
                        onYouTubeUrl={handleYouTubeUrl}
                      />
                    </div>
                    
                    {/* Right Column */}
                    <div className="space-y-2 sm:space-y-4">
                      <div className="flex items-center justify-between">
                        <select
                          value={activeTab}
                          onChange={(e) => setActiveTab(e.target.value)}
                          className="text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-black"
                          style={{ 
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23444444%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.5rem center',
                            backgroundSize: '0.65em auto',
                            paddingRight: '2.5rem'
                          }}
                        >
                          <option value="refactor">Refactor</option>
                          <option value="explain">Explain</option>
                          <option value="lint">Lint & Fix</option>
                          <option value="test">Write Tests</option>
                        </select>
                      </div>
                      
                      <div className="h-[calc(100vh-300px)] min-h-[300px] lg:min-h-[400px] lg:h-[calc(100vh-340px)] bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 p-4 overflow-auto">
                        <ResultsArea 
                          result={result} 
                          isLoading={isLoading}
                          showTimestamps={activeTab === "transcript"}
                          onTimeClick={handleTranscriptTimeClick}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeFeature === 'youtube' && (
                  <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                    {/* Left Column */}
                    <div className="space-y-3">
                      <div className="bg-card rounded-lg overflow-hidden border h-[520px] flex flex-col">
                        <div className="relative flex-grow">
                          {/* YouTube player container */}
                          <div id="youtube-player" className="absolute inset-0 bg-zinc-900 dark:bg-zinc-950 flex items-center justify-center">
                            {videoUrl ? (
                              <YouTubePlayer 
                                videoUrl={videoUrl} 
                                onTimeUpdate={handleVideoTimeUpdate}
                                seekTo={videoSeekTime}
                                isProcessing={isLoading}
                                onYouTubeUrl={handleYouTubeUrl}
                              />
                            ) : (
                              <div 
                                className="h-full w-full flex flex-col items-center justify-center p-4 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-900 group"
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.currentTarget.classList.add('border-2', 'border-dashed', 'border-primary');
                                  e.currentTarget.classList.add('bg-gray-200', 'dark:bg-gray-900');
                                }}
                                onDragLeave={(e) => {
                                  e.preventDefault();
                                  e.currentTarget.classList.remove('border-2', 'border-dashed', 'border-primary');
                                  e.currentTarget.classList.remove('bg-gray-200', 'dark:bg-gray-900');
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  e.currentTarget.classList.remove('border-2', 'border-dashed', 'border-primary');
                                  e.currentTarget.classList.remove('bg-gray-200', 'dark:bg-gray-900');
                                  const text = e.dataTransfer.getData('text');
                                  if (text.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/)) {
                                    handleYouTubeUrl(text);
                                  }
                                }}
                                onPaste={(e) => {
                                  const text = e.clipboardData.getData('text');
                                  if (text.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/)) {
                                    e.preventDefault();
                                    handleYouTubeUrl(text);
                                  }
                                }}
                                tabIndex={0}
                              >
                                <p className="text-center text-white font-medium group-hover:text-gray-900 hover:text-gray-900 dark:group-hover:text-white dark:hover:text-white">Drag & Drop or Copy your Youtube URL</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Input area integrated within the same box */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-800" style={{ flexShrink: 0 }}>
                          <InputArea 
                            code={code}
                            setCode={setCode}
                            handleProcess={handleProcess}
                            selectedMessage={selectedMessage}
                            isLoading={isLoading}
                            onYouTubeUrl={handleYouTubeUrl}
                            placeholder="Paste your YouTube URL here"
                          />
                        </div>
                      </div>
                    </div>
                  
                    {/* Right Column - Transcript */}
                    <div className="flex flex-col h-full">
                      <div className={`bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg overflow-hidden ${transcriptCollapsed ? 'h-auto' : 'h-[520px]'}`}>
                        <div 
                          className={`flex items-center justify-between p-3 ${transcriptCollapsed ? '' : 'border-b'} border-gray-200 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors`}
                          onClick={() => setTranscriptCollapsed(!transcriptCollapsed)}
                        >
                          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                            <span>Video Transcript</span>
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="16" 
                              height="16" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              className={`ml-2 transition-transform ${transcriptCollapsed ? 'rotate-180' : 'rotate-0'}`}
                            >
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </h2>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <span className="text-sm text-gray-700 dark:text-gray-300">Auto-scroll</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAutoScroll(!autoScroll);
                              }}
                              className={`px-2 py-1 text-xs rounded ${
                                autoScroll ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {autoScroll ? 'ON' : 'OFF'}
                            </button>
                          </div>
                        </div>

                        {!transcriptCollapsed && (
                          <div className="bg-gray-50 dark:bg-black relative h-[477px]">
                            {/* Transcripción */}
                            <div className="h-full p-4 overflow-auto transcript-scroll-area">
                              {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                  <div className="animate-spin h-10 w-10 border-4 border-t-primary border-r-transparent border-b-primary border-l-transparent rounded-full"></div>
                                </div>
                              ) : videoResult ? (
                                <div className="space-y-1">
                                  {videoResult.split('\n').map((line, i) => (
                                    <div 
                                      key={i}
                                      id={`transcript-line-${i}`}
                                      className="py-1 px-1 rounded transition-colors"
                                    >
                                      {line.match(/^(\d{2}:\d{2})/) ? (
                                        <div className="flex items-start">
                                          <span 
                                            className="inline-block bg-white dark:bg-gray-700 text-black dark:text-white text-xs font-mono py-0.5 px-1.5 rounded mr-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                                            onClick={() => {
                                              const timeMatch = line.match(/^(\d{2}:\d{2})/);
                                              if (timeMatch && timeMatch[1]) {
                                                handleTranscriptTimeClick(timeMatch[1]);
                                              }
                                            }}
                                          >
                                            {(() => {
                                              const match = line.match(/^(\d{2}:\d{2})/);
                                              return match ? match[1] : "00:00";
                                            })()}
                                          </span>
                                          <span className="text-gray-800 dark:text-gray-200">{line.replace(/^\d{2}:\d{2}\s*/, '')}</span>
                                        </div>
                                      ) : (
                                        <span className="text-gray-800 dark:text-gray-200">{line}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-gray-800 dark:text-white text-center h-full flex items-center justify-center">
                                  Enter a YouTube URL to view the transcription
                                </div>
                              )}
                            </div>
                            
                            {/* Botones de acción para la transcripción */}
                            {videoResult && (
                              <div className="absolute bottom-3 right-3 flex space-x-2 z-20">
                                <button 
                                  className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-md"
                                  onClick={() => {
                                    navigator.clipboard.writeText(videoResult);
                                  }}
                                  title="Copy transcription"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-300">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                  </svg>
                                </button>
                                <button 
                                  className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-md"
                                  onClick={() => {
                                    const blob = new Blob([videoResult], { type: "text/plain" });
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = url;
                                    const fileName = videoUrl ? 
                                      `transcription_${new Date().toISOString().slice(0, 10)}` : 
                                      "transcription";
                                    a.download = `${fileName}.txt`;
                                    a.click();
                                  }}
                                  title="Descargar transcripción"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-300">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* YouTube Video Summary - Now with toggle functionality */}
                  <div className="mt-4">
                    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg overflow-hidden">
                      <div 
                        className={`flex items-center justify-between p-3 ${summarizeCollapsed ? '' : 'border-b'} border-gray-200 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors`}
                        onClick={() => setSummarizeCollapsed(!summarizeCollapsed)}
                      >
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                          <RefreshCw className="h-5 w-5 mr-2" />
                          <span>Summarize YouTube Video</span>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className={`ml-2 transition-transform ${summarizeCollapsed ? 'rotate-180' : 'rotate-0'}`}
                          >
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </h2>
                      </div>
                      
                      {!summarizeCollapsed && (
                        <div className="p-4">
                          <div className="flex space-x-2 mb-4">
                            <select 
                              className="bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-300"
                              value={summaryLanguage}
                              onChange={(e) => setSummaryLanguage(e.target.value)}
                            >
                              <option value="spanish">Spanish</option>
                              <option value="english">English</option>
                            </select>
                            <button 
                              className="flex-grow bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-md flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-blue-400"
                              disabled={!videoUrl || !videoResult || isSummarizing}
                              onClick={handleSummarizeVideo}
                            >
                              {isSummarizing ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Summarizing...
                                </>
                              ) : (
                                'Summarize'
                              )}
                            </button>
                          </div>

                          {isSummarizing && (
                            <div className="flex justify-center items-center py-8">
                              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                          )}
                          
                          {!isSummarizing && videoSummary && (
                            <div className="prose dark:prose-invert max-w-none">
                              <div className="whitespace-pre-line">{videoSummary}</div>
                            </div>
                          )}
                          
                          {!isSummarizing && !videoSummary && videoUrl && videoResult && (
                            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                              <p>Click &quot;Summarize&quot; to generate an AI summary of this video.</p>
                            </div>
                          )}
                          
                          {!videoUrl && (
                            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                              <p>Load a YouTube video to use this feature.</p>
                            </div>
                          )}
                          
                          {videoUrl && !videoResult && (
                            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                              <p>Waiting for video transcription...</p>
                            </div>
                          )}
                          
                          {summaryError && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-md mt-2 text-sm">
                              <p>{summaryError}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  </>
                )}

                {activeFeature === 'docAnalyzer' && (
                  <div className="space-y-4">
                    <DocumentAnalyzer />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fixed Footer that's always visible */}
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 z-20">
            <Footer />
            {/* Overlay para el footer cuando el sidebar está abierto */}
            {sidebarOpen && (
              <div 
                className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </div>
          
          {/* Global styles for text visibility and scrollbar */}
          <style jsx global>{`
            /* Force text visibility in both modes */
            label, .label, h1, h2, h3, h4, h5, h6, p, span, div, option {
              color: inherit;
            }
            
            /* Fix for inputs, selects and textareas */
            textarea, input[type="text"], input[type="email"], input[type="url"], input[type="password"] {
              color: var(--foreground) !important;
            }
            
            .light textarea, html:not(.dark) textarea,
            .light input[type="text"], html:not(.dark) input[type="text"],
            .light input[type="email"], html:not(.dark) input[type="email"],
            .light input[type="url"], html:not(.dark) input[type="url"],
            .light input[type="password"], html:not(.dark) input[type="password"] {
              color: #000000 !important;
              background-color: #ffffff !important;
            }
            
            .dark textarea, 
            .dark input[type="text"],
            .dark input[type="email"],
            .dark input[type="url"],
            .dark input[type="password"] {
              color: #d1d5db !important;
              background-color: #000000 !important;
            }
            
            /* Custom scrollbar styles */
            ::-webkit-scrollbar {
              width: 8px;
              height: 8px;
            }
            
            ::-webkit-scrollbar-track {
              background: transparent;
            }
            
            ::-webkit-scrollbar-thumb {
              background: #888;
              border-radius: 4px;
            }
            
            ::-webkit-scrollbar-thumb:hover {
              background: #555;
            }
            
            .overflow-y-auto {
              scrollbar-width: thin;
              scrollbar-color: #888 transparent;
            }
            
            /* Hide scrollbar on the main document */
            html, body {
              overflow: hidden;
              height: 100%;
              width: 100%;
            }
          `}</style>
        </>
      )}
    </div>
  );
} 