// navigation bar component

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* Left — Brand */}
      <Link to="/" className="navbar-brand">
        HunterConnect
      </Link>

      {/* Center — Nav links */}
      {user && (
        <div className="navbar-center">
          <Link to="/" className="navbar-link">
            Home
          </Link>
          <Link to="/clubs" className="navbar-link">
            Clubs
          </Link>
          <Link to="/rsvps" className="navbar-link">
            My RSVPs
          </Link>
        </div>
      )}

      {/* Right — Avatar or Sign In */}
      <div className="navbar-right">
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
    </nav>
  );
}

export default Navbar;
