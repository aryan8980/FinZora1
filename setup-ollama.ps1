#!/usr/bin/env pwsh
# Quick Start Script for FREE Ollama AI Setup
# This script helps you set up Ollama for unlimited free AI

Write-Host "
╔══════════════════════════════════════════════════════════════╗
║     🆓 FinZora FREE AI Setup (Ollama)                       ║
║     Complete Free Alternative - No Costs, No Rate Limits    ║
╚══════════════════════════════════════════════════════════════╝
" -ForegroundColor Green

# Check if Ollama is installed
$ollamaPath = "C:\Program Files\Ollama\ollama.exe"
if (-not (Test-Path $ollamaPath)) {
    Write-Host "❌ Ollama not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 STEP 1: Download Ollama" -ForegroundColor Yellow
    Write-Host "   Go to: https://ollama.ai" -ForegroundColor Cyan
    Write-Host "   Download Windows version"
    Write-Host "   Install like any other app"
    Write-Host ""
    Write-Host "✅ After installing, run this script again!"
    Read-Host "Press Enter to open Ollama website..."
    Start-Process "https://ollama.ai"
    exit
}

Write-Host "✅ Ollama found!" -ForegroundColor Green

# Check if Ollama server is running
Write-Host ""
Write-Host "🔍 Checking if Ollama server is running..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 2 -ErrorAction SilentlyContinue
    Write-Host "✅ Ollama server is RUNNING!" -ForegroundColor Green
    
    $models = ($response.Content | ConvertFrom-Json).models
    if ($models) {
        Write-Host ""
        Write-Host "📦 Available Models:" -ForegroundColor Cyan
        foreach ($model in $models) {
            Write-Host "   ✓ $($model.name)"
        }
    } else {
        Write-Host ""
        Write-Host "⚠️  No models downloaded yet!" -ForegroundColor Yellow
        Write-Host "   Download one: ollama pull mistral" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Ollama server NOT running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "🚀 Starting Ollama server..." -ForegroundColor Yellow
    Write-Host ""
    
    & $ollamaPath serve
}

Write-Host ""
Write-Host "💡 Next steps:" -ForegroundColor Green
Write-Host "1. Keep this terminal open (Ollama server running)" -ForegroundColor White
Write-Host "2. Open another terminal for model downloads" -ForegroundColor White
Write-Host "3. Run: ollama pull mistral" -ForegroundColor Cyan
Write-Host "4. Your chatbot will automatically use it!" -ForegroundColor White
