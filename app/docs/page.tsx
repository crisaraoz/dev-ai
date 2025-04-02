'use client';

import { useEffect } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocs() {
  // El script para corregir los estilos de Swagger UI en modo oscuro
  useEffect(() => {
    // Crear un elemento de estilo para el modo oscuro
    const style = document.createElement('style');
    style.textContent = `
      /* Modo oscuro para Swagger UI */
      .dark .swagger-ui,
      .dark .swagger-ui .opblock .opblock-summary-description,
      .dark .swagger-ui .opblock-description-wrapper p,
      .dark .swagger-ui .info .title,
      .dark .swagger-ui .info li, 
      .dark .swagger-ui .info p, 
      .dark .swagger-ui .info table,
      .dark .swagger-ui .parameter__name,
      .dark .swagger-ui table thead tr td, 
      .dark .swagger-ui table thead tr th,
      .dark .swagger-ui .response-col_status,
      .dark .swagger-ui .response-col_description,
      .dark .swagger-ui section.models h4,
      .dark .swagger-ui .model-title,
      .dark .swagger-ui .model, 
      .dark .swagger-ui .model-toggle {
        color: #f8f8f8;
      }
      
      .dark .swagger-ui .scheme-container {
        background-color: #1a1a1a;
      }
      
      .dark .swagger-ui input[type=text],
      .dark .swagger-ui input[type=email] {
        background-color: #2f2f2f;
        color: #f8f8f8;
      }
      
      .dark .swagger-ui .btn.execute {
        background-color: #4caf50;
        color: white;
      }
      
      .dark .swagger-ui .opblock {
        background-color: #2f2f2f;
      }
      
      .dark .swagger-ui .opblock .opblock-summary {
        border-color: #444;
      }
      
      .dark .swagger-ui .opblock-tag {
        border-color: #444;
      }
      
      .dark .swagger-ui .opblock.opblock-post {
        background-color: rgba(49, 0, 87, 0.1);
        border-color: #49cc90;
      }
      
      .dark .swagger-ui .model-box {
        background-color: #2f2f2f;
      }
      
      .dark .swagger-ui section.models {
        border-color: #444;
      }
      
      .dark .swagger-ui .model-container {
        background-color: #2f2f2f;
      }
      
      .dark .swagger-ui .parameter__type,
      .dark .swagger-ui .response-col_links {
        color: #aaa;
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">API Documentation</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <SwaggerUI url="/api/docs" docExpansion="list" />
      </div>
    </div>
  );
} 