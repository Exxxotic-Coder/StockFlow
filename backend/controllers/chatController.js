// backend/controllers/chatController.js
//
// Orchestrates the chatbot flow described in the spec:
//   1. Detect intent from the user's message (intentService, local regex only).
//   2. If it's an inventory/portfolio question or command, query/update
//      MongoDB directly (holdingsService / positionsOrdersService) — Gemini
//      never touches the database.
//   3. Send ONLY the minimum required result to Gemini so it can phrase a
//      friendly reply.
//   4. If it's a general knowledge question, forward it straight to Gemini.

const { parseIntent } = require("../services/intentService");
const { askGemini } = require("../services/geminiService");
const holdingsService = require("../services/holdingsService");
const positionsOrdersService = require("../services/positionsOrdersService");

const SYSTEM_PREAMBLE =
  "You are the StockFlow portfolio assistant, a helpful voice inside a stock " +
  "trading app. Answer the user's question in a friendly, concise way, " +
  "using ONLY the information provided below. Never invent numbers, stock " +
  "names, or facts that are not given to you. Use ₹ for currency amounts. " +
  "Keep the reply short (a few sentences, or a short bullet list).";

function formatHoldingLine(h) {
  return `${h.name}: qty ${h.qty}, avg ₹${Number(h.avg).toFixed(2)}, price ₹${Number(h.price).toFixed(2)}`;
}

function friendlyDbFallback(summaryText) {
  // Used only if Gemini itself is unreachable — the user still gets the
  // real data, just without the LLM's friendly phrasing.
  return `Here's what I found:\n${summaryText}`;
}

async function askGeminiSafely(userMessage, dataSummary) {
  const prompt = `${SYSTEM_PREAMBLE}\n\nUser asked:\n${userMessage}\n\nData:\n${dataSummary}\n\nNow write the reply.`;
  try {
    return await askGemini(prompt);
  } catch (err) {
    // Gemini failed (network/API) — degrade gracefully rather than crash.
    return friendlyDbFallback(dataSummary);
  }
}

async function handleGeneralQuestion(userMessage) {
  const prompt =
    `${SYSTEM_PREAMBLE}\n\nThis is a general question unrelated to the user's ` +
    `specific portfolio data. Answer it directly and helpfully.\n\nUser asked:\n${userMessage}`;
  try {
    const reply = await askGemini(prompt);
    return reply;
  } catch (err) {
    console.error("Gemini general chat error:", err);
    if (err.message.includes("GEMINI_API_ERROR")) {
      return `AI assistant error: ${err.message.replace("GEMINI_API_ERROR: ", "")}`;
    }
    return `I'm having trouble reaching the AI service right now. Details: ${err.message}`;
  }
}

