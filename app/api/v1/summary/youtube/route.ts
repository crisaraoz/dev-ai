import { NextRequest, NextResponse } from 'next/server';

// Función para extraer el ID del video de YouTube de una URL
function extractYoutubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  
  return match && match[2].length === 11 ? match[2] : null;
}

// Función para obtener la transcripción del video usando el endpoint existente
async function getVideoTranscript(videoId: string): Promise<string> {
  try {
    // Usar el endpoint de transcripción existente
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/v1/summary/youtube`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: `https://www.youtube.com/watch?v=${videoId}` }),
    });

    if (!response.ok) {
      throw new Error(`Error al obtener la transcripción: ${response.statusText}`);
    }

    const data = await response.json();
    return data.transcript || '';
  } catch (error) {
    console.error('Error obteniendo transcripción:', error);
    throw error;
  }
}

// Función para conectar con una IA y generar un resumen
async function generateSummaryWithAI(transcript: string): Promise<string> {
  // Aquí conectarías con tu servicio de IA preferido (OpenAI, Google Gemini, etc.)
  // Por ejemplo, con OpenAI sería algo así:
  /*
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "Eres un asistente que resume vídeos de YouTube. Genera un resumen conciso pero informativo."
      },
      {
        role: "user",
        content: `Genera un resumen de esta transcripción de video: ${transcript}`
      }
    ],
    max_tokens: 500,
  });

  return response.choices[0].message.content || '';
  */

  // Por ahora, generamos un resumen simulado basado en el tamaño de la transcripción
  const words = transcript.split(' ');
  if (words.length <= 10) {
    return "El video es demasiado corto para generar un resumen significativo.";
  }

  // En una implementación real, aquí usarías la API de la IA
  return `Este video trata sobre un tema interesante que ha sido resumido por la IA.
  
La transcripción tiene aproximadamente ${words.length} palabras.

Puntos principales:
- El contenido aborda temas relevantes mencionados en el video
- Se destacan las ideas principales y conceptos clave
- Se incluyen conclusiones y recomendaciones finales

Este es un resumen simulado. En una implementación real, este resumen sería generado por un modelo de IA como GPT-4 o Google Gemini basado en la transcripción completa.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'Se requiere una URL de YouTube' }, { status: 400 });
    }

    // Extraer el ID del video de YouTube
    const videoId = extractYoutubeVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: 'URL de YouTube no válida' }, { status: 400 });
    }

    // Obtener la transcripción del video usando el endpoint existente
    const transcript = await getVideoTranscript(videoId);

    // Generar un resumen de la transcripción usando IA
    const summary = await generateSummaryWithAI(transcript);

    return NextResponse.json({ 
      success: true, 
      videoId,
      summary,
      // Metadatos adicionales que podrían ser útiles
      metadata: {
        url,
        timestamp: new Date().toISOString(),
        transcriptLength: transcript.length,
      }
    });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    return NextResponse.json({ 
      error: 'Error al procesar la solicitud',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
} 