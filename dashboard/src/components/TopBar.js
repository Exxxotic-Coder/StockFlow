import React, { useState, useEffect } from "react";
import axios from "axios";
import Menu from "./Menu";

const TopBar = () => {
  const [market, setMarket] = useState({
    nifty: { price: "...", change: "--", isDown: false },
    sensex: { price: "...", change: "--", isDown: false },
  });

  const fetchMarket = () => {
    axios
      .get("/marketdata")
      .then((res) => {
        if (res.data?.nifty && res.data?.sensex) {
          setMarket(res.data);
        }
      })
      .catch(() => {
        // Keep showing last values on error
      });
  };

  useEffect(() => {
    fetchMarket();
    // Refresh every 60 seconds (backend caches for 60s too)
    const timer = setInterval(fetchMarket, 60000);
    return () => clearInterval(timer);
  }, []);

  const fmt = (val) =>
    typeof val === "number"
      ? val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : val;

  return (
    <div className="topbar-container">
      <div className="indices-container">
        <div className="nifty">
          <p className="index">NIFTY 50</p>
          <p className="index-points" style={{ color: market.nifty.isDown ? "rgb(223, 73, 73)" : "rgb(67, 160, 71)" }}>
            {fmt(market.nifty.price)}
          </p>
          <p className="percent" style={{ color: market.nifty.isDown ? "rgb(223, 73, 73)" : "rgb(67, 160, 71)" }}>
            {market.nifty.isDown ? "▼" : "▲"} {market.nifty.change}%
          </p>
        </div>
        <div className="sensex">
          <p className="index">SENSEX</p>
          <p className="index-points" style={{ color: market.sensex.isDown ? "rgb(223, 73, 73)" : "rgb(67, 160, 71)" }}>
            {fmt(market.sensex.price)}
          </p>
          <p className="percent" style={{ color: market.sensex.isDown ? "rgb(223, 73, 73)" : "rgb(67, 160, 71)" }}>
            {market.sensex.isDown ? "▼" : "▲"} {market.sensex.change}%
          </p>
        </div>
      </div>

      <Menu />
    </div>
  );
};

export default TopBar;
