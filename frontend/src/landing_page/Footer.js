import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#1a1a2e",
        color: "#ccc",
        padding: "48px 0 24px",
        marginTop: "60px",
      }}
    >
      <div className="container">
        <div className="row g-4 pb-4" style={{ borderBottom: "1px solid #2d2d4e" }}>
          {/* Brand Column */}
          <div className="col-12 col-md-4">
            <div className="mb-3">
              <img
                src="/media/images/logo.svg"
                alt="StockFlow Logo"
                style={{ width: "120px", filter: "brightness(0) invert(1)" }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <span
                style={{
                  fontSize: "1.6rem",
                  fontWeight: "800",
                  color: "#fff",
                  letterSpacing: "-0.5px",
                  marginLeft: "6px",
                }}
              >
                StockFlow
              </span>
            </div>
            <p style={{ fontSize: "0.85rem", lineHeight: "1.7", color: "#999", maxWidth: "260px" }}>
              India's modern virtual stock trading platform. Practice investing with real market data, zero risk.
            </p>
            <p style={{ fontSize: "0.78rem", color: "#666", marginTop: "16px" }}>
              &copy; {new Date().getFullYear()} StockFlow. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-md-2 offset-md-2">
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "#fff",
                marginBottom: "16px",
              }}
            >
              Platform
            </p>
            {[
              { label: "Home", to: "/" },
              { label: "About", to: "/about" },
              { label: "Products", to: "/product" },
              { label: "Pricing", to: "/pricing" },
              { label: "Support", to: "/support" },
            ].map((link) => (
              <div key={link.label} style={{ marginBottom: "10px" }}>
                <Link
                  to={link.to}
                  style={{
                    color: "#999",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    transition: "color 0.2s",
                  }}
                  onMouseOver={(e) => (e.target.style.color = "#fff")}
                  onMouseOut={(e) => (e.target.style.color = "#999")}
                >
                  {link.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Account Links */}
          <div className="col-6 col-md-2">
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "#fff",
                marginBottom: "16px",
              }}
            >
              Account
            </p>
            {[
              { label: "Sign Up", to: "/signup" },
              { label: "Login", to: "/login" },
              { label: "Dashboard", to: "#", href: "http://localhost:3000" },
            ].map((link) =>
              link.href ? (
                <div key={link.label} style={{ marginBottom: "10px" }}>
                  <a
                    href={link.href}
                    style={{
                      color: "#999",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      transition: "color 0.2s",
                    }}
                    onMouseOver={(e) => (e.target.style.color = "#fff")}
                    onMouseOut={(e) => (e.target.style.color = "#999")}
                  >
                    {link.label}
                  </a>
                </div>
              ) : (
                <div key={link.label} style={{ marginBottom: "10px" }}>
                  <Link
                    to={link.to}
                    style={{
                      color: "#999",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      transition: "color 0.2s",
                    }}
                    onMouseOver={(e) => (e.target.style.color = "#fff")}
                    onMouseOut={(e) => (e.target.style.color = "#999")}
                  >
                    {link.label}
                  </Link>
                </div>
              )
            )}
          </div>

          {/* Contact */}
          <div className="col-12 col-md-2">
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "#fff",
                marginBottom: "16px",
              }}
            >
              Contact
            </p>
            <p style={{ fontSize: "0.85rem", color: "#999", marginBottom: "10px" }}>
              support@stockflow.in
            </p>
            <p style={{ fontSize: "0.85rem", color: "#999" }}>
              Mon – Fri, 9 AM – 6 PM IST
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              {["Twitter", "LinkedIn"].map((s) => (
                <span
                  key={s}
                  style={{
                    fontSize: "0.75rem",
                    color: "#555",
                    cursor: "default",
                    border: "1px solid #2d2d4e",
                    borderRadius: "4px",
                    padding: "3px 8px",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="d-flex flex-column flex-md-row justify-content-between align-items-center pt-3"
          style={{ fontSize: "0.75rem", color: "#555" }}
        >
          <span>Built for educational purposes. Not a SEBI-registered broker.</span>
          <span>Investments are subject to market risks. Read all documents carefully.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
