import React from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { renderCodeResult } from "./utils";

interface ResultsAreaProps {
  result: string;
  isLoading: boolean;
  showTimestamps?: boolean;
  onTimeClick?: (timeString: string) => void;
}

const ResultsArea: React.FC<ResultsAreaProps> = ({
  result,
  isLoading,
  showTimestamps = false,
  onTimeClick
}) => {
  const LoadingIndicator = () => (
    <div className="flex flex-col items-center justify-center h-full py-8">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Processing your request...</p>
    </div>
  );

  return (
    <Card className="p-4 h-full">
      <ScrollArea className="h-[400px]">
        {isLoading ? (
          <LoadingIndicator />
        ) : result ? (
          <div className="space-y-0.5 text-sm">
            {result.split('\n').map((line, i) => {
              const hasTimestamp = showTimestamps && line.match(/^\d{2}:\d{2}/);
              
              return (
                <div 
                  key={i} 
                  className={`${hasTimestamp ? 'cursor-pointer hover:bg-accent/30' : ''} py-1 px-1 rounded transition-colors`}
                  onClick={() => hasTimestamp && onTimeClick && onTimeClick(line)}
                >
                  {line}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-muted-foreground text-center h-full flex items-center justify-center">
            {/* Result will appear here... */}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};

export default ResultsArea; 