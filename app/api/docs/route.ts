import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Leer el archivo de especificación OpenAPI
export async function GET() {
  try {
    // Ruta al archivo openapi.json
    const filePath = path.join(process.cwd(), 'public', 'openapi.json');
    
    // Leer el archivo
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const openApiSpec = JSON.parse(fileContents);
    
    // Devolver la especificación como JSON
    return NextResponse.json(openApiSpec);
  } catch (error) {
    console.error('Error al leer el archivo de especificación OpenAPI:', error);
    return NextResponse.json(
      { error: 'Error al cargar la documentación de la API' },
      { status: 500 }
    );
  }
} 