#!/usr/bin/env python3
"""
Quick Start Script for FinZora Chatbot
Run this to start both backend and frontend servers
"""

import subprocess
import sys
import os
import time

def print_header(text):
    print("\n" + "="*70)
    print(f"  {text}")
    print("="*70 + "\n")

def main():
    print_header("🤖 FINZORA CHATBOT QUICK START")
    
    # Check if .env exists
    if not os.path.exists('.env'):
        print("❌ .env file not found!")
        print("Please create a .env file with your API keys.")
        sys.exit(1)
    
    print("✅ .env file found")
    
    # Check if virtual environment exists
    venv_python = r"C:\Users\aryan\Desktop\vista-fin-ai-main\.venv\Scripts\python.exe"
    if not os.path.exists(venv_python):
        print("❌ Virtual environment not found!")
        print("Please run: python -m venv .venv")
        sys.exit(1)
    
    print("✅ Virtual environment found")
    
    print("\n📦 Starting servers...")
    print("   Backend: http://localhost:5000")
    print("   Frontend: http://localhost:5173")
    print("   Press Ctrl+C to stop\n")
    
    # Start backend server
    backend_process = subprocess.Popen(
        [venv_python, '-m', 'flask', 'run', '--port', '5000'],
        cwd='backend',
        env={**os.environ, 'FLASK_APP': 'app.py'}
    )
    
    # Wait for backend to start
    time.sleep(2)
    
    # Start frontend server (shell=True needed for npm on Windows)
    frontend_process = subprocess.Popen(
        'npm run dev:frontend',
        shell=True
    )
    
    try:
        # Keep both processes running
        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\n\n🛑 Stopping servers...")
        backend_process.terminate()
        frontend_process.terminate()
        backend_process.wait(timeout=5)
        frontend_process.wait(timeout=5)
        print("👋 Servers stopped. Goodbye!")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        backend_process.terminate()
        frontend_process.terminate()
        sys.exit(1)

if __name__ == '__main__':
    main()
