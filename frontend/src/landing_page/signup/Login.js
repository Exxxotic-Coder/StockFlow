import React, { useState } from "react";
import { Link } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:3002/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Login successful! Redirecting to dashboard...");
        localStorage.setItem("username", data.username);
        window.location.href = `http://localhost:3000?username=${data.username}`;
      } else {
        setError(data.error || "Login failed. Invalid username or password.");
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
            alt="Login illustration"
            className="img-fluid mb-4"
            style={{ maxHeight: "380px" }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <h1 className="fw-semibold text-dark mb-3" style={{ fontSize: "2.5rem" }}>
            Access your StockFlow console
          </h1>
          <p className="text-muted fs-5 mb-4">
            Track your virtual wallet, check live holdings, and simulate order executions instantly.
          </p>
        </div>

        {/* Right Section - Login Form */}
        <div className="col-12 col-md-5">
          <div className="card border-0 shadow-sm p-4 p-lg-5" style={{ borderRadius: "12px", backgroundColor: "#fff" }}>
            <h2 className="fw-bold mb-2">Log in</h2>
            <p className="text-muted mb-4 small">Enter your virtual trading credentials</p>
            
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
                  placeholder="Enter your username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
                  placeholder="Enter your password"
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
                Log In
              </button>
            </form>

            <div className="mt-4 text-center">
              <span className="small text-muted">
                New to StockFlow?{" "}
                <Link to="/signup" className="text-decoration-none fw-medium text-primary">
                  Sign up now
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
