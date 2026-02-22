import os
import google.generativeai as genai
import json
import base64
from typing import Dict, Any, Optional

class ReceiptScanner:
    def __init__(self):
        self.api_key = os.getenv('GOOGLE_GEMINI_API_KEY')
        self.use_ai = False
        if self.api_key and len(self.api_key) > 20:
            try:
                genai.configure(api_key=self.api_key)
                # Attempt to use the newest fast model available
                self.model = genai.GenerativeModel('gemini-2.5-flash')
                self.use_ai = True
                print("✓ Receipt Scanner initialized (Gemini)")
            except Exception as e:
                print(f"⚠️ Receipt Scanner init failed: {e}")

    def scan_receipt(self, base64_image: str) -> Optional[Dict[str, Any]]:
        if not self.use_ai:
            return {"error": "AI Scanner not initialized. Check API key."}

        try:
            # Clean up the base64 string if it contains the data URI prefix
            if ',' in base64_image:
                base64_image = base64_image.split(',')[1]

            image_data = base64.b64decode(base64_image)

            prompt = """
            Analyze this receipt image and extract the following information. 
            Return ONLY a valid JSON object with these exact keys, nothing else:
            - "merchant": The name of the store or merchant (string)
            - "amount": The total final amount paid (number, not string)
            - "date": The date on the receipt in YYYY-MM-DD format, or today's date if not found (string)
            - "category": The best matching category for this expense from this list: Food, Transport, Shopping, Entertainment, Utilities, Healthcare, Education, Other (string)
            
            Example response:
            {
                "merchant": "Starbucks",
                "amount": 5.45,
                "date": "2023-10-27",
                "category": "Food"
            }
            """

            response = self.model.generate_content([
                prompt,
                {"mime_type": "image/jpeg", "data": image_data}
            ])
            
            # Clean up potential markdown formatting in the response
            response_text = response.text.strip()
            if response_text.startswith('```json'):
                response_text = response_text.replace('```json', '', 1)
            if response_text.startswith('```'):
                response_text = response_text.replace('```', '', 1)
            if response_text.endswith('```'):
                response_text = response_text[:response_text.rfind('```')]
                
            response_text = response_text.strip()
            
            try:
                parsed_data = json.loads(response_text)
                return parsed_data
            except json.JSONDecodeError as e:
                print(f"Error parsing Gemini response as JSON: {response_text}")
                return {"error": "Failed to parse receipt data. Please try again."}

        except Exception as e:
            print(f"Error scanning receipt: {e}")
            return {"error": str(e)}
