// Import required libraries
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

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
        console.log(`Obteniendo transcripción para: ${video_url}`);
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
        const transcriptionResponse = await fetch(
          `${backendUrl}/api/v1/transcription/youtube`, 
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
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

    // Prepare system prompt based on language
    const systemPrompt = language.toLowerCase() === 'spanish' 
      ? "Eres un asistente experto en resumir videos. Tu tarea es crear un resumen conciso pero completo de la transcripción proporcionada. Usa español simple y directo. Organiza el resumen en párrafos claros."
      : "You are an expert assistant in summarizing videos. Your task is to create a concise but comprehensive summary of the provided transcript. Use simple and direct English. Organize the summary into clear paragraphs.";

    if (!openai.apiKey || openai.apiKey === '') {
      console.error('Error: OPENAI_API_KEY no configurada');
      return NextResponse.json(
        { detail: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Call OpenAI to generate the summary
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Por favor resume esta transcripción de video: ${inputText}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const summary = response.choices[0].message.content;
      // Return the summary
      return NextResponse.json({ summary });
    } catch (openaiError) {
      console.error('Error en llamada a OpenAI:', openaiError);
      return NextResponse.json(
        { detail: "Error calling OpenAI API", error: openaiError instanceof Error ? openaiError.message : String(openaiError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error general generando resumen:", error);
    return NextResponse.json(
      { detail: "Error generating summary", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 