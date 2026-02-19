import matplotlib.pyplot as plt
import pandas as pd

def save_table_image(data, columns, filename, title):
    fig, ax = plt.subplots(figsize=(10, len(data) * 0.5 + 1.5))
    ax.axis('off')
    
    # Create table
    table = ax.table(cellText=data, colLabels=columns, loc='center', cellLoc='left')
    
    # Style table
    table.auto_set_font_size(False)
    table.set_fontsize(10)
    table.scale(1, 1.8)
    
    # Header styling
    for i, key in enumerate(columns):
        cell = table[0, i]
        cell.set_facecolor('#4472C4') # Blue header like reference
        cell.set_text_props(color='white', weight='bold')
    
    # Alternating row colors (optional, but clean)
    for i in range(len(data)):
        for j in range(len(columns)):
            cell = table[i+1, j]
            if i % 2 == 0:
                cell.set_facecolor('#E9EBF5')
            else:
                cell.set_facecolor('white')
    
    plt.title(title, pad=20, fontsize=12, fontweight='bold', color='#333333')
    plt.tight_layout()
    plt.savefig(filename, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"Generated {filename}")

# Data Definitions
tables = [
    {
        "title": "Table 1 - Users",
        "filename": "table_users.png",
        "columns": ["Field Name", "Data Type", "Description"],
        "data": [
            ["uid", "STRING", "Unique Firebase Authentication ID"],
            ["email", "STRING", "User's email address"],
            ["displayName", "STRING", "Full name of the user"],
            ["photoURL", "STRING", "URL to user's profile picture"],
            ["fcm_token", "STRING", "Firebase Cloud Messaging token"],
            ["createdAt", "TIMESTAMP", "Account creation date"]
        ]
    },
    {
        "title": "Table 2 - Transactions",
        "filename": "table_transactions.png",
        "columns": ["Field Name", "Data Type", "Description"],
        "data": [
            ["id", "STRING", "Unique transaction identifier"],
            ["type", "STRING", "Transaction type ('income' or 'expense')"],
            ["amount", "NUMBER", "Monetary value of the transaction"],
            ["category", "STRING", "Expense category or Income source"],
            ["description", "STRING", "Optional details"],
            ["date", "STRING", "Date of transaction (ISO 8601)"],
            ["merchant", "STRING", "Name of the merchant (Expenses)"],
            ["source", "STRING", "Source of income (Income)"]
        ]
    },
    {
        "title": "Table 3 - Stocks (Portfolio)",
        "filename": "table_stocks.png",
        "columns": ["Field Name", "Data Type", "Description"],
        "data": [
            ["id", "STRING", "Unique stock holding identifier"],
            ["symbol", "STRING", "Stock ticker symbol (e.g. AAPL)"],
            ["quantity", "NUMBER", "Number of shares held"],
            ["buy_price", "NUMBER", "Average purchase price per share"],
            ["current_price", "NUMBER", "Real-time market price"],
            ["profit_loss", "NUMBER", "Calculated P&L"],
            ["price_warning", "STRING", "Warning if live fetch fails"]
        ]
    },
    {
        "title": "Table 4 - Crypto",
        "filename": "table_crypto.png",
        "columns": ["Field Name", "Data Type", "Description"],
        "data": [
            ["id", "STRING", "Unique crypto holding identifier"],
            ["coin_id", "STRING", "CoinGecko API ID (e.g. bitcoin)"],
            ["symbol", "STRING", "Token symbol (e.g. BTC)"],
            ["name", "STRING", "Full name of cryptocurrency"],
            ["quantity", "NUMBER", "Amount of coins held"],
            ["buy_price", "NUMBER", "Purchase price per unit"],
            ["current_price", "NUMBER", "Live market price"]
        ]
    },
    {
        "title": "Table 5 - Alerts",
        "filename": "table_alerts.png",
        "columns": ["Field Name", "Data Type", "Description"],
        "data": [
            ["id", "STRING", "Unique alert identifier"],
            ["investmentId", "STRING", "ID of stock/crypto monitored"],
            ["symbol", "STRING", "Ticker symbol or coin ID"],
            ["type", "STRING", "Condition type (e.g. target_price)"],
            ["value", "NUMBER", "Target price value"],
            ["triggered", "BOOLEAN", "Status flag (true if sent)"],
            ["created_at", "TIMESTAMP", "Timestamp when set"]
        ]
    },
    {
        "title": "Table 6 - Budgets",
        "filename": "table_budgets.png",
        "columns": ["Field Name", "Data Type", "Description"],
        "data": [
            ["id", "STRING", "Unique budget identifier"],
            ["category", "STRING", "Expense category name"],
            ["limit", "NUMBER", "Monthly spending limit"],
            ["updatedAt", "TIMESTAMP", "Last update timestamp"]
        ]
    }
]

if __name__ == "__main__":
    for t in tables:
        save_table_image(t["data"], t["columns"], t["filename"], t["title"])
