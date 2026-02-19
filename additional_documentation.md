# 4.3 Program Description

**Vista Fin AI** is an intelligent, web-based financial management platform designed to empower users with real-time tracking, AI-driven insights, and automated monitoring of their financial health. It bridges the gap between traditional expense trackers and modern investment tools by integrating sophisticated AI advisors with real-time market data. The platform ensures data privacy, responsiveness, and seamless user interaction across devices.

### Main Functionalities

1.  **Smart Expense & Income Tracking**
    Users can log daily transactions with automated categorization. The system visualizes spending habits through interactive charts and monthly trend analysis, helping users maintain financial discipline.

2.  **AI Financial Advisor (Gemini Powered)**
    Integrated with Google Gemini AI, the platform provides a personalized "Financial Assistant." Users can ask natural language questions about their spending, investment strategies, or savings goals, and receive context-aware advice based on their actual portfolio data.

3.  **Real-Time Stock & Crypto Portfolio**
    Data is fetched directly from live stock market APIs (Alpha Vantage) and crypto exchanges. Users can track their holdings, view live profit/loss updates, and manage a diverse investment portfolio from a single dashboard.

4.  **Automated Price Alerts**
    A background monitoring system continuously tracks market prices. Users can set custom target prices for stocks or cryptocurrencies and receive instant push notifications (via Firebase Cloud Messaging) when their targets are hit, ensuring they never miss a trading opportunity.

5.  **Smart Budgeting**
    Users can define monthly spending limits for specific categories (e.g., Food, Transport). The system monitors progress and visually warns users as they approach their budget caps.

6.  **Secure Authentication & Data Storage**
    Authentication is handled via Firebase Auth, ensuring secure sign-up/login flows. All sensitive financial data is encrypted and stored in Firestore, with strict security rules enforcing user privacy.

7.  **Responsive Dashboard**
    The user interface, built with React and Tailwind CSS, offers a modern, glassmorphic design that adapts seamlessly to desktop and mobile screens, providing a premium user experience.

### Technology Stack

*   **Frontend:** React.js, Vite, Tailwind CSS, Recharts, Framer Motion
*   **Backend:** Python Flask, Firebase Admin SDK
*   **Database:** Google Cloud Firestore (NoSQL)
*   **AI Engine:** Google Gemini Pro / API
*   **External APIs:** Alpha Vantage (Stocks), CoinGecko (Crypto)
*   **Security:** Firebase Authentication, Role-Based Access

### Advantages

*   **Holistic View:** Combines daily budgeting with long-term investing in one view.
*   **Proactive Intelligence:** Unlike passive trackers, the AI actively analyzes data to offer actionable advice.
*   **Real-Time Sync:** Instant updates across devices using Firestore real-time listeners.
*   **Scalable Architecture:** Serverless-ready frontend and robust Python backend designed for growth.

---

# 4.4 Naming Conventions

In **Vista Fin AI**, strict naming conventions were enforced to bridge the gap between the TypeScript frontend and Python backend, ensuring code consistency and maintainability.

### 1. Component Naming (Frontend)
*   **PascalCase** is used for all React components and pages.
    *   *Examples:* `Dashboard.tsx`, `AddTransaction.tsx`, `SmartAlert.tsx`, `AppLayout.tsx`.
*   This distinguishes UI elements from logic functions and ensures compatibility with JSX syntax.

### 2. File & Directory Naming
*   **Frontend:** Files match their component names (`Login.tsx`). Utility files use **camelCase** (`formatCurrency.ts`, `transactionsStorage.ts`).
*   **Backend:** Python files use **snake_case**, following PEP 8 standards.
    *   *Examples:* `app.py`, `chat_service.py`, `alert_monitor.py`, `firebase_service.py`.

### 3. Variables and Functions
*   **Frontend (TypeScript):** Uses **camelCase** for variables and function names.
    *   *Examples:* `isLoading`, `totalBalance`, `handleDeleteStock`, `fetchData`.
*   **Backend (Python):** Uses **snake_case** for variables and function definitions.
    *   *Examples:* `get_live_price`, `crypto_record`, `check_alerts`, `user_data`.
*   This clear separation instantly identifies the execution environment (Client vs. Server) of any code snippet.

### 4. Constants and Environment Variables
*   **UPPER_SNAKE_CASE** is used for global constants and configuration values.
    *   *Examples:* `API_BASE_URL`, `ALPHA_VANTAGE_API_KEY`, `MAX_RETRIES`.
*   This effectively separates configuration from executable logic.

### 5. API Endpoints
*   API routes follow a RESTful resource-based naming convention, using lowercase with forward slashes.
    *   *Examples:* `/api/stock/add`, `/api/expense/list`, `/api/chat/prompts`.
*   This makes the API intuitive and self-documenting.

### 6. Database Collections
*   Firestore collections are named in **camelCase** or **snake_case** consistently to represent the entity type.
    *   *Examples:* `users` (collection), `transactions` (sub-collection), `fcm_token` (field).

### Benefits of These Conventions
*   **Cross-Language Clarity:** visual distinction between TS and Python definitions.
*   **Predictability:** Developers can guess file locations and function names without searching.
*   **Standardization:** Adheres to the respective style guides of React and Python communities.

---

# 4.5 Validations

### Introduction
To ensure the integrity of financial data, **Vista Fin AI** implements a multi-layered validation strategy. This includes frontend input masking, backend schema validation, and real-time external verification for market data.

### 1. Form Validations (Input Layer)
*   **Transaction Entry:**
    *   `amount` must be a positive number greater than zero.
    *   `description` and `category` are required fields.
    *   Visual feedback (red borders/toast messages) alerts users immediately if fields are missing.
*   **Stock/Crypto Addition:**
    *   `symbol` is automatically converted to uppercase for consistency.
    *   `quantity` and `buy_price` must be numeric.
    *   Logic prevents submitting future dates for past transactions.

### 2. Backend Logic Validations (Service Layer)
*   **Python Validator Module (`validations.py`):**
    *   Dedicated functions accept data payloads and return validation status before database insertion.
    *   *Example:* `validate_transaction(data)` checks types and constraints on the server side, preventing malicious bypass of frontend checks.
    *   *Example:* `validate_stock_input(symbol, qty)` ensures no negative inventory is recorded.

### 3. External Data Verification
*   **Live Price Check:**
    *   Before saving a new stock or crypto asset, the backend blindly queries the **Stock API**.
    *   *Logic:* If the API returns no price (invalid symbol), the system warns the user but allows the save with a "Price Unavailable" flag, or rejects it depending on configuration.
    *   This ensures the portfolio accurately reflects real-world assets.

### 4. Authentication & Security Guard Clauses
*   **Route Protection:**
    *   Frontend routes (`/dashboard`, `/investments`) check for a valid Firebase User object (`auth.currentUser`).
    *   Redirects unauthenticated users to `/login` immediately.
*   **Token Verification:**
    *   Backend checks for API keys and internal tokens before processing secure requests (e.g., Alert processing).

### 5. AI Safety & Context Validation
*   **Chat Context:**
    *   The `ChatService` verifies if user data (expenses, portfolio) exists before injecting it into the prompt.
    *   If data is empty, it elegantly falls back to a generic financial advisor mode without crashing the service.
*   **Error Handling:**
    *   `try-except` blocks wrap all external API calls (Gemini, Alpha Vantage) to handle timeouts or rate limits gracefully, returning user-friendly error messages instead of server 500 codes.
