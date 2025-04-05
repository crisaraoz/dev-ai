"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DocScrapeResponse {
  status: string;
  url: string;
  sections_analyzed: number;
  total_pages: number;
  completion_percentage: number;
  message?: string;
}

interface DocQueryResponse {
  answer: string;
  sources: string[];
  confidence: number;
}

// Función auxiliar para detectar el lenguaje en los bloques de código
function detectLanguage(code: string): string {
  // Comprobar si hay un indicador de lenguaje en la primera línea
  const firstLine = code.trim().split('\n')[0];
  if (firstLine.includes('typescript') || firstLine.includes('tsx')) return 'typescript';
  if (firstLine.includes('javascript') || firstLine.includes('jsx')) return 'javascript';
  if (firstLine.includes('html')) return 'html';
  if (firstLine.includes('css')) return 'css';
  if (firstLine.includes('json')) return 'json';
  if (firstLine.includes('python')) return 'python';
  
  // Detección basada en contenido
  if (code.includes('import React') || code.includes('const [') || code.includes('=>')) return 'javascript';
  if (code.includes('<html>') || code.includes('</div>')) return 'html';
  if (code.includes('const ') && code.includes(':') && code.includes('=>')) return 'typescript';
  if (code.includes('def ') && code.includes(':') && !code.includes(';')) return 'python';
  if (code.includes('{') && code.includes('}') && !code.includes('<') && !code.includes('>')) return 'json';
  
  // Por defecto
  return 'plaintext';
}

// Función para normalizar el texto y evitar problemas de espaciado
function normalizeText(text: string): string {
  // Evitar espacios innecesarios entre líneas
  return text
    .replace(/\n{3,}/g, '\n\n') // Reemplazar múltiples saltos de línea con solo dos
    .replace(/\s+$/gm, '') // Eliminar espacios al final de cada línea
    .trim();
}

