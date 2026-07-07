# StockFlow — Virtual Stock Trading & Analysis Platform

StockFlow is a full-stack, monorepo MERN (MongoDB, Express, React, Node.js) stock trading platform. It features a public-facing marketing/landing site, a private trading dashboard (covering holdings, positions, orders, and funds management), and an AI-powered portfolio chat assistant that uses natural language to query and manage portfolios.

Please try to implement the project on your own before proceeding to the lectures & code.

---

## 🏗️ System Architecture

The project is structured as a **monorepo** consisting of three main subsystems running on different ports:

```
StockFlow/
├── backend/      ← Node.js & Express server (Port 3002)
├── frontend/     ← React app for landing page, signup, login (Port 3001)
└── dashboard/    ← React app for the main trading dashboard console (Port 3000)
```

### Subsystems Breakdown

1. **Backend (`:3002`):**
   - Handles REST API requests, database queries, and third-party API fetches.
   - Manages user authentication sessions using `passport` and `passport-local-mongoose`.
   - Interacts with Google's Gemini API to power the AI portfolio assistant.
   - Fetches live financial indices and stock prices from Yahoo Finance API.

2. **Frontend (`:3001`):**
   - The user-facing landing website (Home, About, Products, Pricing, and Support pages).
   - Handles authentication pages (**Signup** and **Login**).
   - Once authenticated, securely forwards the user credentials to the main dashboard console.

3. **Dashboard (`:3000`):**
   - The private trading platform interface.
   - Displays real-time indices (NIFTY 50 / SENSEX).
   - Features the primary stock watchlist, holdings portfolio, active positions, transaction history (orders), virtual funds transfers, and the floating AI Assistant chat widget.

---

## 🌟 Core Features

### 📈 1. Real-Time Market Feeds
- **Index Tracker:** Displays live values of NIFTY 50 and SENSEX at the top header, fetching real-time market metrics from Yahoo Finance API every 60 seconds.
- **Holdings Live LTP:** Instead of displaying frozen buy-in prices, the portfolio fetches current trading prices from the stock market for all user holdings dynamically, providing true unrealized P&L calculations.

### 💰 2. Virtual Wallet & Funds Manager
- **Initial Capital:** Every new user account is automatically initialized with **₹10,00,000** of virtual cash.
- **Deposit & Withdrawal:** Users can access the *Funds* tab to instantly add virtual funds to their wallet or withdraw cash, persisting balances securely in MongoDB.
- **Buying & Selling:** Validates balances before executing trades. Successfully bought shares show up in *Holdings* and transaction logs are written to *Orders*.

### 🤖 3. AI Portfolio Assistant (StockFlow Assistant)
- **Direct Database Analysis:** The assistant queries user portfolios directly using local regex parsing, allowing users to ask questions like *"What is my total investment?"* or *"Show all my holdings"*.
- **Gemini 2.5/3.5 Flash:** Powered by Google's LLM engine. Uses context injection to phrase responses intelligently without exposing raw database endpoints to the AI.
- **Graceful Failures:** If the API key is not configured or fails, the assistant switches to returning clean raw database metrics directly to keep the chatbot functional.

---

## 🗄️ Database Schema (MongoDB)

Uses Mongoose schemas in the database:
- **`UserSchema`:** Stores user credentials, email, and wallet cash balance (`funds`).
- **`HoldingsSchema`:** Represents long-term/overnight investment assets owned by the user (stores username, stock name, quantity, and average buy price).
- **`PositionsSchema`:** Stores intraday or open trades.
- **`OrdersSchema`:** Transaction history logging all completed BUY and SELL executions.

---

## 🛠️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally on `mongodb://127.0.0.1:27017`.

### Startup Instructions
Open **three separate terminal windows** and execute the commands below:

```bash
# Terminal 1 — Start MongoDB & Backend Server
cd backend
npm install
npm start

# Terminal 2 — Start Frontend Landing Page
cd frontend
npm install
npm start

# Terminal 3 — Start Trading Console Dashboard
cd dashboard
npm install
npm start
```

### Configuration (`backend/.env`)

A template configuration is available in `backend/.env.example`. Create a `.env` file inside the `backend/` folder and customize it:

```env
MONGO_URL=mongodb://127.0.0.1:27017/stockflow
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
PORT=3002
```

---

## 🔧 Recent Updates & Changes

Below is a summary of the fixes and updates completed to bring the project into a working state:

### 1. Dependencies and Setup
- Resolved module installation issues across the monorepo.
- Verified successful builds for the frontend and dashboard.

### 2. Backend Setup and Fixes
- Added environment variable support with template configuration.
- Solved backend port conflicts by stopping stale Node processes.
- Verified backend authentication and AI chat endpoints work correctly.

### 3. Dashboard Fixes
- Enlarged the StockFlow logo in the dashboard sidebar.
- Fixed the logo image asset path to prevent broken links on inner dashboard routes.
- Fixed dashboard API endpoints to use correct host-based routing (preventing hard-coded localhost 404s).
- Repaired the chat widget to request correct backend chat routes.

### 4. Landing Page & Authentication
- Linked the landing page navigation buttons to the correct signup, login, and dashboard pages.
- Corrected the signup form submission to properly register accounts and show clear server errors if the backend is down.
- Integrated successful login forms to automatically redirect users to the dashboard.

### 5. Chatbot Upgrades
- Added robust local regex fallback parsing. If the Gemini API is offline or the key is not set, the AI assistant still answers questions about user portfolio, balance, holdings, and orders gracefully.
