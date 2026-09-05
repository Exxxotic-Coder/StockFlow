require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");

const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");
const { UserModel } = require("./model/UserModel");
const chatRoutes = require("./routes/chatRoutes");
const { requireAuth } = require("./middleware/auth");
const { getLivePrices } = require("./services/livePriceService");

const PORT = process.env.PORT || 3002;
const uri = process.env.MONGO_URL;
const isProduction = process.env.NODE_ENV === "production";
const sessionSecret = process.env.SESSION_SECRET;
const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:3000,http://localhost:3001")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (isProduction && (!sessionSecret || sessionSecret.length < 32)) {
  throw new Error("SESSION_SECRET must be at least 32 characters in production");
}
if (!uri) {
  throw new Error("MONGO_URL is required");
}

const app = express();

if (isProduction) app.set("trust proxy", 1);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true,
}));
app.use(bodyParser.json());
app.use(session({
  secret: sessionSecret || "local-development-session-secret-change-me",
  store: MongoStore.create({ mongoUrl: uri, collectionName: "sessions" }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// AI chatbot (independent feature, does not alter any existing routes)
app.use(chatRoutes);

app.get("/me", requireAuth, (req, res) => {
  res.json({ success: true, username: req.authenticatedUsername });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "connecting" });
});

app.get("/addHoldings", requireAuth, async (req, res) => {
  let tempHoldings = [
    {
      name: "BHARTIARTL",
      qty: 2,
      avg: 538.05,
      price: 541.15,
      net: "+0.58%",
      day: "+2.99%",
    },
    {
      name: "HDFCBANK",
      qty: 2,
      avg: 1383.4,
      price: 1522.35,
      net: "+10.04%",
      day: "+0.11%",
    },
    {
      name: "HINDUNILVR",
      qty: 1,
      avg: 2335.85,
      price: 2417.4,
      net: "+3.49%",
      day: "+0.21%",
    },
    {
      name: "INFY",
      qty: 1,
      avg: 1350.5,
      price: 1555.45,
      net: "+15.18%",
      day: "-1.60%",
      isLoss: true,
    },
    {
      name: "ITC",
      qty: 5,
      avg: 202.0,
      price: 207.9,
      net: "+2.92%",
      day: "+0.80%",
    },
    {
      name: "KPITTECH",
      qty: 5,
      avg: 250.3,
      price: 266.45,
      net: "+6.45%",
      day: "+3.54%",
    },
    {
      name: "M&M",
      qty: 2,
      avg: 809.9,
      price: 779.8,
      net: "-3.72%",
      day: "-0.01%",
      isLoss: true,
    },
    {
      name: "RELIANCE",
      qty: 1,
      avg: 2193.7,
      price: 2112.4,
      net: "-3.71%",
      day: "+1.44%",
    },
    {
      name: "SBIN",
      qty: 4,
      avg: 324.35,
      price: 430.2,
      net: "+32.63%",
      day: "-0.34%",
      isLoss: true,
    },
    {
      name: "SGBMAY29",
      qty: 2,
      avg: 4727.0,
      price: 4719.0,
      net: "-0.17%",
      day: "+0.15%",
    },
    {
      name: "TATAPOWER",
      qty: 5,
      avg: 104.2,
      price: 124.15,
      net: "+19.15%",
      day: "-0.24%",
      isLoss: true,
    },
    {
      name: "TCS",
      qty: 1,
      avg: 3041.7,
      price: 3194.8,
      net: "+5.03%",
      day: "-0.25%",
      isLoss: true,
    },
    {
      name: "WIPRO",
      qty: 4,
      avg: 489.3,
      price: 577.75,
      net: "+18.08%",
      day: "+0.32%",
    },
  ];

  const username = req.authenticatedUsername;
  tempHoldings.forEach((item) => {
    let newHolding = new HoldingsModel({
      username: username || undefined,
      name: item.name,
      qty: item.qty,
      avg: item.avg,
      price: item.price,
      net: item.net,
      day: item.day,
    });

    newHolding.save();
  });
  res.send("Done!");
});

app.get("/addPositions", requireAuth, async (req, res) => {
  let tempPositions = [
    {
      product: "CNC",
      name: "EVEREADY",
      qty: 2,
      avg: 316.27,
      price: 312.35,
      net: "+0.58%",
      day: "-1.24%",
      isLoss: true,
    },
    {
      product: "CNC",
      name: "JUBLFOOD",
      qty: 1,
      avg: 3124.75,
      price: 3082.65,
      net: "+10.04%",
      day: "-1.35%",
      isLoss: true,
    },
  ];

  const username = req.authenticatedUsername;
  tempPositions.forEach((item) => {
    let newPosition = new PositionsModel({
      username: username || undefined,
      product: item.product,
      name: item.name,
      qty: item.qty,
      avg: item.avg,
      price: item.price,
      net: item.net,
      day: item.day,
      isLoss: item.isLoss,
    });

    newPosition.save();
  });
  res.send("Done!");
});

// Authentication Endpoints
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: "All fields (username, email, password) are required" });
    }
    // Explicitly set funds so new users always get ₹10 lakh virtual wallet
    const user = new UserModel({ username, email, funds: 1000000 });
    const registeredUser = await UserModel.register(user, password);
    res.status(200).json({ success: true, user: { username: registeredUser.username, email: registeredUser.email } });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: "Username and password are required" });
  }
  UserModel.authenticate()(username, password, (err, user, options) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    if (!user) {
      return res.status(401).json({ success: false, error: options ? options.message : "Invalid username or password" });
    }
    req.session.username = user.username;
    res.status(200).json({ success: true, username: user.username });
  });
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

