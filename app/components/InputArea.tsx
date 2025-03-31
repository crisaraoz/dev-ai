import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

interface InputAreaProps {
  code: string;
  setCode: (value: string) => void;
  handleProcess: () => void;
  selectedMessage: number | null;
  isLoading?: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({
  code,
  setCode,
  handleProcess,
  selectedMessage,
  isLoading = false
}) => {
  return (
    <div className="relative">
      <Textarea
        placeholder={selectedMessage !== null ? "Continuing with your previous message..." : "Enter your code or question here..."}
        className="min-h-[150px] font-mono pr-12"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            if (code.trim() && !isLoading) handleProcess();
          }
        }}
        disabled={isLoading}
      />
      <div className="absolute bottom-2 right-2 flex items-center gap-2">
        <span className="text-xs text-gray-400">Ctrl+Enter</span>
        <Button 
          size="sm" 
          onClick={handleProcess}
          disabled={!code.trim() || isLoading}
          className="min-w-[70px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-1" />
              <span>Send</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default InputArea; 