# 4.2 Data Dictionary

## Table 1 – Users
| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| **uid** | STRING | Unique Firebase Authentication ID |
| **email** | STRING | User's email address |
| **displayName** | STRING | Full name of the user |
| **photoURL** | STRING | URL to user's profile picture |
| **fcm_token** | STRING | Firebase Cloud Messaging token for push notifications |
| **createdAt** | TIMESTAMP | Account creation date |

## Table 2 – Transactions (Income & Expenses)
| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| **id** | STRING | Unique transaction identifier |
| **type** | STRING | Transaction type ('income' or 'expense') |
| **amount** | NUMBER | Monetary value of the transaction |
| **category** | STRING | Expense category (e.g., 'Food', 'Rent') or Income source |
| **description** | STRING | Optional details about the transaction |
| **date** | STRING | Date of transaction (ISO 8601 format) |
| **merchant** | STRING | Name of the merchant (for expenses) |
| **source** | STRING | Source of income (for income records) |

## Table 3 – Stocks (Portfolio)
| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| **id** | STRING | Unique stock holding identifier |
| **symbol** | STRING | Stock ticker symbol (e.g., 'AAPL', 'RELIANCE') |
| **quantity** | NUMBER | Number of shares held |
| **buy_price** | NUMBER | Average purchase price per share |
| **current_price** | NUMBER | Real-time market price per share |
| **profit_loss** | NUMBER | Calculated P&L ((Current - Buy) * Quantity) |
| **price_warning** | STRING | Warning message if live price fetch fails |

## Table 4 – Crypto
| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| **id** | STRING | Unique crypto holding identifier |
| **coin_id** | STRING | CoinGecko API ID (e.g., 'bitcoin') |
| **symbol** | STRING | Token symbol (e.g., 'BTC') |
| **name** | STRING | Full name of the cryptocurrency |
| **quantity** | NUMBER | Amount of coins held |
| **buy_price** | NUMBER | Purchase price per unit |
| **current_price** | NUMBER | Live market price |

## Table 5 – Alerts
| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| **id** | STRING | Unique alert identifier |
| **investmentId** | STRING | ID of the stock/crypto being monitored |
| **symbol** | STRING | Ticker symbol or coin ID |
| **type** | STRING | Alert condition type (e.g., 'target_price') |
| **value** | NUMBER | Target price value to trigger alert |
| **triggered** | BOOLEAN | Status flag (true if alert has been sent) |
| **created_at** | TIMESTAMP | Timestamp when alert was set |

## Table 6 – Budgets
| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| **id** | STRING | Unique budget identifier (usually same as category) |
| **category** | STRING | Expense category name |
| **limit** | NUMBER | Monthly spending limit for the category |
| **updatedAt** | TIMESTAMP | Last update timestamp |
