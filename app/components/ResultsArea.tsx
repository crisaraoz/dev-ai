import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Copy, Download, Share2, History, Maximize2, Minimize2, Loader2 } from "lucide-react";
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
  isLoading?: boolean;
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
  isLoading = false
}) => {
  const LoadingIndicator = () => (
    <div className="flex flex-col items-center justify-center h-full py-8">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Processing your request...</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="refactor">Refactor</TabsTrigger>
              <TabsTrigger value="test">Generate Tests</TabsTrigger>
              <TabsTrigger value="explain">Explain</TabsTrigger>
            </TabsList>
            
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

          <div className="relative tabs-container">
            <TabsContent value="refactor" className="w-full">
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
            </TabsContent>

            <TabsContent value="test" className="w-full">
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
            </TabsContent>

            <TabsContent value="explain" className="w-full">
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
            </TabsContent>
          </div>
        </Tabs>
      </div>

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