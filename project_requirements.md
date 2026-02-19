# 3.4 Software and Hardware Requirements

## Software Requirements:

**Frontend:**
*   **React.js (via Vite):** For building a high-performance, responsive user interface.
*   **TypeScript:** For type-safe code and better maintainability.
*   **Tailwind CSS:** For modern, utility-first styling and responsive design.
*   **Shadcn UI & Radix UI:** For accessible, pre-built functional components.
*   **Recharts:** For visualizing financial data (stock charts, expense breakdown).

**Backend:**
*   **Framework:** Flask (Python) – For handling API requests and business logic.
*   **Language:** Python 3.10+ – For robust backend processing.
*   **AI Engine:** Google Gemini AI (via `google-generativeai`) – For personalized financial advice and chat.
*   **Financial Data:** `yfinance` & Alpha Vantage API – For real-time stock and market data.
*   **Notifications:** Firebase Cloud Messaging (FCM) – For real-time price alerts.

**Database & Authentication:**
*   **Database:** Firebase Firestore – NoSQL cloud database for storing user data, transactions, and portfolios.
*   **Authentication:** Firebase Auth – For secure email/password and social login.

**Development Tools:**
*   **IDE:** Visual Studio Code.
*   **Runtime:** Node.js & npm (Frontend), Python (Backend).
*   **Version Control:** Git/GitHub.
*   **API Testing:** Postman or Curl.

## Hardware Requirements:

**Server (hosting):**
*   **CPU:** Minimum 2-core CPU (recommended for Python/Flask processing).
*   **RAM:** Minimum 4 GB RAM (to handle AI model requests and data processing).
*   **Storage:** 20 GB+ SSD (mostly for system logs/dependencies, as data is in Firebase).
*   **Network:** High-speed internet connection for API calls to external financial services.

**Client Devices:**
*   **Desktop/Laptop:** Any modern PC (Windows/Mac/Linux) with a modern browser (Chrome, Edge, Firefox, Safari).
*   **Mobile:** Modern smartphone with a web browser (for responsive web access).
*   **Peripherals:** Standard keyboard and mouse; optional webcam not required for the core financial app.
