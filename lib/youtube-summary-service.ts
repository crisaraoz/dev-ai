/**
 * Servicio para interactuar con la API de resumir videos de YouTube
 */

/**
 * Respuesta de la API de resumen de YouTube
 */
export interface YouTubeSummaryResponse {
  success: boolean;
  videoId: string;
  summary: string;
  metadata?: {
    url: string;
    timestamp: string;
    transcriptLength: number;
  };
  error?: string;
}

/**
 * Respuesta combinada que incluye tanto la transcripción como el resumen
 */
export interface YouTubeTranscriptionAndSummaryResponse {
  success: boolean;
  videoId: string;
  transcription: string;
  summary: string;
  video_url: string;
  error?: string;
}

/**
 * Envía una URL de YouTube a la API para obtener un resumen del video
 * @param url URL del video de YouTube a resumir
 * @returns Objeto con el resumen del video y metadatos
 */
export async function getYouTubeSummary(url: string): Promise<YouTubeSummaryResponse> {
  try {
    const response = await fetch('http://localhost:8000/api/v1/summary/youtube', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al procesar la URL de YouTube');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        videoId: '',
        summary: '',
        error: error.message,
      };
    }
    
    return {
      success: false,
      videoId: '',
      summary: '',
      error: 'Error desconocido al procesar la solicitud',
    };
  }
}

/**
 * Envía una URL de YouTube a la API para obtener tanto la transcripción como el resumen en una sola petición
 * @param url URL del video de YouTube a transcribir y resumir
 * @returns Objeto con la transcripción, el resumen y metadatos del video
 */
export async function getYouTubeTranscriptionAndSummary(url: string): Promise<YouTubeTranscriptionAndSummaryResponse> {
  try {
    const response = await fetch('http://localhost:8000/api/v1/summary/youtube/auto', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Error al procesar la URL de YouTube');
    }

    return {
      success: true,
      videoId: data.video_id,
      transcription: data.transcription,
      summary: data.summary,
      video_url: data.video_url
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        videoId: '',
        transcription: '',
        summary: '',
        video_url: '',
        error: error.message,
      };
    }
    
    return {
      success: false,
      videoId: '',
      transcription: '',
      summary: '',
      video_url: '',
      error: 'Error desconocido al procesar la solicitud',
    };
  }
} 