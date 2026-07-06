import React, { useState, useContext } from "react";

import axios from "axios";

import GeneralContext from "./GeneralContext";

import { Tooltip, Grow } from "@mui/material";

import {
  BarChartOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreHoriz,
} from "@mui/icons-material";

import { watchlist } from "../data/data";
import { DoughnutChart } from "./DoughnoutChart";



const WatchList = () => {
  const [stocks, setStocks] = useState(watchlist);

  return (
    <div className="watchlist-container">
      <div className="search-container">
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Search eg:infy, bse, nifty fut weekly, gold mcx"
          className="search"
        />
        <span className="counts"> {stocks.length} / 50</span>
      </div>

      <ul className="list">
        {stocks.map((stock, index) => {
          return (
            <WatchListItem
              stock={stock}
              key={index}
              onRemove={() => setStocks(prev => prev.filter((_, i) => i !== index))}
            />
          );
        })}
      </ul>

      <DoughnutChart data={{
        labels: stocks.map(s => s.name),
        datasets: [{
          label: "Price",
          data: stocks.map(s => s.price),
          backgroundColor: ["rgba(255,99,132,0.5)","rgba(54,162,235,0.5)","rgba(255,206,86,0.5)","rgba(75,192,192,0.5)","rgba(153,102,255,0.5)","rgba(255,159,64,0.5)"],
          borderColor: ["rgba(255,99,132,1)","rgba(54,162,235,1)","rgba(255,206,86,1)","rgba(75,192,192,1)","rgba(153,102,255,1)","rgba(255,159,64,1)"],
          borderWidth: 1,
        }],
      }} />
    </div>
  );
};

export default WatchList;

const WatchListItem = ({ stock, onRemove }) => {
  const [showWatchlistActions, setShowWatchlistActions] = useState(false);

  const handleMouseEnter = (e) => {
    setShowWatchlistActions(true);
  };

  const handleMouseLeave = (e) => {
    setShowWatchlistActions(false);
  };

  return (
    <li onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="item">
        <p className={stock.isDown ? "down" : "up"}>{stock.name}</p>
        <div className="itemInfo">
          <span className="percent">{stock.percent}</span>
          {stock.isDown ? (
            <KeyboardArrowDown className="down" />
          ) : (
            <KeyboardArrowUp className="down" />
          )}
          <span className="price">{stock.price}</span>
        </div>
      </div>
      {showWatchlistActions && <WatchListActions uid={stock.name} stock={stock} onRemove={onRemove} />}
    </li>
  );
};

const WatchListActions = ({ uid, stock, onRemove }) => {
  const generalContext = useContext(GeneralContext);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const handleBuyClick = () => {
    generalContext.openBuyWindow(uid, "BUY");
  };

  const handleSellClick = () => {
    generalContext.openBuyWindow(uid, "SELL");
  };

  return (
    <span className="actions" style={{ display: "flex" }}>
      <span style={{ display: "flex", alignItems: "center", position: "relative" }}>
        <Tooltip
          title="Buy (B)"
          placement="top"
          arrow
          TransitionComponent={Grow}
          onClick={handleBuyClick}
        >
          <button className="buy">Buy</button>
        </Tooltip>
        <Tooltip
          title="Sell (S)"
          placement="top"
          arrow
          TransitionComponent={Grow}
          onClick={handleSellClick}
        >
          <button className="sell">Sell</button>
        </Tooltip>
        <Tooltip
          title="Analytics"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button className="action" onClick={() => { setShowAnalytics(v => !v); setShowMore(false); }}>
            <BarChartOutlined className="icon" />
          </button>
        </Tooltip>
        <Tooltip title="More" placement="top" arrow TransitionComponent={Grow}>
          <button className="action" onClick={() => { setShowMore(v => !v); setShowAnalytics(false); }}>
            <MoreHoriz className="icon" />
          </button>
        </Tooltip>

        {/* Analytics mini popup */}
        {showAnalytics && stock && (
          <div style={{
            position: "absolute", top: "36px", right: "0", zIndex: 200,
            background: "#fff", border: "1px solid #e0e0e0",
            borderRadius: "8px", padding: "12px 16px", minWidth: "160px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)", fontSize: "0.8rem"
          }}>
            <p style={{ fontWeight: 700, marginBottom: "6px", color: "#333" }}>{stock.name}</p>
            <p style={{ marginBottom: "4px", color: "#666" }}>
              Price: <strong style={{ color: "#222" }}>₹{stock.price}</strong>
            </p>
            <p style={{ color: stock.isDown ? "rgb(223,73,73)" : "rgb(67,160,71)" }}>
              {stock.isDown ? "▼" : "▲"} {stock.percent}
            </p>
          </div>
        )}

        {/* More dropdown */}
        {showMore && (
          <div style={{
            position: "absolute", top: "36px", right: "0", zIndex: 200,
            background: "#fff", border: "1px solid #e0e0e0",
            borderRadius: "8px", padding: "4px 0", minWidth: "130px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)"
          }}>
            <div
              onClick={onRemove}
              style={{
                padding: "8px 14px", fontSize: "0.8rem", cursor: "pointer",
                color: "#d9534f", fontWeight: 500
              }}
              onMouseOver={e => e.currentTarget.style.background = "#fef2f2"}
              onMouseOut={e => e.currentTarget.style.background = ""}
            >
              ✕ Remove from watchlist
            </div>
          </div>
        )}
      </span>
    </span>
  );
};
