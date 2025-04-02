import { NextRequest, NextResponse } from 'next/server';

// Función para extraer el ID del video de YouTube de una URL
function extractYoutubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  
  return match && match[2].length === 11 ? match[2] : null;
}

// Función para simular la obtención de una transcripción de YouTube
function generateTranscriptForVideo(videoId: string): string {
  // En una implementación real, aquí conectarías con YouTube API o un servicio de transcripción
  // Por ahora, devolvemos una transcripción simulada basada en el ID del video
  const timestamps = ['00:04', '02:14', '02:22', '02:31', '02:41', '02:50', '03:00'];
  
  const transcriptLines = [
    `${timestamps[0]} Mosqueo tremendo y pensar que que que esto incluso casi confirma que todo lo de repu! Es verdad que todo se ha hecho`,
    `${timestamps[1]} Por algo y por algo con la pinto va dando los primeros likes a Christian Homer y todas las pruebas que hemos enseñado pero esto yo lo veo demasiado fuerte lo voy a poner dos veces primero`,
    `${timestamps[2]} Lo voy a poner con sonido para que lo escucháis espero que el copy no salte si salta tendré que editarlo y quitarlo con sonido y ahora os pongo la prueba y en verdad`,
    `${timestamps[3]} Se puede ver pero lo vamos a ver de las dos maneras vale es tremendo Primero quiero que veáis exactamente lo que dijo duhan porque esto lo dijo nada más y`,
    `${timestamps[4]} Nada bueno aquí veo lo pongo lo vamos a ver y a poner porque es el mismo vale pero que sepáis que directamente ha desaparecido`,
    `${timestamps[5]} Lo que es la etiqueta de duhan veis aquí aquí podéis ver como no está la etiqueta de duhan y es el mismo y obviamente ahora lo veremos porque éso bueno los`,
    `${timestamps[6]} Sport mafiáticos estamos ahí obviamente lo hemos visto y nos hacemos notar Gracias por estar ahí encima por poner Sport mafiáticos pero fijaros la diferencia no la diferencia Es evidente`
  ];
  
  return transcriptLines.join('\n');
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

    // Generar la transcripción simulada
    const transcript = generateTranscriptForVideo(videoId);

    return NextResponse.json({ 
      success: true, 
      videoId,
      transcript,
      metadata: {
        url,
        timestamp: new Date().toISOString(),
        language: 'es',
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