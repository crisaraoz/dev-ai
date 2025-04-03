"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2, FileText, RefreshCw } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import Draggable from 'react-draggable';
import { ResizableBox, ResizeCallbackData } from 'react-resizable';
import 'react-resizable/css/styles.css';

interface YoutubeResumeProps {
  initialTranscription?: string;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
}

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "ru", label: "Russian" },
];

export default function YoutubeResume({ 
  initialTranscription = "", 
  defaultPosition = { x: 0, y: 0 },
  defaultSize = { width: 700, height: 120 },
  onPositionChange,
  onSizeChange
}: YoutubeResumeProps) {
  const [transcription, setTranscription] = useState(initialTranscription);
  const [displayedTranscription, setDisplayedTranscription] = useState("");
  const [summary, setSummary] = useState("");
  const [summarizingText, setSummarizingText] = useState(false);
  const [error, setError] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("es");
  const [mounted, setMounted] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [position, setPosition] = useState(defaultPosition);
  const [isFloating, setIsFloating] = useState(false);

  // Función para limpiar la transcripción (quitar timestamps)
  const cleanTranscription = (text: string): string => {
    // Busca patrones como "00:06 " al inicio de cada línea y los elimina
    return text.replace(/^\d{2}:\d{2}\s/gm, '');
  };

  // Efecto para inicializar el tamaño una vez que el componente está montado
  useEffect(() => {
    if (!mounted) {
      // Set a default size based on container or viewport
      const defaultWidth = window.innerWidth > 768 ? 
        Math.min(800, window.innerWidth - 40) : 
        window.innerWidth - 40;
      
      setSize({ width: defaultWidth, height: summary ? 500 : 300 });
      setMounted(true);
    }
  }, [defaultSize.height, mounted, summary]);

  // Efecto para actualizar cuando cambia la transcripción inicial
  useEffect(() => {
    if (initialTranscription !== transcription) {
      setTranscription(initialTranscription);
      // Update the displayedTranscription right away so we don't wait for the next effect
      setDisplayedTranscription(cleanTranscription(initialTranscription));
      setSummary("");
      setError("");
    }
  }, [initialTranscription, transcription]);

  // Efecto para limpiar automáticamente la transcripción cuando cambia
  useEffect(() => {
    if (transcription) {
      setDisplayedTranscription(cleanTranscription(transcription));
    } else {
      setDisplayedTranscription("");
      setSummary("");
      setError("");
    }
  }, [transcription]);

  // Efecto para ajustar la altura cuando hay resumen
  useEffect(() => {
    if (summary) {
      setSize(prev => ({ ...prev, height: 500 }));
    }
  }, [summary]);

  // Efecto para asegurar que el componente no se salga de la pantalla
  useEffect(() => {
    const keepInViewport = () => {
      // Get viewport dimensions
      const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
      
      // Check if component is outside viewport
      let newPosition = { ...position };
      let changed = false;
      
      // Check right edge
      if (position.x + size.width > vw) {
        newPosition.x = Math.max(0, vw - size.width);
        changed = true;
      }
      
      // Check bottom edge
      if (position.y + size.height > vh) {
        newPosition.y = Math.max(0, vh - size.height);
        changed = true;
      }
      
      // Check left edge
      if (position.x < 0) {
        newPosition.x = 0;
        changed = true;
      }
      
      // Check top edge
      if (position.y < 0) {
        newPosition.y = 0;
        changed = true;
      }
      
      if (changed) {
        setPosition(newPosition);
      }
    };
    
    // Run once when component is mounted
    keepInViewport();
    
    // Run when window is resized
    window.addEventListener('resize', keepInViewport);
    return () => window.removeEventListener('resize', keepInViewport);
  }, [position, size]);

  // No renderizar nada hasta que tengamos el tamaño correcto
  if (!mounted) {
    return null;
  }

  // Función para resumir un texto directamente
  const handleSummarizeText = async (text: string) => {
    if (!text.trim()) {
      setError("Por favor, ingresa una transcripción");
      return;
    }
    
    setSummarizingText(true);
    setError("");
    setSummary("");
    
    try {
      // Llamamos a la API enviando directamente la transcripción
      const response = await fetch('http://localhost:8000/api/v1/summary/youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcription: text,
          language_code: selectedLanguage,
          max_length: 500
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Error al resumir el texto");
      }

      // Actualizamos el resumen y ajustamos el tamaño para mostrar todo el contenido
      setSummary(data.summary);
      setSize(prev => ({ ...prev, height: 500 }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al resumir el texto");
    } finally {
      setSummarizingText(false);
    }
  };

  return isFloating ? (
    <Draggable
      handle=".drag-handle"
      defaultPosition={defaultPosition}
      onStop={(e, data) => {
        const newPosition = { x: data.x, y: data.y };
        setPosition(newPosition);
        onPositionChange?.(newPosition);
      }}
      position={position}
      positionOffset={{ x: 0, y: 0 }}
    >
      <div style={{ 
        zIndex: 9999, 
        visibility: "visible", 
        display: "block", 
        pointerEvents: "auto",
        position: "absolute",
        left: 0,
        top: 0,
        transform: `translate(${position.x}px, ${position.y}px)`
      }}>
        <div className="resize-corner-indicator absolute top-0 right-0 w-4 h-4 bg-primary/40 rounded-tr cursor-ne-resize z-10"></div>
        <div className="resize-corner-indicator absolute top-0 left-0 w-4 h-4 bg-primary/40 rounded-tl cursor-nw-resize z-10"></div>
        <div className="resize-corner-indicator absolute bottom-0 left-0 w-4 h-4 bg-primary/40 rounded-bl cursor-sw-resize z-10"></div>
        <div className="resize-corner-indicator absolute bottom-0 right-0 w-4 h-4 bg-primary/40 rounded-br cursor-se-resize z-10"></div>
        <ResizableBox
          width={size.width}
          height={size.height}
          onResize={(e: React.SyntheticEvent, data: ResizeCallbackData) => {
            const newSize = {
              width: data.size.width,
              height: data.size.height
            };
            setSize(newSize);
            onSizeChange?.(newSize);
          }}
          minConstraints={[300, 200]}
          maxConstraints={[1000, 800]}
          resizeHandles={['se', 'e', 's', 'ne', 'n', 'sw', 'w', 'nw']}
          handle={<div className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize bg-primary/60 rounded-bl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </div>}
        >
          <Card className="border rounded-md shadow-lg w-full h-full">
            <CardHeader className="pb-2 drag-handle cursor-move bg-card">
              <div className="flex justify-between items-center w-full">
                <CardTitle className="text-xl tracking-tight flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Summarize YouTube Video
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="p-1 h-7" 
                    onClick={() => setIsFloating(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                  </Button>
                  <div className="p-1 rounded bg-primary/10 text-primary flex items-center">
                    <span className="text-xs mr-1">Drag</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="4" y1="9" x2="20" y2="9"></line>
                      <line x1="4" y1="15" x2="20" y2="15"></line>
                    </svg>
                  </div>
                </div>
              </div>
              <CardDescription className="text-sm">
                Get an AI-generated summary of the video content
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 overflow-auto" style={{ height: 'calc(100% - 90px)' }}>
              <div className="flex flex-col gap-2">
                <Textarea 
                  placeholder="Paste the video transcription here..." 
                  className="resize-none w-full hidden"
                  value={displayedTranscription}
                  onChange={(e) => {
                    setDisplayedTranscription(e.target.value);
                    setTranscription(e.target.value);
                  }}
                />

                <div className="flex space-x-2">
                  <Select
                    value={selectedLanguage}
                    onValueChange={setSelectedLanguage}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((language) => (
                        <SelectItem key={language.value} value={language.value}>
                          {language.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    type="button"
                    onClick={() => handleSummarizeText(displayedTranscription)}
                    className="flex items-center gap-1 flex-1"
                    disabled={!displayedTranscription || summarizingText}
                  >
                    {summarizingText ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Summarizing...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        <span>Summarize this video</span>
                      </>
                    )}
                  </Button>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {summarizingText && (
                  <div className="p-4 bg-muted rounded-md space-y-2 mt-2 flex items-center justify-center min-h-[200px]">
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-8 w-8 animate-spin mb-2" />
                      <div className="text-sm font-medium">Generating summary...</div>
                    </div>
                  </div>
                )}

                {!summarizingText && summary && (
                  <div className="p-4 bg-muted rounded-md space-y-2 mt-2 overflow-auto" style={{ maxHeight: "80vh" }}>
                    {/* <h3 className="font-medium text-lg sticky top-0 bg-muted py-2">Video Summary:</h3> */}
                    <div className="text-base whitespace-pre-line">
                      {summary}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </ResizableBox>
      </div>
    </Draggable>
  ) : (
    <div className="w-full">
      <Card className="border rounded-md shadow-lg w-full">
        <CardHeader className="pb-2 bg-card">
          <div className="flex justify-between items-center w-full">
            <CardTitle className="text-xl tracking-tight flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Summarize YouTube Video
            </CardTitle>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7" 
              onClick={() => setIsFloating(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
              <span className="text-xs">Float</span>
            </Button>
          </div>
          <CardDescription className="text-sm">
            Get an AI-generated summary of the video content
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 overflow-auto">
          <div className="flex flex-col gap-2">
            <div className="flex space-x-2">
              <Select
                value={selectedLanguage}
                onValueChange={setSelectedLanguage}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language.value} value={language.value}>
                      {language.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                type="button"
                onClick={() => handleSummarizeText(displayedTranscription)}
                className="flex items-center gap-1 flex-1"
                disabled={!displayedTranscription || summarizingText}
              >
                {summarizingText ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Summarizing...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    <span>Summarize this video</span>
                  </>
                )}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {summarizingText && (
              <div className="p-4 bg-muted rounded-md space-y-2 mt-2 flex items-center justify-center min-h-[200px]">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <div className="text-sm font-medium">Generating summary...</div>
                </div>
              </div>
            )}

            {!summarizingText && summary && (
              <div className="p-4 bg-muted rounded-md space-y-2 mt-2 max-h-[50vh] overflow-auto">
                {/* <h3 className="font-medium text-lg sticky top-0 bg-muted py-2">Video Summary:</h3> */}
                <div className="text-base whitespace-pre-line">
                  {summary}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 