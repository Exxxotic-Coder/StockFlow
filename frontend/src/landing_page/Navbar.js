import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const navigate = useNavigate();
  const location = useLocation();

  // Sync state with localStorage on route changes
  useEffect(() => {
    setUsername(localStorage.getItem("username"));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("username");
    setUsername(null);
    navigate("/");
  };

  return (
    <nav
      className="navbar navbar-expand-lg border-bottom"
      style={{ backgroundColor: "#FFF" }}
    >
      <div className="container p-2">
        <Link className="navbar-brand" to="/">
          <img
            src="/media/images/logo.svg"
            style={{ width: "185px" }}
            alt="Logo"
          />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <form className="d-flex ms-auto" role="search" onSubmit={(e) => e.preventDefault()}>
            <ul className="navbar-nav align-items-center mb-lg-0">
              {username ? (
                <>
                  <li className="nav-item">
                    <span className="nav-link text-success fw-semibold small" style={{ marginRight: "15px" }}>
                      <i className="fa-solid fa-user-check me-1"></i> Welcome, {username}
                    </span>
                  </li>
                  <li className="nav-item">
                    <button
                      className="nav-link btn btn-link text-danger border-0 p-0 active small me-3"
                      onClick={handleLogout}
                      style={{ textDecoration: "none", verticalAlign: "middle" }}
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className="nav-link active" to="/signup">
                      Signup
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link active" to="/login">
                      Login
                    </Link>
                  </li>
                </>
              )}
              <li className="nav-item">
                <Link className="nav-link active" to="/about">
                  About
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active" to="/product">
                  Product
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active" to="/pricing">
                  Pricing
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active" to="/support">
                  Support
                </Link>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link active fw-semibold text-primary"
                  href={username ? `http://localhost:3000?username=${username}` : "http://localhost:3000"}
                  style={{ marginLeft: "30px" }}
                >
                  Dashboard <i className="fa-solid fa-arrow-up-right-from-square small"></i>
                </a>
              </li>
            </ul>
          </form>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
