import React, { useEffect, useState } from "react";

import Dashboard from "./Dashboard";
import TopBar from "./TopBar";
import ChatWidget from "./ChatWidget";
import axios from "axios";

const Home = () => {
  const frontendUrl = process.env.REACT_APP_FRONTEND_URL || "http://localhost:3001";
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    axios.get("/me")
      .then((res) => {
        localStorage.setItem("username", res.data.username);
        setIsAuthenticated(true);
      })
      .catch(() => {
        localStorage.removeItem("username");
        window.location.href = `${frontendUrl}/login`;
      });
  }, []);

  if (!isAuthenticated) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "sans-serif", color: "#666" }}>
        <h3>Loading trading session...</h3>
      </div>
    );
  }

  return (
    <>
      <TopBar />
      <Dashboard />
      <ChatWidget />
    </>
  );
};

export default Home;
