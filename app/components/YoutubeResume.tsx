"use client";

import React, { useState, useEffect } from 'react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Loader2, FileText, GripVertical } from "lucide-react";
import Draggable from 'react-draggable';

interface YoutubeResumeProps {
  videoUrl?: string | null;
  transcription?: string;
  onClose?: () => void;
}

const YoutubeResume: React.FC<YoutubeResumeProps> = ({ videoUrl, transcription, onClose }) => {
  const [language, setLanguage] = useState('Spanish');
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // No mostrar el componente hasta que esté montado
  if (!mounted) return null;

  const handleSummarize = async () => {
    if (!videoUrl) return;
    
    setIsLoading(true);
    try {
      // Convertimos el idioma seleccionado a código ISO (en, es)
      const languageCode = language === 'English' ? 'en' : 'es';
      
      console.log('Enviando solicitud con idioma:', {
        original: language,
        code: languageCode
      });
      
      const response = await fetch('http://localhost:8000/api/v1/summary/youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_url: videoUrl,
          language: languageCode, // Enviamos el código de idioma (en, es)
          transcription: transcription
        })
      });

      if (!response.ok) {
        console.error('Error al llamar al API. Estado:', response.status);
        throw new Error(`Error al generar el resumen. Estado: ${response.status}`);
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error('Error al generar resumen:', error);
      setSummary(error instanceof Error ? 
        `Error al generar el resumen: ${error.message}` : 
        'Error al generar el resumen. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Draggable handle=".drag-handle" bounds="parent">
      <div className="w-full mb-4">
        <Card className="p-4 bg-gray-50 dark:bg-black shadow-lg border border-gray-200 dark:border-gray-800">
          <div className="space-y-4">
            <div className="flex items-center justify-between drag-handle cursor-move">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Summarize YouTube Video
              </h2>
              <GripVertical className="h-5 w-5 text-gray-500" />
            </div>
            
            <p className="text-sm text-muted-foreground">Get an AI-generated summary of the video content</p>
            
            <div className="flex items-center gap-4">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select the language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Spanish">Spanish</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={handleSummarize} 
                disabled={isLoading || !videoUrl}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating summary...
                  </>
                ) : (
                  'Summarize this video'
                )}
              </Button>
            </div>

            {(isLoading || summary) && (
              <div className="min-h-[200px] bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : summary ? (
                  <div className="prose dark:prose-invert max-w-none">
                    {summary.split('\n').map((paragraph, i) => (
                      <p key={i} className="mb-4 last:mb-0">{paragraph}</p>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </Card>
      </div>
    </Draggable>
  );
};

export default YoutubeResume; 