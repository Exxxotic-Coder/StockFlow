const { Schema } = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  funds: {
    type: Number,
    default: 1000000, // ₹10 Lakh virtual wallet starting funds
  },
});

UserSchema.plugin(passportLocalMongoose);

module.exports = { UserSchema };
