import React, { useState, useEffect } from "react";
import axios from "axios";
import { VerticalGraph } from "./VerticalGraph";

const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);
  const [livePrices, setLivePrices] = useState({});
  const [priceStatus, setPriceStatus] = useState("idle"); // idle | loading | live | error
  const [lastUpdated, setLastUpdated] = useState(null);

  const username = localStorage.getItem("username");

  const fetchLivePrices = (holdings) => {
    if (!holdings || holdings.length === 0) return;
    const symbols = holdings.map((h) => h.name).join(",");
    setPriceStatus("loading");
    axios
      .get(`/livePrices?symbols=${encodeURIComponent(symbols)}`)
      .then((res) => {
        setLivePrices(res.data || {});
        setPriceStatus(Object.keys(res.data || {}).length ? "live" : "error");
        setLastUpdated(new Date());
      })
      .catch(() => {
        setPriceStatus("error");
      });
  };

  const fetchAll = () => {
    axios
      .get(`/allHoldings?username=${username}`)
      .then((res) => {
        setAllHoldings(res.data);
        fetchLivePrices(res.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchAll();
    // Auto-refresh live prices every 60 seconds
    const timer = setInterval(fetchAll, 60000);
    return () => clearInterval(timer);
  }, []);

  // Use live price if available, fall back to DB price
  const getPrice = (stock) =>
    livePrices[stock.name] !== undefined ? livePrices[stock.name] : stock.price;

  const totalInvestment = allHoldings.reduce(
    (sum, stock) => sum + (stock.avg || 0) * (stock.qty || 0),
    0
  );
  const totalCurrentValue = allHoldings.reduce(
    (sum, stock) => sum + getPrice(stock) * (stock.qty || 0),
    0
  );
  const totalPnL = totalCurrentValue - totalInvestment;
  const totalPnLPercent =
    totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0;
  const isProfit = totalPnL >= 0;

  const formatCurrency = (val) =>
    Number(val).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const labels = allHoldings.map((h) => h.name);
  const data = {
    labels,
    datasets: [
      {
        label: "Current Value (₹)",
        data: allHoldings.map((stock) => getPrice(stock)),
        backgroundColor: "rgba(65, 132, 243, 0.5)",
      },
    ],
  };

  return (
    <>
      {/* ── Header row with live price status ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <h3 className="title" style={{ margin: 0 }}>
          Holdings ({allHoldings.length})
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {priceStatus === "live" && lastUpdated && (
            <span style={{ fontSize: "0.72rem", color: "#4caf50" }}>
              🟢 Live &nbsp;·&nbsp; Updated{" "}
              {lastUpdated.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          )}
          {priceStatus === "loading" && (
            <span style={{ fontSize: "0.72rem", color: "#aaa" }}>
              ⏳ Fetching live prices…
            </span>
          )}
          {priceStatus === "error" && (
            <span style={{ fontSize: "0.72rem", color: "#f57c00" }}>
              ⚠️ Using stored prices (market may be closed)
            </span>
          )}
          <button
            onClick={fetchAll}
            title="Refresh prices"
            style={{
              fontSize: "0.75rem",
              padding: "4px 10px",
              cursor: "pointer",
              background: "#f0f4ff",
              border: "1px solid #c5d4f5",
              borderRadius: "4px",
              color: "#4184f3",
              fontWeight: 600,
            }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* ── Holdings table ── */}
      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg. cost</th>
              <th>LTP</th>
              <th>Cur. val</th>
              <th>P&L</th>
              <th>Net chg.</th>
              <th>Day chg.</th>
            </tr>
          </thead>
          <tbody>
            {allHoldings.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    textAlign: "center",
                    padding: "32px",
                    color: "#aaa",
                    fontSize: "0.9rem",
                  }}
                >
                  No holdings yet. Buy stocks from the watchlist to get started!
                </td>
              </tr>
            ) : (
              allHoldings.map((stock, index) => {
                const livePrice = getPrice(stock);
                const curValue = livePrice * stock.qty;
                const pnlVal = curValue - stock.avg * stock.qty;
                const isProfitStock = pnlVal >= 0;
                const profClass = isProfitStock ? "profit" : "loss";
                const dayClass = stock.isLoss ? "loss" : "profit";
                const hasLive = livePrices[stock.name] !== undefined;

                return (
                  <tr key={index}>
                    <td>
                      {stock.name}
                      {hasLive && (
                        <span
                          title="Live price"
                          style={{
                            fontSize: "0.55rem",
                            color: "#4caf50",
                            marginLeft: "5px",
                            verticalAlign: "middle",
                          }}
                        >
                          ●
                        </span>
                      )}
                    </td>
                    <td>{stock.qty}</td>
                    <td>₹{(stock.avg || 0).toFixed(2)}</td>
                    <td
                      style={{
                        color: hasLive
                          ? isProfitStock
                            ? "rgb(72,194,55)"
                            : "rgb(250,118,78)"
                          : "inherit",
                        fontWeight: hasLive ? 500 : 400,
                      }}
                    >
                      ₹{livePrice.toFixed(2)}
                    </td>
                    <td>₹{curValue.toFixed(2)}</td>
                    <td className={profClass}>
                      {isProfitStock ? "+" : ""}₹{pnlVal.toFixed(2)}
                    </td>
                    <td className={profClass}>{stock.net}</td>
                    <td className={dayClass}>{stock.day}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Summary row ── */}
      {allHoldings.length > 0 && (
        <div className="row">
          <div className="col">
            <h5>₹ {formatCurrency(totalInvestment)}</h5>
            <p>Total investment</p>
          </div>
          <div className="col">
            <h5>₹ {formatCurrency(totalCurrentValue)}</h5>
            <p>Current value</p>
          </div>
          <div className="col">
            <h5 className={isProfit ? "profit" : "loss"}>
              {isProfit ? "+" : ""}₹ {formatCurrency(totalPnL)}{" "}
              <span style={{ fontSize: "1rem" }}>
                ({isProfit ? "+" : ""}{totalPnLPercent.toFixed(2)}%)
              </span>
            </h5>
            <p>
              Total P&L{" "}
              {priceStatus === "live" && (
                <span style={{ color: "#4caf50", fontSize: "0.7rem" }}>
                  (live)
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      <VerticalGraph data={data} />
    </>
  );
};

export default Holdings;
