"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Code2, TestTube2, FileText, Sun, Moon, Download, Share2, History, Copy } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const PROGRAMMING_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
];

const TEST_FRAMEWORKS = {
  javascript: ["Jest", "Mocha", "Jasmine"],
  typescript: ["Jest", "Vitest", "AVA"],
  python: ["Pytest", "Unittest", "Nose"],
  java: ["JUnit", "TestNG", "Mockito"],
  csharp: ["NUnit", "xUnit", "MSTest"],
  cpp: ["Google Test", "Catch2", "Boost.Test"],
  go: ["Go Test", "Testify", "GoCheck"],
  rust: ["Built-in Tests", "Tokio Test", "Proptest"],
  php: ["PHPUnit", "Codeception", "Pest"],
  ruby: ["RSpec", "Minitest", "Test::Unit"],
};

const EXPLANATION_LEVELS = [
  {
    value: "junior",
    label: "Junior Developer",
    description: "Detailed explanations with basic concepts and examples"
  },
  {
    value: "mid",
    label: "Mid-Level Developer",
    description: "Balanced explanations focusing on implementation details and best practices"
  },
  {
    value: "senior",
    label: "Senior Developer",
    description: "Advanced concepts, architecture patterns, and performance considerations"
  }
];

export default function Home() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [testFramework, setTestFramework] = useState("Jest");
  const [testType, setTestType] = useState("unit");
  const [explanationLevel, setExplanationLevel] = useState("mid");
  const { setTheme, theme } = useTheme();

  const handleProcess = () => {
    const processType = document.querySelector('[role="tablist"]')?.querySelector('[data-state="active"]')?.getAttribute('data-value');
    let message = "";
    
    if (processType === "test") {
      message = `Generated ${testType} tests using ${testFramework} for ${language} code:\n\n`;
    } else if (processType === "explain") {
      message = `Explaining code at ${explanationLevel} level for ${language}:\n\n`;
    } else {
      message = `Processed ${language} code:\n\n`;
    }
    
    setResult(message + "// Result will appear here...");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "result.txt";
    a.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Code2 className="h-6 w-6" />
            AI Dev Tools
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAMMING_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Paste your code here..."
              className="min-h-[400px] font-mono"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <div className="flex justify-end">
              <Button onClick={handleProcess}>Process</Button>
            </div>
          </div>

          <div className="space-y-4">
            <Tabs defaultValue="refactor">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="refactor">Refactor</TabsTrigger>
                <TabsTrigger value="test">Generate Tests</TabsTrigger>
                <TabsTrigger value="explain">Explain</TabsTrigger>
              </TabsList>

              <TabsContent value="refactor">
                <Card className="p-4">
                  <ScrollArea className="h-[400px]">
                    <pre className="font-mono whitespace-pre-wrap">{result}</pre>
                  </ScrollArea>
                </Card>
              </TabsContent>

              <TabsContent value="test">
                <Card className="p-4">
                  <div className="space-y-4 mb-4">
                    <div>
                      <Label>Test Framework</Label>
                      <Select value={testFramework} onValueChange={setTestFramework}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select Framework" />
                        </SelectTrigger>
                        <SelectContent>
                          {TEST_FRAMEWORKS[language as keyof typeof TEST_FRAMEWORKS].map((framework) => (
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
                  <ScrollArea className="h-[300px]">
                    <pre className="font-mono whitespace-pre-wrap">{result}</pre>
                  </ScrollArea>
                </Card>
              </TabsContent>

              <TabsContent value="explain">
                <Card className="p-4">
                  <div className="space-y-4 mb-4">
                    <div>
                      <Label>Experience Level</Label>
                      <RadioGroup value={explanationLevel} onValueChange={setExplanationLevel} className="space-y-2 mt-2">
                        {EXPLANATION_LEVELS.map((level) => (
                          <div key={level.value} className="flex items-start space-x-2">
                            <RadioGroupItem value={level.value} id={level.value} className="mt-1" />
                            <div>
                              <Label htmlFor={level.value} className="font-medium">{level.label}</Label>
                              <p className="text-sm text-muted-foreground">{level.description}</p>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                  <ScrollArea className="h-[300px]">
                    <pre className="font-mono whitespace-pre-wrap">{result}</pre>
                  </ScrollArea>
                </Card>
              </TabsContent>
            </Tabs>

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
        </div>
      </main>
    </div>
  );
}