import React, { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Clipboard } from "lucide-react";

interface InputAreaProps {
  code: string;
  setCode: (value: string) => void;
  handleProcess: () => void;
  selectedMessage: number | null;
  isLoading: boolean;
  onYouTubeUrl?: (url: string) => void;
  placeholder?: string;
}

const InputArea: React.FC<InputAreaProps> = ({
  code,
  setCode,
  handleProcess,
  selectedMessage,
  isLoading,
  onYouTubeUrl,
  placeholder = "Write your code or question here..."
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isPasting, setIsPasting] = useState(false);

  const isYouTubeUrl = (url: string) => {
    return url.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const text = e.dataTransfer.getData('text');
    if (isYouTubeUrl(text) && onYouTubeUrl) {
      onYouTubeUrl(text);
    } else {
      setCode(text);
    }
  }, [setCode, onYouTubeUrl]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text');
    if (isYouTubeUrl(text) && onYouTubeUrl) {
      e.preventDefault();
      onYouTubeUrl(text);
    }
  }, [onYouTubeUrl]);

  const handlePasteFromClipboard = async () => {
    try {
      setIsPasting(true);
      const text = await navigator.clipboard.readText();
      
      if (text && isYouTubeUrl(text) && onYouTubeUrl) {
        onYouTubeUrl(text);
      } else if (text) {
        setCode(text);
      }
    } catch (error) {
      console.error('Failed to read clipboard:', error);
    } finally {
      setIsPasting(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div className="w-full">
      <div 
        className={`relative rounded-lg ${isDragging ? 'border-2 border-dashed border-primary' : 'border border-gray-200 dark:border-gray-800'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onPaste={handlePaste}
          placeholder={placeholder}
          className="min-h-[60px] sm:min-h-[100px] lg:min-h-[120px] font-mono resize-none text-sm sm:text-base pb-12 border-0 text-gray-900 dark:text-gray-100 bg-white dark:bg-black rounded-lg youtube-input"
          style={{
            color: 'inherit'
          }}
        />
        
        {/* Botones posicionados dentro del área de texto */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          {/* Botón de pegado */}
          {onYouTubeUrl && (
            <Button 
              onClick={handlePasteFromClipboard} 
              disabled={isPasting}
              variant="secondary"
              className="flex items-center gap-1 h-8 sm:h-10 rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Paste from clipboard"
            >
              {isPasting ? (
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                <>
                  <Clipboard className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Paste</span>
                </>
              )}
            </Button>
          )}
          
          {/* Botón de proceso */}
          <Button 
            onClick={handleProcess} 
            disabled={!code.trim() || isLoading}
            className="w-20 sm:w-24 text-xs sm:text-sm py-1 px-2 sm:px-3 sm:py-2 h-8 sm:h-10 rounded-lg"
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              'Process'
            )}
          </Button>
        </div>
        
        {isDragging && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
            <p className="text-primary text-sm sm:text-base font-medium">Drop your code or YouTube URL here</p>
          </div>
        )}
      </div>
      
      <style jsx global>{`
        textarea {
          color: inherit !important;
        }
        
        /* Estilos específicos para textarea de YouTube */
        textarea.youtube-input {
          color: #000000 !important; 
        }
        
        /* Modo claro - forzar colores visibles */
        .light textarea, 
        html:not(.dark) textarea {
          color: #000000 !important;
          background-color: #ffffff !important;
        }
        
        /* Modo oscuro - mantener colores */
        .dark textarea {
          color: #ffffff !important;
          background-color: #000000 !important;
        }
        
        /* Forzar estilos específicos para modo claro */
        html:not(.dark) .text-gray-900 {
          color: #000000 !important;
        }

        html:not(.dark) .placeholder-text {
          color: #6b7280 !important;
        }
        
        /* Estilo de placeholder visible tanto en claro como oscuro */
        ::placeholder {
          color: #9ca3af !important;
          opacity: 0.7 !important;
        }
        
        .light ::placeholder, 
        html:not(.dark) ::placeholder {
          color: #6b7280 !important;
          opacity: 1 !important;
        }
        
        .dark ::placeholder {
          color: #9ca3af !important;
        }
        
        /* Asegurar que el texto en modo hover es visible */
        textarea:hover,
        textarea:focus,
        textarea:active {
          color: #000000 !important;
        }
        
        .dark textarea:hover,
        .dark textarea:focus,
        .dark textarea:active {
          color: #ffffff !important;
        }
      `}</style>
    </div>
  );
};

export default InputArea; 