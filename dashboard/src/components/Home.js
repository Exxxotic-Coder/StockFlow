import React, { useEffect, useState } from "react";

import Dashboard from "./Dashboard";
import TopBar from "./TopBar";
import ChatWidget from "./ChatWidget";

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const usernameParam = params.get("username");

    if (usernameParam) {
      localStorage.setItem("username", usernameParam);
      window.history.replaceState({}, document.title, window.location.pathname);
      setIsAuthenticated(true);
      return;
    }

    const storedUser = localStorage.getItem("username");
    if (storedUser) {
      setIsAuthenticated(true);
    } else {
      window.location.href = "http://localhost:3001/login";
    }
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
