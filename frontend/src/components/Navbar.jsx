// navigation bar component

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowMobileMenu(false);
  };

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/clubs")
      return (
        location.pathname.startsWith("/clubs") ||
        location.pathname.startsWith("/groups")
      );
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        HunterConnect
      </Link>

      {user && (
        <div className="navbar-center">
          <Link
            to="/"
            className={`navbar-link ${isActive("/") ? "navbar-link-active" : ""}`}
          >
            Home
          </Link>
          <Link
            to="/clubs"
            className={`navbar-link ${isActive("/clubs") ? "navbar-link-active" : ""}`}
          >
            Clubs
          </Link>
          <Link
            to="/rsvps"
            className={`navbar-link ${isActive("/rsvps") ? "navbar-link-active" : ""}`}
          >
            My RSVPs
          </Link>
        </div>
      )}

      <div className="navbar-right">
        {user && (
          <button
            className="dark-mode-toggle"
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle dark mode"
          >
            {darkMode ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="white"
              >
                <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="white"
              >
                <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
              </svg>
            )}
          </button>
        )}
        {user ? (
          <div className="avatar-wrapper" ref={dropdownRef}>
            <div
              className="avatar"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {user.imageUrl ? (
                <img src={user.imageUrl} alt="avatar" className="avatar-img" />
              ) : (
                <div className="avatar-placeholder">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {showDropdown && (
              <div className="avatar-dropdown">
                <p className="dropdown-name">Hello, {user.name}</p>
                <Link
                  to="/settings"
                  className="dropdown-settings"
                  onClick={() => setShowDropdown(false)}
                >
                  Settings
                </Link>
                <button onClick={handleLogout}>Sign Out</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="navbar-signin">
            Sign In
          </Link>
        )}
      </div>

      {user && (
        <button
          className="hamburger-dark-toggle dark-mode-toggle"
          onClick={() => setDarkMode(!darkMode)}
          title="Toggle dark mode"
        >
          {darkMode ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="white"
            >
              <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="white"
            >
              <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
            </svg>
          )}
        </button>
      )}

      <button
        className="hamburger"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {showMobileMenu && (
        <div className="mobile-menu">
          {user ? (
            <>
              <p className="mobile-menu-name">Hello, {user.name}</p>
              <Link
                to="/"
                className="mobile-menu-link"
                onClick={() => setShowMobileMenu(false)}
              >
                Home
              </Link>
              <Link
                to="/clubs"
                className="mobile-menu-link"
                onClick={() => setShowMobileMenu(false)}
              >
                Clubs
              </Link>
              <Link
                to="/rsvps"
                className="mobile-menu-link"
                onClick={() => setShowMobileMenu(false)}
              >
                My RSVPs
              </Link>
              <Link
                to="/settings"
                className="mobile-menu-link"
                onClick={() => setShowMobileMenu(false)}
              >
                Settings
              </Link>
              <button className="mobile-menu-signout" onClick={handleLogout}>
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="mobile-menu-link"
              onClick={() => setShowMobileMenu(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
