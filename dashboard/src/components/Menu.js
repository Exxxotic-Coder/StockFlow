import React, { useState } from "react";

import { Link } from "react-router-dom";
import axios from "axios";

const Menu = () => {
  const frontendUrl = process.env.REACT_APP_FRONTEND_URL || "http://localhost:3001";
  const [selectedMenu, setSelectedMenu] = useState(0);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleMenuClick = (index) => {
    setSelectedMenu(index);
  };

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const menuClass = "menu";
  const activeMenuClass = "menu selected";

  const handleLogout = async () => {
    await axios.post("/logout").catch(() => {});
    localStorage.removeItem("username");
    // Redirect back to the landing page (frontend on port 3001)
    window.location.href = frontendUrl;
  };

  return (
    <div className="menu-container">
      <img
        src="/logo.svg"
        alt="StockFlow logo"
        className="logo"
      />
      <div className="menus">
        <ul>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/"
              onClick={() => handleMenuClick(0)}
            >
              <p className={selectedMenu === 0 ? activeMenuClass : menuClass}>
                Dashboard
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/orders"
              onClick={() => handleMenuClick(1)}
            >
              <p className={selectedMenu === 1 ? activeMenuClass : menuClass}>
                Orders
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/holdings"
              onClick={() => handleMenuClick(2)}
            >
              <p className={selectedMenu === 2 ? activeMenuClass : menuClass}>
                Holdings
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/positions"
              onClick={() => handleMenuClick(3)}
            >
              <p className={selectedMenu === 3 ? activeMenuClass : menuClass}>
                Positions
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/funds"
              onClick={() => handleMenuClick(4)}
            >
              <p className={selectedMenu === 4 ? activeMenuClass : menuClass}>
                Funds
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/apps"
              onClick={() => handleMenuClick(6)}
            >
              <p className={selectedMenu === 6 ? activeMenuClass : menuClass}>
                Apps
              </p>
            </Link>
          </li>
        </ul>
        <hr />
        <div
          className="profile"
          onClick={handleProfileClick}
          style={{ position: "relative", cursor: "pointer" }}
        >
          <div className="avatar">
            {(localStorage.getItem("username") || "US").slice(0, 2).toUpperCase()}
          </div>
          <p className="username">{localStorage.getItem("username") || "User"}</p>
          {isProfileDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "45px",
                right: "0",
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                borderRadius: "4px",
                padding: "8px 16px",
                zIndex: 1000,
                whiteSpace: "nowrap",
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
            >
              <span style={{ color: "#d9534f", fontWeight: "600", fontSize: "0.85rem" }}>
                &#8594; Logout
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;
