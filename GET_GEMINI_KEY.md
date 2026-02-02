# How to Get Your Free Google Gemini API Key

## Steps:

1. **Visit Google AI Studio**
   - Go to: https://makersuite.google.com/app/apikey
   - Or: https://aistudio.google.com/app/apikey

2. **Sign in with Google Account**
   - Use any Google account (Gmail)

3. **Create API Key**
   - Click "Create API Key"
   - Choose "Create API key in new project" (recommended)
   - Copy the generated key

4. **Add to .env File**
   - Open `.env` file in your project root
   - Replace `your_gemini_api_key_here` with your actual key:
   ```
   GOOGLE_GEMINI_API_KEY=your_actual_key_here
   ```

5. **Restart Backend Server**
   - Stop the Flask server (Ctrl+C in terminal)
   - Start it again: `python backend/app.py`

## Notes:
- The API is FREE for personal use
- No credit card required
- Generous usage limits for development

## Testing:
Once configured, your chatbot will use AI to answer questions intelligently!
Try asking:
- "What are my biggest expenses?"
- "Give me financial advice"
- "How is my portfolio performing?"
