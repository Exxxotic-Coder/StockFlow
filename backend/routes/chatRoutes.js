// backend/routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const { handleChat } = require("../controllers/chatController");

router.post("/api/chat", handleChat);

module.exports = router;
