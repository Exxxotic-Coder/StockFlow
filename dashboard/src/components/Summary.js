import React, { useState, useEffect } from "react";
import axios from "axios";

const Summary = () => {
  const [funds, setFunds] = useState(0);
  const [holdingsCount, setHoldingsCount] = useState(0);
  const [investment, setInvestment] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);

  const username = localStorage.getItem("username") || "User";

  useEffect(() => {
    if (username !== "User") {
      axios
        .get(`/funds?username=${username}`)
        .then((res) => {
          if (res.data && res.data.funds !== undefined) {
            setFunds(res.data.funds);
          }
        })
        .catch(() => {});

      axios
        .get(`/allHoldings?username=${username}`)
        .then((res) => {
          if (res.data && Array.isArray(res.data)) {
            const holdings = res.data;
            setHoldingsCount(holdings.length);

            const totalInvestment = holdings.reduce(
              (sum, stock) => sum + stock.avg * stock.qty,
              0
            );
            setInvestment(totalInvestment);

            // First set current value with stored prices
            const storedValue = holdings.reduce(
              (sum, stock) => sum + stock.price * stock.qty,
              0
            );
            setCurrentValue(storedValue);

            // Then fetch live prices and recalculate
            if (holdings.length > 0) {
              const symbols = holdings.map((h) => h.name).join(",");
              axios
                .get(`/livePrices?symbols=${encodeURIComponent(symbols)}`)
                .then((priceRes) => {
                  const lp = priceRes.data || {};
                  const liveValue = holdings.reduce(
                    (sum, stock) =>
                      sum + (lp[stock.name] ?? stock.price) * stock.qty,
                    0
                  );
                  setCurrentValue(liveValue);
                })
                .catch(() => {}); // keep stored prices on error
            }
          }
        })
        .catch(() => {});
    }
  }, [username]);


  const pnl = currentValue - investment;
  const pnlPercent = investment > 0 ? (pnl / investment) * 100 : 0;
  const isProfit = pnl >= 0;

  const formatCurrency = (val) => {
    return Number(val).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <>
      <div className="username">
        <h6>Hi, {username}!</h6>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Equity</p>
        </span>

        <div className="data">
          <div className="first">
            <h3>₹ {formatCurrency(funds)}</h3>
            <p>Margin available</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Margins used <span>₹ {formatCurrency(investment)}</span>{" "}
            </p>
            <p>
              Opening balance <span>₹ {formatCurrency(funds + investment)}</span>{" "}
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Holdings ({holdingsCount})</p>
        </span>

        <div className="data">
          <div className="first">
            <h3 className={isProfit ? "profit" : "loss"}>
              ₹ {formatCurrency(pnl)}{" "}
              <small>
                {isProfit ? "+" : ""}
                {pnlPercent.toFixed(2)}%
              </small>{" "}
            </h3>
            <p>P&L</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Current Value <span>₹ {formatCurrency(currentValue)}</span>{" "}
            </p>
            <p>
              Investment <span>₹ {formatCurrency(investment)}</span>{" "}
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>
    </>
  );
};

export default Summary;
