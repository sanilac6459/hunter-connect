import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import axios from "axios";

function Navbar() {
  const { user, token, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await axios.put(
        "http://localhost:3000/users/profile-picture",
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      updateUser(response.data);
    } catch {
      alert("Failed to upload profile picture.");
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        HunterConnect
      </Link>
      <div className="navbar-links">
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
                <label className="dropdown-upload">
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                </label>
                <button onClick={handleLogout}>Sign Out</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
