// backend/routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const { handleChat } = require("../controllers/chatController");
const { requireAuth } = require("../middleware/auth");

router.post("/api/chat", requireAuth, handleChat);

module.exports = router;
