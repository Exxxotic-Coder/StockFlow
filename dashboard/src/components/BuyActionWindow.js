import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import "./BuyActionWindow.css";
import { watchlist } from "../data/data";

const BuyActionWindow = ({ uid, mode = "BUY" }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  
  // Pre-populate price from watchlist if available
  const matchingStock = watchlist.find((s) => s.name === uid);
  const initialPrice = matchingStock ? matchingStock.price : 0.0;

  const [stockPrice, setStockPrice] = useState(initialPrice);
  const [errorMsg, setErrorMsg] = useState("");
  const generalContext = useContext(GeneralContext);

  useEffect(() => {
    axios.get(`/livePrices?symbols=${encodeURIComponent(uid)}`)
      .then((res) => {
        if (res.data?.[uid] !== undefined) setStockPrice(res.data[uid]);
      })
      .catch(() => {});
  }, [uid]);

  const handleTransactionClick = () => {
    setErrorMsg("");
    const username = localStorage.getItem("username");
    if (!username) {
      setErrorMsg("Session expired. Please log in again.");
      return;
    }

    axios
      .post("/newOrder", {
        username,
        name: uid,
        qty: stockQuantity,
        price: stockPrice,
        mode: mode,
      })
      .then((res) => {
        if (res.data.success) {
          generalContext.closeBuyWindow();
          // Reload the page to refresh holdings and funds in real-time
          window.location.reload();
        } else {
          setErrorMsg(res.data.error || "Transaction failed.");
        }
      })
      .catch((err) => {
        setErrorMsg(
          err.response?.data?.error || "Error executing stock order."
        );
      });
  };

  const handleCancelClick = () => {
    generalContext.closeBuyWindow();
  };

  return (
    <div className="container" id="buy-window" draggable="true" style={{ height: "auto", minHeight: "300px" }}>
      <div className="header" style={{ backgroundColor: mode === "BUY" ? "#4184f3" : "#df514c", padding: "12px 20px" }}>
        <h3 style={{ margin: 0, color: "#fff", fontSize: "1.1rem" }}>
          {mode === "BUY" ? "Buy" : "Sell"} {uid}
        </h3>
      </div>

      <div className="regular-order" style={{ padding: "20px" }}>
        {errorMsg && (
          <div style={{ color: "#df514c", fontWeight: "600", fontSize: "0.85rem", marginBottom: "12px" }}>
            {errorMsg}
          </div>
        )}

        <div className="inputs" style={{ margin: "10px 0" }}>
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              min="1"
              onChange={(e) => setStockQuantity(Number(e.target.value))}
              value={stockQuantity}
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              name="price"
              id="price"
              step="0.05"
              min="0.01"
              onChange={(e) => setStockPrice(Number(e.target.value))}
              value={stockPrice}
            />
          </fieldset>
        </div>
      </div>

      <div className="buttons" style={{ padding: "10px 20px 20px", top: 0 }}>
        <span style={{ fontSize: "0.8rem", color: "#555" }}>
          Margin required ₹{(Number(stockQuantity) * Number(stockPrice)).toFixed(2)}
        </span>
        <div>
          <button
            className="btn"
            onClick={handleTransactionClick}
            style={{
              backgroundColor: mode === "BUY" ? "#4184f3" : "#df514c",
              border: "none",
              cursor: "pointer",
            }}
          >
            {mode === "BUY" ? "Buy" : "Sell"}
          </button>
          <Link to="" className="btn btn-grey" onClick={handleCancelClick} style={{ textDecoration: "none" }}>
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;
