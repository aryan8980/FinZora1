
# System Event Table

| ID | Event Name | Actor | Trigger | Input | Output |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **E1** | User Sign Up | User | Click Sign Up | Name, Email, Password | Account created |
| **E2** | User Login | User | Click Login | Email, Password | Session started (Dashboard) |
| **E3** | Add Expense | User | Click Save Transaction | Amount, Category, Description | Expense saved to database |
| **E4** | Add Income | User | Click Save Income | Amount, Source, Date | Income saved to database |
| **E5** | Add Stock Investment | User | Click Add Stock | Symbol, Quantity, Buy Price | Stock added to portfolio |
| **E6** | View Portfolio | User | Click Investments Tab | None | Portfolio summary displayed |
| **E7** | Set Price Alert | User | Click Create Alert | Stock, Target Price/Condition | Alert saved & monitored |
| **E8** | Trigger Price Alert | System | Market Price Change | Stock Price Data | Push Notification sent |
| **E9** | Ask AI Advisor | User | Click Send Message | Text Query (financial question) | AI Response displayed |
| **E10** | Set Budget Limit | User | Click Set Budget | Category, Amount Limit | Budget rule saved |
| **E11** | View Dashboard | User | Login Success / Click Home | None | Financial Overview shown |
| **E12** | Refresh Stock Prices | User | Click Refresh Button | None | Real-time prices updated |
| **E13** | Logout | User | Click Logout | None | Session ended |
