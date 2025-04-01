import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Copy, Download, Share2, History, Maximize2, Minimize2, Loader2, PauseCircle, Play, PlayCircle, Scroll, ScrollText } from "lucide-react";
import { renderCodeResult } from "./utils";
import ExplanationBlock from "./ExplanationBlock";
import { TEST_FRAMEWORKS } from "./constants";

interface ResultsAreaProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  result: string;
  language: string;
  testFramework: string;
  setTestFramework: (value: string) => void;
  testType: string;
  setTestType: (value: string) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  handleCopy: () => void;
  handleDownload: () => void;
  isLoading: boolean;
  isYouTubeMode: boolean;
  onTimeClick?: (timeString: string) => void;
  autoScroll?: boolean;
  setAutoScroll?: (value: boolean) => void;
  className?: string;
}

const ResultsArea: React.FC<ResultsAreaProps> = ({
  activeTab,
  setActiveTab,
  result,
  language,
  testFramework,
  setTestFramework,
  testType,
  setTestType,
  isFullscreen,
  toggleFullscreen,
  handleCopy,
  handleDownload,
  isLoading,
  isYouTubeMode,
  onTimeClick,
  autoScroll = true,
  setAutoScroll,
  className = ""
}) => {
  const LoadingIndicator = () => (
    <div className="flex flex-col items-center justify-center h-full py-8">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Processing your request...</p>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "refactor":
        return (
          <Card className={`p-4 ${isFullscreen ? 'h-[80vh]' : ''}`}>
            <ScrollArea className={`${isFullscreen ? 'h-[75vh]' : 'h-[400px]'}`}>
              {isLoading ? (
                <LoadingIndicator />
              ) : result ? (
                renderCodeResult(result, language === "typescript" ? "typescript" : language)
              ) : (
                <div className="text-muted-foreground">{"// Result will appear here..."}</div>
              )}
            </ScrollArea>
          </Card>
        );
      case "test":
        return (
          <Card className={`p-4 ${isFullscreen ? 'h-[80vh]' : ''}`}>
            <div className="space-y-4 mb-4">
              <div>
                <Label>Test Framework</Label>
                <Select value={testFramework} onValueChange={setTestFramework} disabled={isLoading}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Framework" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEST_FRAMEWORKS[language as keyof typeof TEST_FRAMEWORKS]?.map((framework) => (
                      <SelectItem key={framework} value={framework}>
                        {framework}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Test Type</Label>
                <RadioGroup value={testType} onValueChange={setTestType} className="flex gap-4" disabled={isLoading}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unit" id="unit" />
                    <Label htmlFor="unit">Unit Tests</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="integration" id="integration" />
                    <Label htmlFor="integration">Integration Tests</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="e2e" id="e2e" />
                    <Label htmlFor="e2e">E2E Tests</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <ScrollArea className={`${isFullscreen ? 'h-[65vh]' : 'h-[300px]'}`}>
              {isLoading ? (
                <LoadingIndicator />
              ) : result ? (
                renderCodeResult(result, language === "typescript" ? "typescript" : language)
              ) : (
                <div className="text-muted-foreground">{"// The tests will appear here after processing the code..."}</div>
              )}
            </ScrollArea>
          </Card>
        );
      case "explain":
        return (
          <Card className={`p-4 ${isFullscreen ? 'h-[80vh]' : ''}`}>
            <ScrollArea className={`${isFullscreen ? 'h-[75vh]' : 'h-[400px]'}`}>
              {isLoading ? (
                <LoadingIndicator />
              ) : result ? (
                <div className="chatgpt-message">
                  <ExplanationBlock>
                    {result.includes('Explaining') 
                      ? result.split('Explaining')[1].split(':\n\n')[1] 
                      : result
                    }
                  </ExplanationBlock>
                </div>
              ) : (
                <div className="text-muted-foreground">{"// The explanation will appear here after processing the code..."}</div>
              )}
            </ScrollArea>
          </Card>
        );
      case "transcript":
        return (
          <Card className={`w-full flex flex-col h-full overflow-hidden ${className}`}>
            <CardHeader className="flex pb-0">
              <div className="flex justify-between items-center w-full">
                <CardTitle className="text-xl tracking-tight">
                  Transcripción
                </CardTitle>
                
                {setAutoScroll && (
                  <Button
                    variant={autoScroll ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      console.log(`Auto-scroll cambiado a: ${!autoScroll}`);
                      setAutoScroll(!autoScroll);
                    }}
                    className="flex items-center gap-1 text-xs font-bold"
                    title={autoScroll ? "Desactivar desplazamiento automático" : "Activar desplazamiento automático"}
                  >
                    {autoScroll ? (
                      <>
                        <ScrollText className="h-4 w-4 mr-1 animate-pulse" />
                        Auto-scroll <span className="text-green-400 ml-1">ON</span>
                      </>
                    ) : (
                      <>
                        <Scroll className="h-4 w-4 mr-1" />
                        Auto-scroll <span className="text-red-400 ml-1">OFF</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-[400px] p-4 transcript-scroll-area">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    <p className="text-muted-foreground">Obteniendo transcripción...</p>
                  </div>
                ) : result ? (
                  <div className="space-y-1 font-mono text-sm">
                    {result.split('\n').map((line, i) => {
                      // Verificar si la línea tiene un formato de timestamp (MM:SS)
                      const hasTimestamp = line.match(/^\d{2}:\d{2}/);
                      
                      return (
                        <div 
                          key={i} 
                          className={`${hasTimestamp ? 'flex items-start' : ''} py-0.5 px-1 rounded hover:bg-accent/30 transition-colors`}
                          id={`transcript-line-${i}`}
                        >
                          {hasTimestamp ? (
                            <>
                              <span 
                                className="inline-block mr-2 text-primary-foreground bg-primary px-1 rounded min-w-[40px] text-center font-semibold cursor-pointer hover:bg-primary-foreground hover:text-primary transition-colors"
                                onClick={() => onTimeClick && onTimeClick(line.substring(0, 5))}
                                title="Ir a este momento del video"
                              >
                                {line.substring(0, 5)}
                              </span>
                              <span className="flex-grow">{line.substring(6)}</span>
                            </>
                          ) : (
                            line
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-muted-foreground">{"// La transcripción aparecerá aquí..."}</div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  // Estilo CSS para la línea activa
  React.useEffect(() => {
    // Agregar estilos CSS para la línea activa
    const style = document.createElement('style');
    style.innerHTML = `
      .transcript-line-active {
        background-color: rgba(255, 165, 0, 0.9) !important;
        border-left: 6px solid crimson !important;
        font-weight: 700;
        transition: all 0.3s ease;
        padding-left: 0.75rem !important;
        color: black !important;
        position: relative;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        border-radius: 4px;
        transform: scale(1.02);
        z-index: 10;
        margin: 4px 0;
        outline: 2px solid crimson;
      }
      
      .transcript-line-active::before {
        content: '►';
        position: absolute;
        left: -16px;
        color: crimson;
        animation: pulse 1s infinite;
        font-size: 14px;
      }
      
      .dark .transcript-line-active {
        background-color: #ff8c00 !important;
        color: black !important;
        border-left-color: #ff3333 !important;
        outline-color: #ff3333;
      }
      
      .dark .transcript-line-active::before {
        color: #ff3333;
      }
      
      @keyframes pulse {
        0% { opacity: 0.7; }
        50% { opacity: 1; }
        100% { opacity: 0.7; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 w-full">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem 
                value="refactor" 
                disabled={isYouTubeMode}
                className={isYouTubeMode ? "opacity-50 cursor-not-allowed" : ""}
              >
                Refactor
              </SelectItem>
              <SelectItem 
                value="test" 
                disabled={isYouTubeMode}
                className={isYouTubeMode ? "opacity-50 cursor-not-allowed" : ""}
              >
                Generate Tests
              </SelectItem>
              <SelectItem 
                value="explain" 
                disabled={isYouTubeMode}
                className={isYouTubeMode ? "opacity-50 cursor-not-allowed" : ""}
              >
                Explain
              </SelectItem>
              <SelectItem value="transcript">Transcript</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="ml-2"
            title={isFullscreen ? "Restaurar tamaño" : "Pantalla completa"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {renderContent()}

      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="icon" onClick={handleCopy} disabled={isLoading || !result}>
          <Copy className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleDownload} disabled={isLoading || !result}>
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" disabled={isLoading || !result}>
          <Share2 className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" disabled={isLoading || !result}>
          <History className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ResultsArea; 