export default function DocumentAnalyzer() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [scrapeStatus, setScrapeStatus] = useState<DocScrapeResponse | null>(null);
  const [statusInterval, setStatusInterval] = useState<NodeJS.Timeout | null>(null);
  const [query, setQuery] = useState("");
  const [queryResponse, setQueryResponse] = useState<DocQueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState("es");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [serviceAvailable, setServiceAvailable] = useState<boolean | null>(null);
  const [isDocAnalyzerCollapsed, setIsDocAnalyzerCollapsed] = useState(false);
  const [maxPages, setMaxPages] = useState<number>(0);

  // Añadir un efecto para verificar que el componente se monta correctamente
  useEffect(() => {
    console.log("DocumentAnalyzer mounted");
    // Limpiar el error cuando se monta
    setError(null);
    
    // Verificar la disponibilidad del servicio
    const checkServiceAvailability = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8000";
        
        // Intentar verificar si el endpoint de docs/process está disponible usando OPTIONS
        // o si existe la documentación OpenAPI
        const response = await fetch(`${baseUrl}/openapi.json`, {
          method: "GET",
          headers: {
            "Accept": "application/json"
          }
        });
        
        // Si la respuesta es 200 OK o incluso 404 (el servicio está respondiendo pero el endpoint no existe)
        // consideramos que el servicio está disponible
        if (response.ok || response.status === 404) {
          console.log("Servicio backend disponible");
          setServiceAvailable(true);
          setError(null);
        } else if (response.status >= 500) {
          // Solo si hay un error de servidor (500+) consideramos que el servicio no está disponible
          console.error("Error en el servidor backend:", response.status);
          setServiceAvailable(false);
          setError("El servicio de backend parece estar teniendo problemas. Por favor, intenta de nuevo más tarde.");
        } else {
          // En caso de otros errores, asumimos que el backend está disponible pero algo más está fallando
          console.log("Backend responde pero con estado inusual:", response.status);
          setServiceAvailable(true);
          setError(null);
        }
      } catch (error) {
        console.error("Error al verificar disponibilidad del servicio:", error);
        // Incluso con un error de conexión, no mostraremos el mensaje de error
        // ya que el servicio de docs puede funcionar aunque el health check falle
        setServiceAvailable(true);
        setError(null);
      }
    };
    
    checkServiceAvailability();
  }, []);

  // Limpiar el intervalo cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (statusInterval) {
        clearInterval(statusInterval);
      }
    };
  }, [statusInterval]);

  // Iniciar el análisis de la documentación
  const handleAnalyzeDoc = async () => {
    if (!url.trim()) {
      setError("Por favor, introduce una URL válida");
      return;
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      setError("La URL debe comenzar con http:// o https://");
      return;
    }

    try {
      // Establecer estados de inmediato para evitar doble clic
      setLoading(true);
      setError(null);
      setIsAnalyzing(true);
      
      // Inicializar con valores por defecto
      setScrapeStatus({
        status: "in_progress",
        url: url,
        sections_analyzed: 0,
        total_pages: 0,
        completion_percentage: 0
      });

      console.log("Intentando analizar documentación:", url);
      // Iniciar el proceso de scraping en el backend
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8000";
      
      // Usar un timeout para asegurar que la UI se actualice antes de la llamada API
      setTimeout(async () => {
        try {
          const response = await fetch(`${baseUrl}/api/v1/docs/scrape`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url,
              language_code: language,
              analyze_subsections: true,
              max_depth: 3,  // Profundidad máxima para analizar la documentación
              max_pages: maxPages > 0 ? maxPages : null  // Número máximo de páginas (null = sin límite)
            }),
          });

          console.log("Respuesta del servidor:", response.status, response.statusText);
          
          if (!response.ok) {
            let errorMessage = `Error al analizar la documentación: ${response.status} ${response.statusText}`;
            try {
              const errorData = await response.json();
              if (errorData.detail) {
                errorMessage = errorData.detail;
              }
            } catch (e) {
              console.error("No se pudo parsear el error:", e);
            }
            throw new Error(errorMessage);
          }

          const data = await response.json();
          console.log("Datos recibidos:", data);
          
          // Actualizar el estado con la respuesta del backend
          setScrapeStatus(data);
          
          // Configurar un intervalo para verificar el estado del procesamiento
          if (data.status === "in_progress") {
            const interval = setInterval(async () => {
              try {
                const statusResponse = await fetch(`${baseUrl}/api/v1/docs/scrape-status?url=${encodeURIComponent(url)}`);
                if (statusResponse.ok) {
                  const statusData = await statusResponse.json();
                  console.log("Actualización de estado:", statusData);
                  setScrapeStatus(statusData);
                  
                  // Si el procesamiento se completó o falló, detener el intervalo
                  if (statusData.status === "completed" || statusData.status === "failed") {
                    clearInterval(interval);
                    setIsAnalyzing(false);
                  }
                } else {
                  console.error("Error al verificar estado:", statusResponse.status);
                  // No detenemos el intervalo en caso de error para seguir intentando
                }
              } catch (e) {
                console.error("Error al verificar estado:", e);
              }
            }, 2000); // Verificar cada 2 segundos
            
            // Guardar referencia al intervalo
            setStatusInterval(interval);
          } else {
            // Si el proceso ya está completo (modo síncrono)
            setIsAnalyzing(false);
          }
        } catch (error) {
          console.error("Error:", error);
          setError(error instanceof Error ? error.message : "Error desconocido");
          setIsAnalyzing(false);
        } finally {
          setLoading(false);
        }
      }, 0);
      
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "Error desconocido");
      setIsAnalyzing(false);
      setLoading(false);
    }
  };

  // Realizar una consulta a la documentación analizada
  const handleQuery = async () => {
    if (!query.trim() || !url.trim()) {
      setError("Por favor, introduce una consulta y asegúrate de que ya se ha analizado una documentación");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("Realizando consulta:", query, "para URL:", url);
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8000";
      
      const requestData = {
        url,
        query,
        language_code: language,
        include_sources: true
      };
      
      console.log("Enviando datos:", JSON.stringify(requestData));
      
      const response = await fetch(`${baseUrl}/api/v1/docs/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("Respuesta de consulta:", response.status, response.statusText);
      
      if (!response.ok) {
        let errorMessage = `Error al realizar la consulta: ${response.status} ${response.statusText}`;
        try {
          const errorText = await response.text();
          console.error("Respuesta de error completa:", errorText);
          
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.detail) {
              errorMessage = errorData.detail;
            }
          } catch (e) {
            console.error("Error al parsear respuesta JSON:", e);
            errorMessage = `${errorMessage}. Respuesta del servidor: ${errorText.substring(0, 100)}...`;
          }
        } catch (e) {
          console.error("No se pudo leer el texto de error:", e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Datos de respuesta:", data);
      setQueryResponse(data);
    } catch (error) {
      console.error("Error completo:", error);
      setError(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Renderizar bloques de código con formato
  const renderCodeBlock = (code: string, partIdx: number) => {
    const codeContent = code.slice(3, -3).trim();
    const language = detectLanguage(codeContent);
    
    // Separar la primera línea si contiene el identificador del lenguaje
    let displayCode = codeContent;
    if (displayCode.match(/^(typescript|javascript|html|css|json|python|jsx|tsx)(\s|$)/i)) {
      displayCode = displayCode.substring(displayCode.indexOf('\n') + 1).trim();
    }
    
    return (
      <div key={partIdx} className="my-4 rounded-md overflow-hidden shadow-sm">
        <div className="border-t-2 border-blue-500 dark:border-blue-400"></div>
        <pre className="bg-slate-900 text-slate-50 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap overflow-x-auto">
          <code>{displayCode}</code>
        </pre>
      </div>
    );
  };
  
  // Renderizar código en línea
  const renderInlineCode = (code: string, partIdx: number) => {
    return (
      <code key={partIdx} className="bg-gray-200 dark:bg-gray-800 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded font-mono text-sm">
        {code.slice(1, -1)}
      </code>
    );
  };
  
  // Renderizar un párrafo con formato (negrita, código)
  const renderFormattedText = (text: string) => {
    return text.split(/(\*\*.*?\*\*|`.*?`)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="bg-gray-200 dark:bg-gray-800 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded font-mono text-sm">{part.slice(1, -1)}</code>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800 rounded-md overflow-hidden shadow-md">
        <div 
          className="flex items-center justify-between px-5 py-3 cursor-pointer"
          onClick={() => setIsDocAnalyzerCollapsed(!isDocAnalyzerCollapsed)}
        >
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-black dark:text-white">
              Analyze Complete Web Documentation
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {!isDocAnalyzerCollapsed && scrapeStatus && scrapeStatus.status === "completed" && (
              <span className="text-xs text-white bg-green-600 px-2 py-0.5 rounded">
                Ready
              </span>
            )}
            <button className="text-black dark:text-white hover:text-blue-100 dark:hover:text-blue-400 transition-colors focus:outline-none">
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className={`transform transition-transform ${isDocAnalyzerCollapsed ? 'rotate-180' : ''}`}
              >
                <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {!isDocAnalyzerCollapsed && (
        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
          <CardContent className="pt-6 space-y-4">
            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                Enter the URL of any web documentation to analyze it completely. The AI will read all the documentation to answer your questions.
                {/* <span className="block mt-1 italic text-xs">Note: Currently, the analysis is primarily limited to the main page. We are working to expand coverage to all subsections.</span> */}
              </AlertDescription>
            </Alert>
            
            {/* {!serviceAvailable && (
              <Alert className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-900">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                  The documentation analysis feature is under development. The necessary backend service is not available at this time. Please try the other features such as code analysis or YouTube.
                </AlertDescription>
              </Alert>
            )} */}
            
            <div className="space-y-2">
              <Label htmlFor="url" className="text-gray-900 dark:text-gray-100">URL of the Documentation</Label>
              <Input
                id="url"
                placeholder="Ej: https://documentation-example.com/docs"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-transparent border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                You can enter any documentation URL (React, Vue, Python, Java, etc.)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language" className="text-gray-900 dark:text-gray-100">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="bg-transparent border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPages" className="text-gray-900 dark:text-gray-100">Maximum Pages</Label>
              <Input
                id="maxPages"
                type="number"
                placeholder="0"
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                min={0}
                className="bg-transparent border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium">0 = No limit</span> (Analyze all available pages)
              </p>
            </div>

            <Button
              onClick={handleAnalyzeDoc}
              disabled={loading || !url || isAnalyzing}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing documentation...
                </>
              ) : (
                "Analyze Complete Documentation"
              )}
            </Button>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {scrapeStatus && (
              <div className="space-y-2 mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Analysis Status</h4>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Status:</span> {scrapeStatus.status === "completed" ? "Completed" : 
                              scrapeStatus.status === "in_progress" ? "In progress" : 
                              scrapeStatus.status === "failed" ? "Failed" : scrapeStatus.status}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Sections analyzed:</span> {scrapeStatus.sections_analyzed || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Total pages:</span> {scrapeStatus.total_pages || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Progress:</span> {scrapeStatus.completion_percentage !== undefined ? scrapeStatus.completion_percentage.toFixed(1) : '0.0'}%
                  </p>
                  {scrapeStatus.message && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Message:</span> {scrapeStatus.message}
                    </p>
                  )}
                  
                  {/* Barra de progreso fija al 100% cuando está completado */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                    <div 
                      className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" 
                      style={{ 
                        width: scrapeStatus.status === "completed" 
                          ? "100%" 
                          : `${scrapeStatus.completion_percentage !== undefined ? Math.max(1, scrapeStatus.completion_percentage) : 1}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {scrapeStatus && scrapeStatus.status === "completed" && (
        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="text-green-500 h-5 w-5" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Documentation analyzed correctly
              </h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="query" className="text-gray-900 dark:text-gray-100">Ask a question about the documentation</Label>
              <Textarea
                id="query"
                placeholder="What would you like to know about this documentation? You can ask about any specific section or topic."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
                className={`bg-transparent border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 min-h-[100px] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                You can ask specific questions like if you have read all the documentation. The system has analyzed the complete content.
              </p>
              <Button
                onClick={handleQuery}
                disabled={loading || !query}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Consulting...
                  </>
                ) : (
                  "Do a Question"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {queryResponse && (
        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Answer</h3>
            <div className="space-y-4">
              <div className="text-gray-800 dark:text-gray-200 p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
                {/* Procesamos el texto detectando bloques de código y formato Markdown */}
                {normalizeText(queryResponse.answer).split(/(`{3,}[\s\S]*?`{3,}|`[^`]+`)/g).map((part, partIdx) => {
                  // Bloques de código (multi-línea)
                  if (part.startsWith("```") && part.endsWith("```")) {
                    return renderCodeBlock(part, partIdx);
                  } 
                  // Código en línea (entre comillas simples)
                  else if (part.startsWith("`") && part.endsWith("`")) {
                    return renderInlineCode(part, partIdx);
                  } 
                  // Texto normal
                  else if (part.trim()) {
                    // Procesar texto normal, manteniendo el flujo natural
                    const paragraphs = part.split('\n').filter(p => p.trim() !== '');
                    
                    return (
                      <div key={partIdx} className="space-y-2">
                        {paragraphs.map((paragraph, idx) => {
                          // Procesar listas numeradas (1. Item)
                          if (/^\d+\.\s/.test(paragraph)) {
                            return (
                              <div key={`${partIdx}-${idx}`} className="ml-4 my-2">
                                <div className="flex items-start">
                                  <span className="font-bold mr-2">{paragraph.match(/^\d+\./)?.[0] || ''}</span>
                                  <span>
                                    {renderFormattedText(paragraph.replace(/^\d+\.\s/, ''))}
                                  </span>
                                </div>
                              </div>
                            );
                          }
                          
                          // Procesar contenido normal
                          return (
                            <p key={`${partIdx}-${idx}`} className="text-gray-800 dark:text-gray-200">{paragraph}</p>
                          );
                        })}
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}