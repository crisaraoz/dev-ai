// Import required libraries
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Get the request body
    const body = await req.json();
    const { video_url, language = 'spanish', transcription } = body;
    if (!video_url && !transcription) {
      console.error('Error: Se requiere video_url o transcription');
      return NextResponse.json(
        { detail: "Either video_url or transcription is required" },
        { status: 400 }
      );
    }

    let inputText = transcription;

    // If transcription is not provided and we have a video URL, get the transcription
    if (!inputText && video_url) {
      try {
        // Use API_URL or NEXT_PUBLIC_APP_URL instead of BACKEND_URL
        const backendUrl = process.env.API_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8000';
        console.log(`Using backend URL: ${backendUrl}`);
        
        const transcriptionResponse = await fetch(
          `${backendUrl}/api/v1/transcription/youtube`, 
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Origin': 'http://localhost:3000'
            },
            body: JSON.stringify({ video_url }),
          }
        );

        if (!transcriptionResponse.ok) {
          const errorText = await transcriptionResponse.text();
          console.error(`Error respuesta backend: ${transcriptionResponse.status}, ${errorText}`);
          throw new Error(`Error fetching transcription: ${transcriptionResponse.statusText}, ${errorText}`);
        }

        const transcriptionData = await transcriptionResponse.json();
        inputText = transcriptionData.transcription;
      } catch (error) {
        console.error('Error fetching transcription:', error);
        return NextResponse.json(
          { detail: "Failed to get video transcription", error: error instanceof Error ? error.message : String(error) },
          { status: 500 }
        );
      }
    }

    if (!inputText) {
      console.error('Error: No hay transcripción disponible');
      return NextResponse.json(
        { detail: "No valid transcription available" },
        { status: 400 }
      );
    }

    // Convert language to language code
    const languageCode = language.toLowerCase() === 'spanish' ? 'es' : 'en';

    // Call backend for summary directly without any timeouts or controllers
    try {
      console.log("Intentando resumen con transcripción:", inputText.substring(0, 50) + "...");
      
      // Use a simpler, more direct approach with Node.js fetch
      const apiUrl = 'http://127.0.0.1:8000/api/v1/summary/youtube';
      
      // Create payload explicitly
      const payload = {
        url: video_url || undefined,
        transcription: inputText,
        language_code: languageCode,
        max_length: 500
      };
      
      console.log("Sending POST request to:", apiUrl);
      console.log("With payload:", JSON.stringify(payload).substring(0, 150) + "...");
      
      const summaryResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        cache: 'no-store'
      });
      
      console.log("Response status:", summaryResponse.status);
      
      if (!summaryResponse.ok) {
        const errorText = await summaryResponse.text();
        console.error(`Error from backend (${summaryResponse.status}): ${errorText}`);
        throw new Error(`Backend returned error ${summaryResponse.status}: ${errorText}`);
      }
      
      const summaryData = await summaryResponse.json();
      console.log("Resumen recibido correctamente");
      return NextResponse.json({ summary: summaryData.summary });
    } catch (error) {
      console.error("Error al resumir:", error);
      return NextResponse.json(
        { 
          detail: "Error summarizing content", 
          error: error instanceof Error ? error.message : String(error),
          suggestion: "Verify that the backend is running and accessible at http://localhost:8000"
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error general:", error);
    return NextResponse.json(
      { detail: "General error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 