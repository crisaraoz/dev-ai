"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2, FileText, RefreshCw } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface YoutubeResumeProps {
  initialTranscription?: string;
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

export default function YoutubeResume({ initialTranscription = "" }: YoutubeResumeProps) {
  const [transcription, setTranscription] = useState(initialTranscription);
  const [displayedTranscription, setDisplayedTranscription] = useState("");
  const [summary, setSummary] = useState("");
  const [summarizingText, setSummarizingText] = useState(false);
  const [error, setError] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("es");

  // Función para limpiar la transcripción (quitar timestamps)
  const cleanTranscription = (text: string): string => {
    // Busca patrones como "00:06 " al inicio de cada línea y los elimina
    return text.replace(/^\d{2}:\d{2}\s/gm, '');
  };

  // Efecto para actualizar cuando cambia la transcripción inicial
  useEffect(() => {
    if (initialTranscription !== transcription) {
      setTranscription(initialTranscription);
    }
  }, [initialTranscription]);

  // Efecto para limpiar automáticamente la transcripción cuando cambia
  useEffect(() => {
    if (transcription) {
      setDisplayedTranscription(cleanTranscription(transcription));
    } else {
      setDisplayedTranscription("");
    }
  }, [transcription]);

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
    <Card className="w-full">
      <CardHeader className="pb-0">
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
      <CardContent>
        <div className="space-y-4">
          <Textarea 
            placeholder="Paste the video transcription here..." 
            className="min-h-[150px]"
            value={displayedTranscription}
            onChange={(e) => {
              setDisplayedTranscription(e.target.value);
              // Actualizamos también la transcripción original para mantener sincronización
              setTranscription(e.target.value);
            }}
          />

          <div className="flex space-x-2">
            <Select
              value={selectedLanguage}
              onValueChange={setSelectedLanguage}
            >
              <SelectTrigger className="w-[200px]">
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
              className="flex items-center gap-1 w-full"
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
            <div className="p-4 bg-muted rounded-md space-y-2">
              <h3 className="font-medium">Video Summary:</h3>
              <div className="text-sm whitespace-pre-line">
                {summary}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 