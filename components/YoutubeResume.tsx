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
  defaultSize?: { width: number | string; height: number };
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
  defaultSize = { width: '100%', height: 250 },
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
  const [size, setSize] = useState({ width: 0, height: defaultSize.height });
  const [position, setPosition] = useState(defaultPosition);

  // Función para limpiar la transcripción (quitar timestamps)
  const cleanTranscription = (text: string): string => {
    // Busca patrones como "00:06 " al inicio de cada línea y los elimina
    return text.replace(/^\d{2}:\d{2}\s/gm, '');
  };

  // Efecto para inicializar el tamaño una vez que el componente está montado
  useEffect(() => {
    const container = document.querySelector('.results-container');
    if (container && !mounted) {
      const containerWidth = container.getBoundingClientRect().width;
      setSize({ width: containerWidth, height: defaultSize.height });
      setMounted(true);
    }
  }, [defaultSize.height, mounted]);

  // Efecto para actualizar cuando cambia la transcripción inicial
  useEffect(() => {
    if (initialTranscription !== transcription) {
      setTranscription(initialTranscription);
    }
  }, [initialTranscription, transcription]);

  // Efecto para limpiar automáticamente la transcripción cuando cambia
  useEffect(() => {
    if (transcription) {
      setDisplayedTranscription(cleanTranscription(transcription));
    } else {
      setDisplayedTranscription("");
    }
  }, [transcription]);

  // Efecto para ajustar la altura cuando hay resumen
  useEffect(() => {
    if (summary) {
      setSize(prev => ({ ...prev, height: 400 }));
    }
  }, [summary]);

  // No renderizar nada hasta que tengamos el tamaño correcto
  if (!mounted || size.width === 0) {
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

      // Actualizamos el resumen
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al resumir el texto");
    } finally {
      setSummarizingText(false);
    }
  };

  return (
    <Draggable
      defaultPosition={defaultPosition}
      position={position}
      handle=".drag-handle"
      bounds="parent"
      onStop={(_e, data) => {
        const newPosition = { x: data.x, y: data.y };
        setPosition(newPosition);
        onPositionChange?.(newPosition);
      }}
    >
      <ResizableBox
        width={size.width}
        height={size.height}
        minConstraints={[300, summary ? 400 : 200]}
        maxConstraints={[2000, 800]}
        resizeHandles={['se']}
        className="relative"
        onResize={(_e: React.SyntheticEvent, data: ResizeCallbackData) => {
          const newSize = { width: data.size.width, height: data.size.height };
          setSize(newSize);
          onSizeChange?.(newSize);
        }}
      >
        <Card className="w-full h-full overflow-hidden border rounded-md shadow-lg">
          <CardHeader className="pb-0 drag-handle cursor-move bg-card">
            <div className="flex justify-between items-center w-full">
              <CardTitle className="text-xl tracking-tight flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Summarize YouTube Video
              </CardTitle>
            </div>
            <CardDescription>
              Get an AI-generated summary of the video content
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[calc(100%-80px)] overflow-y-auto">
            <div className="space-y-4">
              <Textarea 
                placeholder="Paste the video transcription here..." 
                className={`resize-none w-full ${summary ? 'min-h-[60px]' : 'min-h-[80px]'}`}
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
                      <span>Summarize this text</span>
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {summary && (
                <div className="p-4 bg-muted rounded-md space-y-2 min-h-[200px]">
                  <h3 className="font-medium">Video Summary:</h3>
                  <div className="text-sm whitespace-pre-line">
                    {summary}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </ResizableBox>
    </Draggable>
  );
} 