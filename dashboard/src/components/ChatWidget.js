import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

// Floating AI inventory/portfolio assistant.
// Self-contained: does not touch existing routes, auth, or pages.
const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm your StockFlow assistant. Ask me about your holdings, positions, orders, or anything else \u2014 e.g. \"Show all holdings\" or \"What is my total investment?\"",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage = { role: "user", text: trimmed, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await axios.post("/api/chat", {
        message: trimmed,
        history: messages.slice(-8).map((msg) => `${msg.role}: ${msg.text}`),
      });
      const replyText =
        res?.data?.reply || "Sorry, I didn't get a response. Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: replyText, timestamp: new Date() },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "⚠️ AI assistant is currently unavailable. This usually means the Gemini API key needs to be set up in the backend `.env` file. Please contact the administrator or check the backend configuration.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    // Shift+Enter falls through and inserts a newline naturally (textarea default)
  };

  const styles = {
    launcher: {
      position: "fixed",
      bottom: "24px",
      right: "24px",
      width: "56px",
      height: "56px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #155EEF, #14B8A6)",
      color: "#fff",
      border: "none",
      cursor: "pointer",
      boxShadow: "0 6px 18px rgba(21, 94, 239, 0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "26px",
      zIndex: 9999,
    },
    window: {
      position: "fixed",
      bottom: "24px",
      right: "24px",
      width: "340px",
      height: isMinimized ? "56px" : "480px",
      background: "#fff",
      borderRadius: "14px",
      boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      zIndex: 9999,
      fontFamily: "Arial, Helvetica, sans-serif",
      transition: "height 0.2s ease",
    },
    header: {
      background: "linear-gradient(135deg, #155EEF, #14B8A6)",
      color: "#fff",
      padding: "12px 14px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0,
    },
    headerTitle: { fontSize: "15px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" },
    headerButtons: { display: "flex", gap: "8px" },
    iconBtn: {
      background: "rgba(255,255,255,0.18)",
      border: "none",
      color: "#fff",
      width: "24px",
      height: "24px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "13px",
      lineHeight: "24px",
      padding: 0,
    },
    body: {
      flex: 1,
      overflowY: "auto",
      padding: "12px",
      background: "#F7F9FC",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },
    bubbleRow: (isUser) => ({
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
    }),
    bubble: (isUser) => ({
      maxWidth: "78%",
      padding: "8px 12px",
      borderRadius: isUser ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
      background: isUser ? "linear-gradient(135deg, #155EEF, #14B8A6)" : "#fff",
      color: isUser ? "#fff" : "#1F2937",
      fontSize: "13.5px",
      lineHeight: "1.4",
      whiteSpace: "pre-wrap",
      boxShadow: isUser ? "none" : "0 1px 3px rgba(0,0,0,0.08)",
    }),
    timestamp: (isUser) => ({
      fontSize: "10px",
      color: "#9AA3B2",
      marginTop: "3px",
      textAlign: isUser ? "right" : "left",
    }),
    footer: {
      display: "flex",
      alignItems: "flex-end",
      gap: "8px",
      padding: "10px",
      borderTop: "1px solid #EEF1F5",
      flexShrink: 0,
      background: "#fff",
    },
    textarea: {
      flex: 1,
      resize: "none",
      border: "1px solid #E1E5EB",
      borderRadius: "10px",
      padding: "8px 10px",
      fontSize: "13.5px",
      fontFamily: "inherit",
      maxHeight: "80px",
      outline: "none",
    },
    sendBtn: {
      background: "linear-gradient(135deg, #155EEF, #14B8A6)",
      border: "none",
      color: "#fff",
      borderRadius: "10px",
      padding: "8px 14px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: 600,
    },
    typingDots: { fontSize: "13px", color: "#9AA3B2", padding: "4px 0" },
  };

  if (!isOpen) {
    return (
      <button
        style={styles.launcher}
        onClick={() => setIsOpen(true)}
        aria-label="Open StockFlow Assistant"
        title="StockFlow Assistant"
      >
        💬
      </button>
    );
  }

  return (
    <div style={styles.window}>
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <span>🤖</span>
          <span>StockFlow Assistant</span>
        </div>
        <div style={styles.headerButtons}>
          <button
            style={styles.iconBtn}
            onClick={() => setIsMinimized((v) => !v)}
            title={isMinimized ? "Expand" : "Minimize"}
            aria-label="Minimize chat"
          >
            {isMinimized ? "▢" : "—"}
          </button>
          <button
            style={styles.iconBtn}
            onClick={() => setIsOpen(false)}
            title="Close"
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div style={styles.body}>
            {messages.map((msg, idx) => (
              <div key={idx} style={styles.bubbleRow(msg.role === "user")}>
                <div>
                  <div style={styles.bubble(msg.role === "user")}>{msg.text}</div>
                  <div style={styles.timestamp(msg.role === "user")}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={styles.bubbleRow(false)}>
                <div style={styles.bubble(false)}>
                  <span style={styles.typingDots}>Typing…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.footer}>
            <textarea
              style={styles.textarea}
              rows={1}
              placeholder="Ask about your holdings, orders…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button style={styles.sendBtn} onClick={sendMessage} disabled={isLoading}>
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWidget;
