#!/bin/bash
# Script para iniciar el servidor de consulta de Reportes 2026
# Este script se ejecuta en Mac al hacer doble clic

# Cambiar al directorio donde está el script
cd "$(dirname "$0")"

clear
echo "=========================================================="
echo "      INICIANDO SISTEMA DE CONSULTA DE REPORTES 2026      "
echo "=========================================================="
echo ""

# Liberar el puerto 8000 si está ocupado
echo "Liberando el puerto 8000 (si está ocupado)..."
lsof -t -i tcp:8000 | xargs kill -9 2>/dev/null
pkill -f "sistema_consulta/server.py" 2>/dev/null

echo "Servidor web iniciando en: http://localhost:8000"
echo "Presiona Ctrl+C en esta ventana para apagar el servidor."
echo ""

# Abrir el navegador tras 1.5 segundos
(sleep 1.5 && open http://localhost:8000) &

# Ejecutar el servidor Python
python3 sistema_consulta/server.py