app.use(requireAuth);

// Wallet funds endpoint
app.get("/funds", async (req, res) => {
  const username = req.authenticatedUsername;
  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.json({ success: true, funds: 0 });
    }
    // Auto-initialize old accounts that have 0 or undefined funds
    // (only if they have no order history — so we don't reset a user who spent all their money)
    if (!user.funds) {
      const orderCount = await OrdersModel.countDocuments({ username });
      if (orderCount === 0) {
        user.funds = 1000000;
        await user.save();
      }
    }
    res.json({ success: true, funds: user.funds || 0 });
  } catch (err) {
    res.json({ success: true, funds: 0 });
  }
});

// Get User-specific Holdings
app.get("/allHoldings", async (req, res) => {
  const username = req.authenticatedUsername;
  let allHoldings = await HoldingsModel.find({ username });
  res.json(allHoldings);
});

// Get User-specific Positions
app.get("/allPositions", async (req, res) => {
  const username = req.authenticatedUsername;
  let allPositions = await PositionsModel.find({ username });
  res.json(allPositions);
});

// Get User-specific Orders History
app.get("/allOrders", async (req, res) => {
  const username = req.authenticatedUsername;
  let allOrders = await OrdersModel.find({ username });
  res.json(allOrders);
});

// Transaction buy/sell execution
app.post("/newOrder", async (req, res) => {
  try {
    const { username, name, qty, price, mode } = req.body;
    if (!username) {
      return res.status(400).json({ success: false, error: "Username is required for transactions" });
    }
    if (!name || !qty || !price || !mode) {
      return res.status(400).json({ success: false, error: "Missing required order details" });
    }

    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const transactionCost = Number(qty) * Number(price);

    if (mode === "BUY") {
      if (user.funds < transactionCost) {
        return res.status(400).json({ success: false, error: "Insufficient funds in your virtual wallet" });
      }

      // Deduct funds
      user.funds -= transactionCost;
      await user.save();

      // Update holdings
      let holding = await HoldingsModel.findOne({ username, name });
      if (holding) {
        const newQty = holding.qty + Number(qty);
        const newAvg = ((holding.avg * holding.qty) + (Number(price) * Number(qty))) / newQty;
        holding.qty = newQty;
        holding.avg = newAvg;
        holding.price = Number(price);
        await holding.save();
      } else {
        const newHolding = new HoldingsModel({
          username,
          name,
          qty: Number(qty),
          avg: Number(price),
          price: Number(price),
          net: "+0.00%",
          day: "+0.00%",
        });
        await newHolding.save();
      }
    } else if (mode === "SELL") {
      let holding = await HoldingsModel.findOne({ username, name });
      if (!holding || holding.qty < Number(qty)) {
        return res.status(400).json({ success: false, error: `You do not own enough shares of ${name} to sell` });
      }

      // Add funds
      user.funds += transactionCost;
      await user.save();

      // Deduct quantity
      holding.qty -= Number(qty);
      if (holding.qty === 0) {
        await HoldingsModel.deleteOne({ username, name });
      } else {
        await holding.save();
      }
    } else {
      return res.status(400).json({ success: false, error: "Invalid transaction mode (must be BUY or SELL)" });
    }

    // Save order history
    const order = new OrdersModel({
      username,
      name,
      qty: Number(qty),
      price: Number(price),
      mode,
    });
    await order.save();

    res.status(200).json({ success: true, message: "Order processed successfully!", funds: user.funds });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Virtual Wallet – Add / Withdraw Funds ─────────────────────────────────
app.post("/updateFunds", async (req, res) => {
  try {
    const { username, amount, type } = req.body; // type: "add" | "withdraw"
    if (!username || !amount || !type) {
      return res.status(400).json({ success: false, error: "username, amount and type are required" });
    }
    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) {
      return res.status(400).json({ success: false, error: "Amount must be a positive number" });
    }
    if (amt > 5000000) { // ₹50 lakh cap per transaction
      return res.status(400).json({ success: false, error: "Maximum ₹50,00,000 per transaction" });
    }
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    if (type === "add") {
      user.funds = (user.funds || 0) + amt;
    } else if (type === "withdraw") {
      if ((user.funds || 0) < amt) {
        return res.status(400).json({ success: false, error: "Insufficient funds to withdraw" });
      }
      user.funds -= amt;
    } else {
      return res.status(400).json({ success: false, error: "type must be 'add' or 'withdraw'" });
    }
    await user.save();
    res.json({ success: true, funds: user.funds });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Live individual stock prices for Holdings P&L ───────────────────────────
// Maps NSE symbols to Yahoo Finance format (Indian stocks use .NS suffix)
const priceCache = {}; // { "INFY": { price: 1620.5, ts: 1234567890 } }
const PRICE_CACHE_TTL = 60000; // 60 seconds

app.get("/livePrices", async (req, res) => {
  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: "symbols required" });

  const symbolList = [...new Set(symbols.split(",").map((s) => s.trim()).filter(Boolean))];
  const prices = await getLivePrices(symbolList, priceCache, PRICE_CACHE_TTL);
  res.set("X-Live-Price-Count", String(Object.keys(prices).length));
  res.json(prices);
});

// Live market data — Nifty 50 & Sensex via Yahoo Finance (no API key required)
const marketCache = { nifty: null, sensex: null, updatedAt: 0 };

async function fetchYahoo(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1m&range=1d`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`Yahoo ${symbol} ${res.status}`);
  const data = await res.json();
  const meta = data?.chart?.result?.[0]?.meta;
  return {
    price: meta?.regularMarketPrice ?? null,
    prevClose: meta?.chartPreviousClose ?? null,
  };
}

app.get("/marketdata", async (req, res) => {
  const now = Date.now();
  // Cache for 60 seconds to avoid hammering Yahoo Finance
  if (marketCache.nifty && now - marketCache.updatedAt < 60000) {
    return res.json(marketCache);
  }
  try {
    const [nifty, sensex] = await Promise.all([
      fetchYahoo("^NSEI"),
      fetchYahoo("^BSESN"),
    ]);
    const change = (val, prev) => prev ? (((val - prev) / prev) * 100).toFixed(2) : "0.00";
    marketCache.nifty  = { price: nifty.price,  change: change(nifty.price, nifty.prevClose),   isDown: nifty.price < nifty.prevClose };
    marketCache.sensex = { price: sensex.price, change: change(sensex.price, sensex.prevClose), isDown: sensex.price < sensex.prevClose };
    marketCache.updatedAt = now;
    res.json(marketCache);
  } catch (err) {
    // Return last cached values or safe fallback — never crash the dashboard
    console.error("Market data unavailable:", err.message);
    res.status(503).json(marketCache.nifty ? { ...marketCache, source: "cached", error: "Yahoo Finance unavailable" } : { source: "unavailable", error: "Yahoo Finance unavailable", nifty: { price: "N/A", change: "--", isDown: false }, sensex: { price: "N/A", change: "--", isDown: false } });
  }
});

app.listen(PORT, () => {
  console.log("App started!");
  mongoose.connect(uri)
    .then(() => console.log("DB connected!"))
    .catch((err) => console.error("DB connection failed:", err.message));
});
