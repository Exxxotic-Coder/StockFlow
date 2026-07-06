// backend/services/positionsOrdersService.js
//
// Read-only data access for Positions and Orders, reusing the existing
// PositionsModel / OrdersModel. No new collections, no schema changes.

const { PositionsModel } = require("../model/PositionsModel");
const { OrdersModel } = require("../model/OrdersModel");

async function getAllPositions(username) {
  return PositionsModel.find({ username });
}

async function getAllOrders(username) {
  return OrdersModel.find({ username });
}

async function countOrders(username) {
  return OrdersModel.countDocuments({ username });
}

module.exports = { getAllPositions, getAllOrders, countOrders };
