# Script para iniciar el backend Python
# Este script debe ejecutarse en PowerShell

# Directorio del backend
$backendDir = "C:\Users\LENOVO\OneDrive\Escritorio\Backend\ia-be"

# Verificar si el directorio existe
if (-not (Test-Path $backendDir)) {
    Write-Host "Error: No se encuentra el directorio del backend en $backendDir" -ForegroundColor Red
    exit 1
}

# Cambiar al directorio del backend
Set-Location $backendDir
Write-Host "Cambiando al directorio: $backendDir" -ForegroundColor Cyan

# Iniciar el proxy para Qwen API (en una nueva ventana)
Write-Host "Iniciando el proxy Qwen API..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendDir'; .\start_proxy.ps1"

# Esperar un momento para que el proxy inicie
Start-Sleep -Seconds 2

# Iniciar el servidor FastAPI
Write-Host "Iniciando el servidor FastAPI..." -ForegroundColor Green
Write-Host "El servidor estará disponible en http://127.0.0.1:8000" -ForegroundColor Green
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Nota: usando --host 0.0.0.0 para asegurar que el servidor escuche en todas las interfaces de red 