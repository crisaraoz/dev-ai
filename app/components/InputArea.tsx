import React, { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface InputAreaProps {
  code: string;
  setCode: (value: string) => void;
  handleProcess: () => void;
  selectedMessage: number | null;
  isLoading: boolean;
  onYouTubeUrl?: (url: string) => void;
}

const InputArea: React.FC<InputAreaProps> = ({
  code,
  setCode,
  handleProcess,
  selectedMessage,
  isLoading,
  onYouTubeUrl
}) => {
  const [isDragging, setIsDragging] = useState(false);

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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div className="space-y-2">
      <div 
        className={`relative rounded-md ${isDragging ? 'border-2 border-dashed border-primary' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onPaste={handlePaste}
          placeholder="Enter your code or question here... You can also drag & drop a YouTube URL"
          className="min-h-[100px] font-mono resize-none"
        />
        {isDragging && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
            <p className="text-primary font-medium">Drop your code or YouTube URL here</p>
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <Button 
          onClick={handleProcess} 
          disabled={!code.trim() || isLoading}
          className="w-24"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Process'
          )}
        </Button>
      </div>
    </div>
  );
};

export default InputArea; 