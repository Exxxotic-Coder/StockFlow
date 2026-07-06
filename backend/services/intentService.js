// backend/services/intentService.js
//
// Rule-based (regex) natural-language intent detection for the chatbot.
// This is intentionally simple, dependency-free, and fully local:
// no LangChain, no vector DB, no RAG, no external NLP calls.
//
// parseIntent(message) returns:
//   { type: "GENERAL" }                                  -> forward straight to Gemini
//   { type: "<INVENTORY_INTENT>", params: {...} }         -> query/update MongoDB first

const NUM = "([0-9]+(?:\\.[0-9]+)?)";
const NAME = "([A-Za-z][A-Za-z0-9&.\\-]*(?:\\s+[A-Za-z0-9&.\\-]+){0,3})";
// Non-greedy variant: used where the name is followed by optional filler
// words (e.g. "stock"/"holding"/"quantity") so those don't get swallowed
// into the captured name.
const NAME_LAZY = "([A-Za-z][A-Za-z0-9&.\\-]*(?:\\s+[A-Za-z0-9&.\\-]+){0,3}?)";

function clean(str) {
  return str ? str.trim().replace(/[?.!,]+$/g, "") : str;
}

function parseIntent(rawMessage) {
  const original = (rawMessage || "").trim();
  // Case is preserved (so captured stock names keep their original casing);
  // matching is done case-insensitively via the "i" flag. Trailing
  // punctuation and extra whitespace are stripped so anchored patterns
  // tolerate question marks and stray spaces.
  const m = original.replace(/[?.!,]+$/g, "").replace(/\s+/g, " ").trim();

  // ---------- Write / CRUD intents (checked first, more specific) ----------

  let match;

  match = m.match(new RegExp(`^(?:add|increase)\\s+${NUM}\\s+(?:units?|shares?)?\\s*(?:to|in)\\s+${NAME}$`, "i"));
  if (match) return { type: "ADD_QTY", params: { amount: Number(match[1]), name: clean(match[2]) } };

  match = m.match(new RegExp(`^increase\\s+${NAME_LAZY}\\s*(?:stock|holding)?\\s*(?:quantity|qty)?\\s*by\\s+${NUM}$`, "i"));
  if (match) return { type: "ADD_QTY", params: { name: clean(match[1]), amount: Number(match[2]) } };

  match = m.match(new RegExp(`^(?:reduce|decrease)\\s+${NAME_LAZY}\\s*(?:stock|holding)?\\s*(?:quantity|qty)?\\s*by\\s+${NUM}$`, "i"));
  if (match) return { type: "REDUCE_QTY", params: { name: clean(match[1]), amount: Number(match[2]) } };

  match = m.match(new RegExp(`^(?:reduce|decrease)\\s+${NUM}\\s+(?:units?|shares?)?\\s*(?:from|of)\\s+${NAME}$`, "i"));
  if (match) return { type: "REDUCE_QTY", params: { amount: Number(match[1]), name: clean(match[2]) } };

  match = m.match(new RegExp(`^set\\s+${NAME}\\s*quantity\\s*to\\s+${NUM}$`, "i"));
  if (match) return { type: "SET_QTY", params: { name: clean(match[1]), amount: Number(match[2]) } };

  match = m.match(new RegExp(`^update\\s+price\\s+of\\s+${NAME}\\s+to\\s+(?:rs\\.?|inr|₹)?\\s*${NUM}$`, "i"));
  if (match) return { type: "UPDATE_PRICE", params: { name: clean(match[1]), price: Number(match[2]) } };

  match = m.match(new RegExp(`^rename\\s+${NAME}\\s+to\\s+${NAME}$`, "i"));
  if (match) return { type: "RENAME_HOLDING", params: { name: clean(match[1]), newName: clean(match[2]) } };

  match = m.match(new RegExp(`^delete\\s+(?:holding\\s+)?${NAME}$`, "i"));
  if (match) return { type: "DELETE_HOLDING", params: { name: clean(match[1]) } };

  if (/^create\s+(?:a\s+|new\s+)*holding\b/i.test(m)) {
    const nameM = original.match(/name[:\s]+([A-Za-z0-9&.\-]+)/i);
    const qtyM = original.match(/qty[:\s]+([0-9]+)/i) || original.match(/quantity[:\s]+([0-9]+)/i);
    const avgM = original.match(/avg[:\s]+([0-9.]+)/i) || original.match(/average[:\s]+([0-9.]+)/i);
    const priceM = original.match(/price[:\s]+([0-9.]+)/i);
    return {
      type: "CREATE_HOLDING",
      params: {
        name: nameM ? clean(nameM[1]) : null,
        qty: qtyM ? Number(qtyM[1]) : 0,
        avg: avgM ? Number(avgM[1]) : 0,
        price: priceM ? Number(priceM[1]) : 0,
      },
    };
  }

  // ---------- Read / query intents ----------

  match = m.match(new RegExp(`average\\s+(?:buy\\s+)?price\\s+of\\s+${NAME}$`, "i"));
  if (match) return { type: "AVERAGE_BUY_PRICE", params: { name: clean(match[1]) } };

  match = m.match(new RegExp(`(?:stock|quantity)\\s+of\\s+${NAME}$`, "i"));
  if (match) return { type: "STOCK_OF", params: { name: clean(match[1]) } };

  match = m.match(new RegExp(`how\\s+much\\s+(?:does\\s+)?${NAME}\\s+cost$`, "i"));
  if (match) return { type: "COST_OF", params: { name: clean(match[1]) } };

  match = m.match(new RegExp(`(?:price|cost)\\s+of\\s+${NAME}$`, "i"));
  if (match) return { type: "COST_OF", params: { name: clean(match[1]) } };

  match = m.match(new RegExp(`search\\s+(?:for\\s+)?(?:a\\s+)?holding(?:s)?(?:\\s+(?:by|named|for|name))?\\s+${NAME}$`, "i"));
  if (match) return { type: "SEARCH_HOLDING", params: { name: clean(match[1]) } };

  match = m.match(new RegExp(`find\\s+holding(?:s)?\\s+${NAME}$`, "i"));
  if (match) return { type: "SEARCH_HOLDING", params: { name: clean(match[1]) } };

  match = m.match(new RegExp(`holdings?\\s+(?:above|over|greater than)\\s+(?:rs\\.?|inr|₹)?\\s*${NUM}`, "i"));
  if (match) return { type: "HOLDINGS_ABOVE_VALUE", params: { threshold: Number(match[1]) } };

  match = m.match(new RegExp(`holdings?\\s+(?:below|under|less than)\\s+${NUM}`, "i"));
  if (match) return { type: "HOLDINGS_BELOW_QTY", params: { threshold: Number(match[1]) } };

  if (/how many holdings/i.test(m)) return { type: "COUNT_HOLDINGS" };

  if (/highest.*quantity|maximum.*quantity|most.*quantity|largest.*quantity/i.test(m)) {
    return { type: "HIGHEST_QTY_HOLDING" };
  }
  if (/lowest.*quantity|minimum.*quantity|least.*quantity|smallest.*quantity/i.test(m)) {
    return { type: "LOWEST_QTY_HOLDING" };
  }
  if (/highest.*(price|value)|most expensive|maximum.*price/i.test(m)) {
    return { type: "HIGHEST_PRICE_HOLDING" };
  }
  if (/lowest.*(price|value)|cheapest|minimum.*price/i.test(m)) {
    return { type: "LOWEST_PRICE_HOLDING" };
  }

  if (/total investment/i.test(m)) return { type: "TOTAL_INVESTMENT" };
  if (/portfolio value|current value of.*portfolio/i.test(m)) return { type: "PORTFOLIO_VALUE" };
  if (/today'?s?\s*(p ?& ?l|p ?and ?l|pnl|profit\s*(and|\/)?\s*loss)/i.test(m)) return { type: "TODAYS_PNL" };

  if (/^(show|list|view)\s+(all\s+)?(my\s+)?holdings?$/i.test(m) || /^holdings$/i.test(m)) {
    return { type: "SHOW_ALL_HOLDINGS" };
  }
  if (/^(show|list|view)\s+(all\s+)?(my\s+)?positions?$/i.test(m) || /^positions$/i.test(m)) {
    return { type: "SHOW_ALL_POSITIONS" };
  }
  if (/^(show|list|view)\s+(all\s+)?(my\s+)?orders?$/i.test(m) || /order history/i.test(m) || /^orders$/i.test(m)) {
    return { type: "SHOW_ALL_ORDERS" };
  }

  // Fallback: general knowledge / conversational question, forward to Gemini directly
  return { type: "GENERAL" };
}

module.exports = { parseIntent };
