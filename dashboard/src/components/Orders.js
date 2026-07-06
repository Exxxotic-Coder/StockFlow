import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) {
      axios
        .get(`/allOrders?username=${username}`)
        .then((res) => {
          if (res.data) {
            setOrders(res.data);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="orders" style={{ padding: "20px", color: "#666" }}>
        <p>Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="orders">
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders today</p>
          <Link to={"/"} className="btn">
            Get started
          </Link>
        </div>
      ) : (
        <>
          <h3 className="title" style={{ marginBottom: "20px" }}>Order History ({orders.length})</h3>
          <div className="order-table">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #eee", textAlign: "left" }}>
                  <th style={{ padding: "12px 8px" }}>Type</th>
                  <th style={{ padding: "12px 8px" }}>Instrument</th>
                  <th style={{ padding: "12px 8px" }}>Qty.</th>
                  <th style={{ padding: "12px 8px" }}>Average Price</th>
                  <th style={{ padding: "12px 8px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice().reverse().map((order, index) => {
                  const modeClass = order.mode === "BUY" ? "profit" : "loss";
                  return (
                    <tr key={index} style={{ borderBottom: "1px solid #f9f9f9" }}>
                      <td style={{ padding: "12px 8px" }}>
                        <span className={modeClass} style={{ fontWeight: "600", fontSize: "0.85rem" }}>
                          {order.mode}
                        </span>
                      </td>
                      <td style={{ padding: "12px 8px", fontWeight: "500" }}>{order.name}</td>
                      <td style={{ padding: "12px 8px" }}>{order.qty}</td>
                      <td style={{ padding: "12px 8px" }}>₹ {Number(order.price).toFixed(2)}</td>
                      <td style={{ padding: "12px 8px" }}>
                        <span style={{ color: "#2b6cb0", fontSize: "0.85rem", fontWeight: "500" }}>COMPLETED</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Orders;
