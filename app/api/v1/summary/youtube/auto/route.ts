import { NextRequest, NextResponse } from 'next/server';

// Función para extraer el ID del video de YouTube de una URL
function extractYoutubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  
  return match && match[2].length === 11 ? match[2] : null;
}

// Función para obtener la transcripción del video
async function getVideoTranscript(videoId: string): Promise<string> {
  try {
    // Usar el endpoint de transcripción existente
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/v1/transcription/youtube`, {
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

// Función para generar un resumen más detallado utilizando IA
async function generateDetailedSummaryWithAI(transcript: string): Promise<string> {
  // En una implementación real, conectarías con una API de IA y usarías un prompt que pida más detalle
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
        content: "Eres un asistente especializado en generar resúmenes detallados de videos. Tu tarea es crear un resumen completo que capture los puntos clave, conceptos importantes y contexto del video. El resumen debe ser informativo y extenso, manteniendo la esencia del contenido original."
      },
      {
        role: "user",
        content: `Por favor, genera un resumen detallado de esta transcripción de video: ${transcript}`
      }
    ],
    max_tokens: 800,
  });

  return response.choices[0].message.content || '';
  */

  // Simulación de un resumen más detallado
  const words = transcript.split(' ');
  if (words.length <= 10) {
    return "El video es demasiado corto para generar un resumen significativo.";
  }

  return `## Resumen Detallado del Video

Este video aborda temas importantes y presenta contenido valioso para la audiencia. A continuación se detalla un resumen completo que captura la esencia y los puntos clave del contenido.

### Contexto General
El video proporciona información detallada sobre el tema principal, estableciendo un marco de referencia claro para los espectadores. La transcripción contiene aproximadamente ${words.length} palabras, lo que indica un contenido sustancial.

### Puntos Principales
1. **Introducción al tema**: El video comienza presentando los conceptos fundamentales y estableciendo la importancia del tema tratado.
2. **Desarrollo de ideas clave**: A lo largo del contenido, se exploran diversas perspectivas y se analizan en profundidad los aspectos más relevantes.
3. **Ejemplos y casos prácticos**: Se incluyen casos de estudio y ejemplos concretos que ayudan a ilustrar los conceptos teóricos.
4. **Análisis de implicaciones**: El contenido examina las consecuencias y aplicaciones prácticas de los temas tratados.

### Conceptos Destacados
- Se abordan términos técnicos y conceptos especializados relacionados con el tema principal
- Se explican metodologías y enfoques relevantes para la comprensión del contenido
- Se presentan estadísticas y datos que respaldan los argumentos principales

### Conclusiones y Recomendaciones
El video concluye con un resumen de los puntos tratados y ofrece recomendaciones prácticas para los espectadores. Se destacan las aplicaciones potenciales y se sugieren próximos pasos para quienes estén interesados en profundizar en el tema.

Este resumen ha sido generado automáticamente basado en la transcripción completa del video. En una implementación real, el resumen sería mucho más específico al contenido exacto del video, generado por un modelo de IA avanzado como GPT-4 o Google Gemini.`;
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

    // Obtener la transcripción del video
    const transcription = await getVideoTranscript(videoId);

    // Generar un resumen detallado de la transcripción
    const summary = await generateDetailedSummaryWithAI(transcription);

    return NextResponse.json({ 
      success: true, 
      video_id: videoId,
      transcription,
      summary,
      video_url: url
    });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    return NextResponse.json({ 
      success: false,
      detail: error instanceof Error ? error.message : 'Error desconocido al procesar la solicitud'
    }, { status: 500 });
  }
} 