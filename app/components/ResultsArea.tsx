import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Copy, Download, Share2, History, Maximize2, Minimize2 } from "lucide-react";
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
  handleDownload
}) => {
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

          <TabsContent value="refactor">
            <Card className={`p-4 ${isFullscreen ? 'h-[80vh]' : ''}`}>
              <ScrollArea className={`${isFullscreen ? 'h-[75vh]' : 'h-[400px]'}`}>
                {result ? renderCodeResult(result, language === "typescript" ? "typescript" : language)
                  : <div className="text-muted-foreground">{"// Result will appear here..."}</div>
                }
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="test">
            <Card className={`p-4 ${isFullscreen ? 'h-[80vh]' : ''}`}>
              <div className="space-y-4 mb-4">
                <div>
                  <Label>Test Framework</Label>
                  <Select value={testFramework} onValueChange={setTestFramework}>
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
                  <RadioGroup value={testType} onValueChange={setTestType} className="flex gap-4">
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
                {result ? renderCodeResult(result, language === "typescript" ? "typescript" : language)
                  : <div className="text-muted-foreground">{"// Los tests aparecerán aquí después de procesar el código..."}</div>
                }
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="explain">
            <Card className={`p-4 ${isFullscreen ? 'h-[80vh]' : ''}`}>
              <ScrollArea className={`${isFullscreen ? 'h-[75vh]' : 'h-[400px]'}`}>
                {result ? (
                  <div className="chatgpt-message">
                    <ExplanationBlock>
                      {result.includes('Explaining') 
                        ? result.split('Explaining')[1].split(':\n\n')[1] 
                        : result
                      }
                    </ExplanationBlock>
                  </div>
                ) : (
                  <div className="text-muted-foreground">{"// La explicación aparecerá aquí después de procesar el código..."}</div>
                )}
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="icon" onClick={handleCopy}>
          <Copy className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleDownload}>
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon">
          <History className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ResultsArea; 