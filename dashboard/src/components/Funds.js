import React, { useState, useEffect } from "react";
import axios from "axios";

const Funds = () => {
  const [funds, setFunds] = useState(0);
  const [usedMargin, setUsedMargin] = useState(0);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [modal, setModal] = useState(null); // null | "add" | "withdraw" | "commodity"
  const [inputAmount, setInputAmount] = useState("");
  const [modalMsg, setModalMsg] = useState({ text: "", type: "" }); // type: success | error

  const username = localStorage.getItem("username");

  const fetchFunds = () => {
    if (!username) return;
    axios.get(`/funds?username=${username}`).then((res) => {
      if (res.data?.funds !== undefined) setFunds(res.data.funds);
    }).catch(() => {});

    axios.get(`/allHoldings?username=${username}`).then((res) => {
      if (Array.isArray(res.data)) {
        const used = res.data.reduce((sum, s) => sum + s.avg * s.qty, 0);
        setUsedMargin(used);
      }
    }).catch(() => {});
  };

  useEffect(() => { fetchFunds(); }, []);

  const fmt = (val) =>
    Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const openModal = (type) => {
    setModal(type);
    setInputAmount("");
    setModalMsg({ text: "", type: "" });
  };

  const closeModal = () => {
    setModal(null);
    setInputAmount("");
    setModalMsg({ text: "", type: "" });
  };

  const handleTransaction = () => {
    const amt = Number(inputAmount);
    if (!amt || amt <= 0) {
      setModalMsg({ text: "Please enter a valid amount.", type: "error" });
      return;
    }
    if (modal === "withdraw" && amt > funds) {
      setModalMsg({ text: "Amount exceeds available balance.", type: "error" });
      return;
    }
    setLoading(true);
    axios
      .post("/updateFunds", { username, amount: amt, type: modal })
      .then((res) => {
        if (res.data.success) {
          setFunds(res.data.funds);
          setModalMsg({
            text: `₹${fmt(amt)} ${modal === "add" ? "added" : "withdrawn"} successfully!`,
            type: "success",
          });
          setInputAmount("");
          // Auto-close after 1.5 sec
          setTimeout(closeModal, 1500);
        } else {
          setModalMsg({ text: res.data.error || "Transaction failed.", type: "error" });
        }
      })
      .catch((err) => {
        setModalMsg({ text: err.response?.data?.error || "Server error. Try again.", type: "error" });
      })
      .finally(() => setLoading(false));
  };

  const quickAmounts = [10000, 25000, 50000, 100000];

  return (
    <>
      {/* ── Top action bar ── */}
      <div className="funds">
        <p>Instant, virtual fund transfers</p>
        <button
          className="btn btn-green"
          onClick={() => openModal("add")}
          style={{ cursor: "pointer", border: "none" }}
        >
          + Add funds
        </button>
        <button
          className="btn btn-blue"
          onClick={() => openModal("withdraw")}
          style={{ cursor: "pointer", border: "none" }}
        >
          ↑ Withdraw
        </button>
      </div>

      {/* ── Main content ── */}
      <div className="row">
        {/* Equity section */}
        <div className="col">
          <span><p>Equity</p></span>
          <div className="table">
            <div className="data">
              <p>Available margin</p>
              <p className="imp colored">₹ {fmt(funds)}</p>
            </div>
            <div className="data">
              <p>Used margin</p>
              <p className="imp">₹ {fmt(usedMargin)}</p>
            </div>
            <div className="data">
              <p>Available cash</p>
              <p className="imp">₹ {fmt(funds)}</p>
            </div>
            <hr />
            <div className="data">
              <p>Opening Balance</p>
              <p>₹ {fmt(funds + usedMargin)}</p>
            </div>
            <div className="data"><p>Payin</p><p>₹ 0.00</p></div>
            <div className="data"><p>SPAN</p><p>₹ 0.00</p></div>
            <div className="data"><p>Delivery margin</p><p>₹ 0.00</p></div>
            <div className="data"><p>Exposure</p><p>₹ 0.00</p></div>
            <div className="data"><p>Options premium</p><p>₹ 0.00</p></div>
            <hr />
            <div className="data"><p>Collateral (Liquid funds)</p><p>₹ 0.00</p></div>
            <div className="data"><p>Collateral (Equity)</p><p>₹ 0.00</p></div>
            <div className="data"><p>Total Collateral</p><p>₹ 0.00</p></div>
          </div>
        </div>

        {/* Commodity section */}
        <div className="col">
          <div className="commodity">
            <p>Commodity trading is not available in virtual mode</p>
            <button
              className="btn btn-blue"
              onClick={() => openModal("commodity")}
              style={{ cursor: "pointer", border: "none", marginTop: "10px" }}
            >
              Learn more
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal overlay ── */}
      {modal && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
            zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: "12px", padding: "28px 32px",
              width: "380px", boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
            }}
          >
            {/* ── Commodity info modal ── */}
            {modal === "commodity" ? (
              <>
                <h3 style={{ marginBottom: "12px", fontSize: "1.1rem" }}>
                  🏭 Commodity Trading
                </h3>
                <p style={{ color: "#555", fontSize: "0.9rem", lineHeight: 1.6 }}>
                  Commodity trading (MCX – Gold, Silver, Crude Oil, etc.) is a real feature
                  on platforms like Zerodha Kite. In TradeX's virtual mode, only equity
                  (NSE/BSE stocks) is supported.
                </p>
                <p style={{ color: "#888", fontSize: "0.8rem", marginTop: "12px" }}>
                  This section is kept for UI completeness and learning purposes.
                </p>
                <button
                  onClick={closeModal}
                  style={{
                    marginTop: "20px", width: "100%", padding: "10px",
                    background: "#4184f3", color: "#fff", border: "none",
                    borderRadius: "6px", cursor: "pointer", fontWeight: 600,
                  }}
                >
                  Got it
                </button>
              </>
            ) : (
              /* ── Add / Withdraw modal ── */
              <>
                <h3 style={{ marginBottom: "4px", fontSize: "1.1rem" }}>
                  {modal === "add" ? "➕ Add Virtual Funds" : "⬆️ Withdraw Funds"}
                </h3>
                <p style={{ color: "#888", fontSize: "0.8rem", marginBottom: "18px" }}>
                  Available balance: <strong style={{ color: "#4184f3" }}>₹ {fmt(funds)}</strong>
                </p>

                {/* Quick amount buttons */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
                  {quickAmounts.map((a) => (
                    <button
                      key={a}
                      onClick={() => setInputAmount(String(a))}
                      style={{
                        padding: "5px 10px", fontSize: "0.78rem", cursor: "pointer",
                        background: inputAmount === String(a) ? "#4184f3" : "#f0f4ff",
                        color: inputAmount === String(a) ? "#fff" : "#4184f3",
                        border: "1px solid #c5d4f5", borderRadius: "4px", fontWeight: 600,
                      }}
                    >
                      ₹{(a / 1000).toFixed(0)}K
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  min="1"
                  max="5000000"
                  placeholder="Enter amount (₹)"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  style={{
                    width: "100%", padding: "10px 12px", fontSize: "1rem",
                    border: "1px solid #ddd", borderRadius: "6px",
                    outline: "none", boxSizing: "border-box",
                  }}
                />

                {modalMsg.text && (
                  <p style={{
                    marginTop: "10px", fontSize: "0.82rem",
                    color: modalMsg.type === "success" ? "#4caf50" : "#e53935",
                    fontWeight: 500,
                  }}>
                    {modalMsg.type === "success" ? "✅ " : "❌ "}{modalMsg.text}
                  </p>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
                  <button
                    onClick={handleTransaction}
                    disabled={loading}
                    style={{
                      flex: 1, padding: "10px", border: "none", borderRadius: "6px",
                      background: modal === "add" ? "#4caf50" : "#4184f3",
                      color: "#fff", cursor: loading ? "not-allowed" : "pointer",
                      fontWeight: 600, fontSize: "0.95rem", opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? "Processing…" : modal === "add" ? "Add Funds" : "Withdraw"}
                  </button>
                  <button
                    onClick={closeModal}
                    style={{
                      flex: 1, padding: "10px", border: "1px solid #ddd",
                      borderRadius: "6px", background: "#fff", cursor: "pointer",
                      fontWeight: 600, fontSize: "0.95rem", color: "#555",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Funds;
