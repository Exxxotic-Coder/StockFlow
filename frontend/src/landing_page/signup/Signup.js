import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3002";
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${apiUrl}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Registration successful! Redirecting to login...");
        localStorage.setItem("username", data.user?.username || username);
        setTimeout(() => {
          navigate("/login");
        }, 1200);
      } else {
        setError(data.error || "Signup failed. Please try again.");
      }
    } catch (err) {
      setError("Unable to connect to the authentication server. Please make sure the backend is running on port 3002.");
    }
  };

  return (
    <div className="container py-5 my-5">
      <div className="row justify-content-center align-items-center g-5">
        {/* Left Section - Hero/Illustration */}
        <div className="col-12 col-md-6 text-center text-md-start">
          <img
            src="/media/images/landing.png"
            alt="Sign up illustration"
            className="img-fluid mb-4"
            style={{ maxHeight: "380px" }}
            onError={(e) => {
              // Fallback if media is not present
              e.target.style.display = "none";
            }}
          />
          <h1 className="fw-semibold text-dark mb-3" style={{ fontSize: "2.5rem" }}>
            Join 1.5+ crore investors
          </h1>
          <p className="text-muted fs-5 mb-4">
            Practice investing in stocks, mutual funds, ETFs, bonds, and more with our modern trading simulator.
          </p>
          <div className="d-flex flex-column gap-3 text-secondary">
            <div className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-circle-check text-success"></i>
              <span>Free equity delivery trades</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-circle-check text-success"></i>
              <span>₹20 or 0.03% max per intraday / F&O trade</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-circle-check text-success"></i>
              <span>No hidden charges, completely transparent</span>
            </div>
          </div>
        </div>

        {/* Right Section - Signup Form */}
        <div className="col-12 col-md-5">
          <div className="card border-0 shadow-sm p-4 p-lg-5" style={{ borderRadius: "12px", backgroundColor: "#fff" }}>
            <h2 className="fw-bold mb-2">Sign up now</h2>
            <p className="text-muted mb-4 small">Create your virtual stock trading account</p>
            
            {error && <div className="alert alert-danger py-2 small">{error}</div>}
            {success && <div className="alert alert-success py-2 small">{success}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label text-secondary small fw-medium">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  className="form-control"
                  placeholder="Choose a username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ fontSize: "0.95rem", padding: "10px" }}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label text-secondary small fw-medium">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ fontSize: "0.95rem", padding: "10px" }}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label text-secondary small fw-medium">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  placeholder="Create a password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ fontSize: "0.95rem", padding: "10px" }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 mt-3 fw-semibold text-white border-0"
                style={{
                  backgroundColor: "#387ed1",
                  borderRadius: "6px",
                  transition: "background-color 0.2s ease"
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#2b6cb0")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "#387ed1")}
              >
                Sign Up
              </button>
            </form>

            <div className="mt-4 text-center">
              <span className="small text-muted">
                Already have an account?{" "}
                <Link to="/login" className="text-decoration-none fw-medium text-primary">
                  Log in
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
