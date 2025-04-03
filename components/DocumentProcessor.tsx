"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface ProcessResponse {
  url: string;
  title: string;
  summary: string;
  key_concepts: string[];
  processed_at: string;
}

interface QueryResponse {
  answer: string;
  relevant_sections: string[];
  confidence: number;
}

export default function DocumentProcessor() {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("es");
  const [loading, setLoading] = useState(false);
  const [processedDoc, setProcessedDoc] = useState<ProcessResponse | null>(null);
  const [query, setQuery] = useState("");
  const [queryResponse, setQueryResponse] = useState<QueryResponse | null>(null);

  const handleProcess = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/v1/docs/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          language_code: language,
          max_length: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al procesar la documentación");
      }

      const data = await response.json();
      setProcessedDoc(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuery = async () => {
    if (!processedDoc) return;

    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/v1/docs/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doc_id: processedDoc.url,
          query,
          language_code: language,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al realizar la consulta");
      }

      const data = await response.json();
      setQueryResponse(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url" className="text-gray-900 dark:text-gray-100">Documentation URL</Label>
            <Input
              id="url"
              placeholder="https://ejemplo.com/docs"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-transparent border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language" className="text-gray-900 dark:text-gray-100">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="bg-transparent border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleProcess}
            disabled={loading || !url}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Process Documentation"
            )}
          </Button>
        </CardContent>
      </Card>

      {processedDoc && (
        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{processedDoc.title}</h3>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Resume</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {processedDoc.summary}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Key Concepts</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                {processedDoc.key_concepts.map((concept, index) => (
                  <li key={index}>{concept}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="query" className="text-gray-900 dark:text-gray-100">Realizar una consulta</Label>
              <Input
                id="query"
                placeholder="What would you like to know about this documentation?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
              <Button
                onClick={handleQuery}
                disabled={loading || !query}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Querying...
                  </>
                ) : (
                  "Perform Query"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {queryResponse && (
        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Respuesta</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {queryResponse.answer}
              </p>
            </div>
            {queryResponse.relevant_sections.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Relevant Sections</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                  {queryResponse.relevant_sections.map((section, index) => (
                    <li key={index}>{section}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Confianza: {(queryResponse.confidence * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 