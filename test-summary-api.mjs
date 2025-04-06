// Test script for summary API
// Run with: node test-summary-api.mjs

async function testSummaryApi() {
  // Usar 127.0.0.1 en lugar de localhost para evitar problemas con IPv6
  const url = 'http://127.0.0.1:8000/api/v1/summary/youtube';
  const sampleText = `Este es un texto de prueba para el resumen. Necesitamos ver si la API de resumen está funcionando correctamente.
  Estamos probando la funcionalidad del servicio de resumen de videos de YouTube.
  Esperamos que el servicio pueda resumir este texto de manera efectiva y devolvernos un buen resumen.
  Esta es una prueba directa para verificar que la API de backend funciona correctamente.
  Si esto funciona, sabremos que el problema está en la integración frontend-backend y no en el servicio backend en sí mismo.`;

  console.log('Enviando solicitud de prueba a la API de resumen...');
  console.log('URL:', url);
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

    console.log('Código de estado de respuesta:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error: ${response.status}`, errorText);
      return;
    }

    const data = await response.json();
    console.log('¡Éxito! Resumen:', data.summary);
  } catch (error) {
    console.error('Error en la prueba de la API de resumen:', error);
    console.log('\nVerifica que el servidor Python esté corriendo con:');
    console.log('cd C:\\Users\\LENOVO\\OneDrive\\Escritorio\\Backend\\ia-be');
    console.log('python -m uvicorn app.main:app --reload --port 8000');
  }
}

// Run the test
testSummaryApi(); 