async function handleChat(req, res) {
  try {
    const { message } = req.body || {};
    const username = req.body?.username || req.query?.username;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ reply: "Please type a message to send." });
    }

    const intent = parseIntent(message);

    // General knowledge / conversational — no DB involved at all.
    if (intent.type === "GENERAL") {
      const reply = await handleGeneralQuestion(message);
      return res.status(200).json({ reply });
    }

    // Every intent below needs to know whose portfolio we're looking at.
    if (!username) {
      return res.status(200).json({
        reply: "I couldn't tell which account this is for. Please log in and try again.",
      });
    }

    let dataSummary;
    let reply;

    switch (intent.type) {
      case "SHOW_ALL_HOLDINGS": {
        const holdings = await holdingsService.getAllHoldings(username);
        dataSummary = holdings.length
          ? holdings.map(formatHoldingLine).join("\n")
          : "No holdings found.";
        break;
      }

      case "SHOW_ALL_POSITIONS": {
        const positions = await positionsOrdersService.getAllPositions(username);
        dataSummary = positions.length
          ? positions
            .map((p) => `${p.name} (${p.product}): qty ${p.qty}, avg ₹${p.avg}, price ₹${p.price}`)
            .join("\n")
          : "No open positions found.";
        break;
      }

      case "SHOW_ALL_ORDERS": {
        const orders = await positionsOrdersService.getAllOrders(username);
        dataSummary = orders.length
          ? orders.map((o) => `${o.mode} ${o.qty} ${o.name} @ ₹${o.price}`).join("\n")
          : "No orders found.";
        break;
      }

      case "COUNT_HOLDINGS": {
        const count = await holdingsService.countHoldings(username);
        dataSummary = `Number of holdings: ${count}`;
        break;
      }

      case "HIGHEST_QTY_HOLDING": {
        const h = await holdingsService.getHighestQtyHolding(username);
        dataSummary = h ? formatHoldingLine(h) : "No holdings found.";
        break;
      }

      case "LOWEST_QTY_HOLDING": {
        const h = await holdingsService.getLowestQtyHolding(username);
        dataSummary = h ? formatHoldingLine(h) : "No holdings found.";
        break;
      }

      case "HIGHEST_PRICE_HOLDING": {
        const h = await holdingsService.getHighestPriceHolding(username);
        dataSummary = h ? formatHoldingLine(h) : "No holdings found.";
        break;
      }

      case "LOWEST_PRICE_HOLDING": {
        const h = await holdingsService.getLowestPriceHolding(username);
        dataSummary = h ? formatHoldingLine(h) : "No holdings found.";
        break;
      }

      case "TOTAL_INVESTMENT": {
        const total = await holdingsService.getTotalInvestment(username);
        dataSummary = `Total investment: ₹${total.toFixed(2)}`;
        break;
      }

      case "PORTFOLIO_VALUE": {
        const value = await holdingsService.getPortfolioValue(username);
        dataSummary = `Current portfolio value: ₹${value.toFixed(2)}`;
        break;
      }

      case "TODAYS_PNL": {
        const pnl = await holdingsService.getTodaysPnL(username);
        dataSummary = `Today's P&L: ${pnl >= 0 ? "+" : ""}₹${pnl.toFixed(2)}`;
        break;
      }

      case "AVERAGE_BUY_PRICE": {
        const result = await holdingsService.getAverageBuyPrice(username, intent.params.name);
        if (result.error === "NOT_FOUND") {
          reply = `No holding named "${intent.params.name}" exists.`;
        } else {
          dataSummary = `Average buy price of ${result.holding.name}: ₹${result.avg}`;
        }
        break;
      }

      case "STOCK_OF": {
        const holding = await holdingsService.findHoldingByName(username, intent.params.name);
        if (!holding) {
          reply = `No holding named "${intent.params.name}" exists.`;
        } else {
          dataSummary = `${holding.name} quantity: ${holding.qty}`;
        }
        break;
      }

      case "COST_OF": {
        const holding = await holdingsService.findHoldingByName(username, intent.params.name);
        if (!holding) {
          reply = `No holding named "${intent.params.name}" exists.`;
        } else {
          dataSummary = `${holding.name} current price: ₹${holding.price}`;
        }
        break;
      }

      case "SEARCH_HOLDING": {
        const matches = await holdingsService.searchHoldings(username, intent.params.name);
        dataSummary = matches.length
          ? matches.map(formatHoldingLine).join("\n")
          : `No holding matching "${intent.params.name}" was found.`;
        break;
      }

      case "HOLDINGS_ABOVE_VALUE": {
        const matches = await holdingsService.getHoldingsAboveValue(username, intent.params.threshold);
        dataSummary = matches.length
          ? matches.map(formatHoldingLine).join("\n")
          : `No holdings found above ₹${intent.params.threshold}.`;
        break;
      }

      case "HOLDINGS_BELOW_QTY": {
        const matches = await holdingsService.getHoldingsBelowQty(username, intent.params.threshold);
        dataSummary = matches.length
          ? matches.map(formatHoldingLine).join("\n")
          : `No holdings found below quantity ${intent.params.threshold}.`;
        break;
      }

      // ---------------- Write / CRUD intents ----------------

      case "ADD_QTY": {
        const { name, amount } = intent.params;
        if (!name || amount === undefined || isNaN(amount) || amount <= 0) {
          reply = "Please specify a valid holding name and a positive quantity.";
          break;
        }
        const result = await holdingsService.addQty(username, name, amount);
        if (result.error === "NOT_FOUND") {
          reply = `No holding named "${name}" exists.`;
        } else {
          dataSummary =
            `Holding updated successfully.\nHolding: ${result.holding.name}\n` +
            `New Quantity: ${result.holding.qty}`;
        }
        break;
      }

      case "REDUCE_QTY": {
        const { name, amount } = intent.params;
        if (!name || amount === undefined || isNaN(amount) || amount <= 0) {
          reply = "Please specify a valid holding name and a positive quantity.";
          break;
        }
        const result = await holdingsService.reduceQty(username, name, amount);
        if (result.error === "NOT_FOUND") {
          reply = `No holding named "${name}" exists.`;
        } else if (result.error === "NEGATIVE_STOCK") {
          reply = `That would take ${name}'s quantity below zero, so I didn't make the change. It currently has fewer units than that.`;
        } else {
          dataSummary =
            `Holding updated successfully.\nHolding: ${result.holding.name}\n` +
            `New Quantity: ${result.holding.qty}`;
        }
        break;
      }

      case "SET_QTY": {
        const { name, amount } = intent.params;
        if (!name || amount === undefined || isNaN(amount) || amount < 0) {
          reply = "Please specify a valid holding name and a non-negative quantity.";
          break;
        }
        const result = await holdingsService.setQty(username, name, amount);
        if (result.error === "NOT_FOUND") {
          reply = `No holding named "${name}" exists.`;
        } else {
          dataSummary = `Holding updated successfully.\nHolding: ${result.holding.name}\nNew Quantity: ${result.holding.qty}`;
        }
        break;
      }

      case "DELETE_HOLDING": {
        const { name } = intent.params;
        if (!name) {
          reply = "Please specify which holding to delete.";
          break;
        }
        const result = await holdingsService.deleteHolding(username, name);
        if (result.error === "NOT_FOUND") {
          reply = `No holding named "${name}" exists.`;
        } else {
          dataSummary = `Holding "${result.holding.name}" was deleted successfully.`;
        }
        break;
      }

      case "UPDATE_PRICE": {
        const { name, price } = intent.params;
        if (!name || price === undefined || isNaN(price) || price < 0) {
          reply = "Please specify a valid holding name and a non-negative price.";
          break;
        }
        const result = await holdingsService.updatePrice(username, name, price);
        if (result.error === "NOT_FOUND") {
          reply = `No holding named "${name}" exists.`;
        } else {
          dataSummary =
            `Price updated successfully.\nHolding: ${result.holding.name}\n` +
            `Old Price: ₹${result.oldPrice}\nNew Price: ₹${result.holding.price}`;
        }
        break;
      }

      case "RENAME_HOLDING": {
        const { name, newName } = intent.params;
        if (!name || !newName) {
          reply = "Please specify both the current holding name and the new name.";
          break;
        }
        const result = await holdingsService.renameHolding(username, name, newName);
        if (result.error === "NOT_FOUND") {
          reply = `No holding named "${name}" exists.`;
        } else {
          dataSummary = `Holding renamed successfully from "${result.oldName}" to "${result.holding.name}".`;
        }
        break;
      }

      case "CREATE_HOLDING": {
        const { name, qty, avg, price } = intent.params;
        if (!name) {
          reply =
            'Please tell me the holding name, e.g. "create holding name: TCS qty: 5 avg: 3000 price: 3200".';
          break;
        }
        const result = await holdingsService.createHolding(username, { name, qty, avg, price });
        if (result.error === "ALREADY_EXISTS") {
          reply = `A holding named "${name}" already exists.`;
        } else {
          dataSummary =
            `Holding created successfully.\nHolding: ${result.holding.name}\n` +
            `Quantity: ${result.holding.qty}\nAvg: ₹${result.holding.avg}\nPrice: ₹${result.holding.price}`;
        }
        break;
      }

      default: {
        // Shouldn't happen, but fail safe by forwarding to general Q&A.
        reply = await handleGeneralQuestion(message);
      }
    }

    // If a validation/error message was already set above, return it as-is
    // (no need to spend a Gemini call phrasing a fixed message).
    if (reply) {
      return res.status(200).json({ reply });
    }

    reply = await askGeminiSafely(message, dataSummary);
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(200).json({
      reply: "Something went wrong while processing your request. Please try again.",
    });
  }
}

module.exports = { handleChat };
