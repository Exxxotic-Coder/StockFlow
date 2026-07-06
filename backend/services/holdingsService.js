// backend/services/holdingsService.js
//
// All direct MongoDB access for the Holdings collection used by the chatbot.
// Reuses the existing HoldingsModel/HoldingsSchema — no new collections,
// no schema changes.

const { HoldingsModel } = require("../model/HoldingsModel");

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function getAllHoldings(username) {
  return HoldingsModel.find({ username });
}

async function countHoldings(username) {
  return HoldingsModel.countDocuments({ username });
}

async function findHoldingByName(username, name) {
  if (!name) return null;
  return HoldingsModel.findOne({
    username,
    name: new RegExp(`^${escapeRegex(name)}$`, "i"),
  });
}

async function searchHoldings(username, query) {
  if (!query) return [];
  return HoldingsModel.find({
    username,
    name: new RegExp(escapeRegex(query), "i"),
  });
}

async function getHighestQtyHolding(username) {
  const all = await getAllHoldings(username);
  if (!all.length) return null;
  return all.reduce((max, h) => (h.qty > max.qty ? h : max), all[0]);
}

async function getLowestQtyHolding(username) {
  const all = await getAllHoldings(username);
  if (!all.length) return null;
  return all.reduce((min, h) => (h.qty < min.qty ? h : min), all[0]);
}

async function getHighestPriceHolding(username) {
  const all = await getAllHoldings(username);
  if (!all.length) return null;
  return all.reduce((max, h) => (h.price > max.price ? h : max), all[0]);
}

async function getLowestPriceHolding(username) {
  const all = await getAllHoldings(username);
  if (!all.length) return null;
  return all.reduce((min, h) => (h.price < min.price ? h : min), all[0]);
}

async function getTotalInvestment(username) {
  const all = await getAllHoldings(username);
  return all.reduce((sum, h) => sum + (h.avg || 0) * (h.qty || 0), 0);
}

async function getPortfolioValue(username) {
  const all = await getAllHoldings(username);
  return all.reduce((sum, h) => sum + (h.price || 0) * (h.qty || 0), 0);
}

async function getTodaysPnL(username) {
  const investment = await getTotalInvestment(username);
  const value = await getPortfolioValue(username);
  return value - investment;
}

async function getHoldingsAboveValue(username, threshold) {
  const all = await getAllHoldings(username);
  return all.filter((h) => (h.price || 0) * (h.qty || 0) > threshold);
}

async function getHoldingsBelowQty(username, threshold) {
  const all = await getAllHoldings(username);
  return all.filter((h) => (h.qty || 0) < threshold);
}

async function addQty(username, name, amount) {
  const holding = await findHoldingByName(username, name);
  if (!holding) return { error: "NOT_FOUND" };
  holding.qty = (holding.qty || 0) + amount;
  await holding.save();
  return { holding };
}

async function reduceQty(username, name, amount) {
  const holding = await findHoldingByName(username, name);
  if (!holding) return { error: "NOT_FOUND" };
  if (holding.qty - amount < 0) return { error: "NEGATIVE_STOCK" };
  holding.qty -= amount;
  await holding.save();
  return { holding };
}

async function setQty(username, name, amount) {
  const holding = await findHoldingByName(username, name);
  if (!holding) return { error: "NOT_FOUND" };
  if (amount < 0) return { error: "NEGATIVE_STOCK" };
  holding.qty = amount;
  await holding.save();
  return { holding };
}

async function deleteHolding(username, name) {
  const holding = await findHoldingByName(username, name);
  if (!holding) return { error: "NOT_FOUND" };
  await HoldingsModel.deleteOne({ _id: holding._id });
  return { holding };
}

async function updatePrice(username, name, newPrice) {
  const holding = await findHoldingByName(username, name);
  if (!holding) return { error: "NOT_FOUND" };
  const oldPrice = holding.price;
  holding.price = newPrice;
  await holding.save();
  return { holding, oldPrice };
}

async function renameHolding(username, name, newName) {
  const holding = await findHoldingByName(username, name);
  if (!holding) return { error: "NOT_FOUND" };
  const oldName = holding.name;
  holding.name = newName;
  await holding.save();
  return { holding, oldName };
}

async function createHolding(username, { name, qty, avg, price }) {
  const existing = await findHoldingByName(username, name);
  if (existing) return { error: "ALREADY_EXISTS" };
  const holding = new HoldingsModel({
    username,
    name,
    qty: qty || 0,
    avg: avg || 0,
    price: price || 0,
    net: "+0.00%",
    day: "+0.00%",
  });
  await holding.save();
  return { holding };
}

async function getAverageBuyPrice(username, name) {
  const holding = await findHoldingByName(username, name);
  if (!holding) return { error: "NOT_FOUND" };
  return { avg: holding.avg, holding };
}

module.exports = {
  getAllHoldings,
  countHoldings,
  findHoldingByName,
  searchHoldings,
  getHighestQtyHolding,
  getLowestQtyHolding,
  getHighestPriceHolding,
  getLowestPriceHolding,
  getTotalInvestment,
  getPortfolioValue,
  getTodaysPnL,
  getHoldingsAboveValue,
  getHoldingsBelowQty,
  addQty,
  reduceQty,
  setQty,
  deleteHolding,
  updatePrice,
  renameHolding,
  createHolding,
  getAverageBuyPrice,
};
