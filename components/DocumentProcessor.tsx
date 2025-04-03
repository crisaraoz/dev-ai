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

// Función para formatear texto con markdown
const formatMarkdownText = (text: string): string => {
  if (!text) return '';
  
  // Eliminar caracteres de formato markdown que no deberían mostrarse como texto literal
  return text
    .replace(/\*\*/g, '') // Eliminar marcadores de negrita
    .replace(/\#\#\#\s\d+\.\s/g, '') // Eliminar marcadores de encabezado con números
    .replace(/\#\#\#/g, '') // Eliminar marcadores de encabezado
};

export default function DocumentProcessor() {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("es");
  const [loading, setLoading] = useState(false);
  const [processedDoc, setProcessedDoc] = useState<ProcessResponse | null>(null);
  const [query, setQuery] = useState("");
  const [queryResponse, setQueryResponse] = useState<QueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://localhost:8000/api/v1/docs/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          language_code: language,
          max_length: 3000, // Aumentar la longitud máxima para obtener resúmenes más detallados
          min_concepts: 10, // Solicitar un mínimo de 10 conceptos clave
          detail_level: "high" // Solicitar un nivel alto de detalle
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Error al procesar la documentación");
      }

      const data = await response.json();
      
      // Asegurarse de que key_concepts sea siempre un array
      if (!Array.isArray(data.key_concepts) || data.key_concepts.length === 0) {
        // Si no hay conceptos clave, crear un array con un mensaje por defecto
        data.key_concepts = ["No se encontraron conceptos clave en esta documentación."];
      } else if (data.key_concepts.length < 3) {
        // Si hay muy pocos conceptos, solicitar más detalle con otra consulta
        try {
          const enhancedResponse = await fetch("http://localhost:8000/api/v1/docs/enhance", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              doc_id: data.url,
              request_type: "key_concepts",
              count: 10,
              language_code: language
            }),
          });

          if (enhancedResponse.ok) {
            const enhancedData = await enhancedResponse.json();
            if (Array.isArray(enhancedData.key_concepts) && enhancedData.key_concepts.length > 0) {
              data.key_concepts = enhancedData.key_concepts;
            }
          }
        } catch (enhanceError) {
          console.error("Error al mejorar conceptos clave:", enhanceError);
        }
      }
      
      setProcessedDoc(data);
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleQuery = async () => {
    if (!processedDoc) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://localhost:8000/api/v1/docs/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doc_id: processedDoc.url,
          query,
          language_code: language,
          detail_level: "high" // Solicitar respuestas más detalladas
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Error al realizar la consulta");
      }

      const data = await response.json();
      setQueryResponse(data);
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Renderizar el contenido formateado
  const renderFormattedContent = (content: string) => {
    if (!content) return null;
    
    // Dividir el contenido en párrafos para una mejor presentación
    const paragraphs = formatMarkdownText(content).split('\n').filter(p => p.trim() !== '');
    
    return (
      <div className="space-y-2">
        {paragraphs.map((paragraph, idx) => (
          <p key={idx} className="text-sm text-gray-600 dark:text-gray-300">
            {paragraph}
          </p>
        ))}
      </div>
    );
  };

  // Procesar los conceptos clave con formato apropiado
  const renderKeyConceptsList = (conceptList: string[]) => {
    if (!conceptList || conceptList.length === 0) {
      return (
        <p className="text-sm text-gray-600 dark:text-gray-300 italic">
          No se encontraron conceptos clave.
        </p>
      );
    }

    return (
      <ul className="list-disc list-inside space-y-2">
        {conceptList.map((concept, index) => {
          const formattedConcept = formatMarkdownText(concept);
          
          // Si el concepto comienza con una frase específica, darle formato especial
          const isHeading = formattedConcept.startsWith("Conceptos clave") || 
                          formattedConcept.startsWith("Puntos clave") ||
                          formattedConcept.startsWith("Principales");
          
          if (isHeading) {
            return (
              <h5 key={index} className="font-medium text-gray-700 dark:text-gray-200 mt-2">
                {formattedConcept}
              </h5>
            );
          }
          
          return (
            <li key={index} className="text-sm text-gray-600 dark:text-gray-300">
              {formattedConcept}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url" className="text-gray-900 dark:text-gray-100">Documentation URL</Label>
            <Input
              id="url"
              placeholder="https://example.com/docs"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-transparent border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language" className="text-gray-900 dark:text-gray-100">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="bg-transparent border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                <SelectValue placeholder="Select language" />
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
          
          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {processedDoc && (
        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{processedDoc.title}</h3>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Resume</h4>
              {renderFormattedContent(processedDoc.summary)}
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Key Concepts</h4>
              {renderKeyConceptsList(processedDoc.key_concepts)}
            </div>

            <div className="space-y-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Label htmlFor="query" className="text-gray-900 dark:text-gray-100">Make a question to the documentation</Label>
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
                  "Make a question"
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
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Answer</h4>
              {renderFormattedContent(queryResponse.answer)}
            </div>
            {queryResponse.relevant_sections.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Relevant sections</h4>
                <ul className="list-disc list-inside space-y-1">
                  {queryResponse.relevant_sections.map((section, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-300">
                      {formatMarkdownText(section)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Confidence: {(queryResponse.confidence * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 