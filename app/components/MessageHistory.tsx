import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Edit, Copy } from "lucide-react";
import ExplanationBlock from "./ExplanationBlock";
import { renderCodeResult } from "./utils";

interface Message {
  type: 'user' | 'ai';
  content: string;
  response?: string;
  tab?: string;
}

interface MessageHistoryProps {
  messages: Message[];
  language: string;
  handleContinueConversation: (idx: number) => void;
}

const MessageHistory: React.FC<MessageHistoryProps> = ({
  messages,
  language,
  handleContinueConversation
}) => {
  if (messages.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center border rounded-md bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <h3 className="text-lg font-medium mb-1">Welcome to AI Dev Tools</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Write your code or question to start the conversation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] border rounded-md p-4 bg-gray-50 dark:bg-gray-900 messages-container overflow-y-auto">
      <div className="space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className="space-y-4">
            {/* Mensaje del usuario */}
            <div className="flex items-start gap-3">
              <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                </svg>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-lg w-full">
                <pre className="whitespace-pre-wrap font-mono text-sm overflow-auto max-h-[200px]">{msg.content}</pre>
                <div className="flex gap-2 mt-2 justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleContinueConversation(idx)}
                    className="h-7 px-2 text-xs"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Continuar
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Respuesta de la IA */}
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M6.5 13a6.474 6.474 0 0 0 3.845-1.258h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.008 1.008 0 0 0-.115-.1A6.471 6.471 0 0 0 13 6.5 6.502 6.502 0 0 0 6.5 0a6.5 6.5 0 1 0 0 13Zm0-8.518c1.664-1.673 5.825 1.254 0 5.018-5.825-3.764-1.664-6.69 0-5.018Z"/>
                </svg>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 rounded-lg w-full">
                {msg.tab === 'explain' ? (
                  <ExplanationBlock>
                    {msg.response?.includes('Explaining') 
                      ? msg.response.split('Explaining')[1].split(':\n\n')[1] || ''
                      : msg.response || ''
                    }
                  </ExplanationBlock>
                ) : (
                  renderCodeResult(msg.response || '', language === "typescript" ? "typescript" : language)
                )}
                <div className="flex gap-2 mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigator.clipboard.writeText(msg.response || '')}
                    className="h-7 px-2 text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default MessageHistory; 