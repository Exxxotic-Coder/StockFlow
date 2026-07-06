const { Schema } = require("mongoose");

const OrdersSchema = new Schema({
  username: String,
  name: String,
  qty: Number,
  price: Number,
  mode: String,
});

module.exports = { OrdersSchema };
