// Test script for summary API
const fetch = require('node-fetch');

async function testSummaryApi() {
  const url = 'http://localhost:8000/api/v1/summary/youtube';
  const sampleText = `Este es un texto de prueba para el resumen. Necesitamos ver si la API de resumen está funcionando correctamente.
  Estamos probando la funcionalidad del servicio de resumen de videos de YouTube.
  Esperamos que el servicio pueda resumir este texto de manera efectiva y devolvernos un buen resumen.
  Esta es una prueba directa para verificar que la API de backend funciona correctamente.
  Si esto funciona, sabremos que el problema está en la integración frontend-backend y no en el servicio backend en sí mismo.`;

  console.log('Sending test request to summary API...');
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcription: sampleText,
        language_code: 'es',
        max_length: 500
      }),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error: ${response.status}`, errorText);
      return;
    }

    const data = await response.json();
    console.log('Success! Summary:', data.summary);
  } catch (error) {
    console.error('Error testing summary API:', error);
  }
}

// Run the test
testSummaryApi(); 