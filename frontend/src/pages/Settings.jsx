import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useAuth } from "../context/useAuth";

function Settings() {
  const { user, token, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name,
      email: user?.email,
    },
  });

  // Update name and email
  const onSubmit = async (data) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/profile`,
        data,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      updateUser(response.data);
      setMessage("Profile updated successfully!");
      setError("");
    } catch {
      setError("Failed to update profile.");
      setMessage("");
    }
  };

  // Remove profile picture
  const handleRemovePicture = async () => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/users/profile-picture`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      updateUser(response.data);
      setMessage("Profile picture removed.");
      setError("");
    } catch {
      setError("Failed to remove profile picture.");
    }
  };

  // Upload new profile picture
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/profile-picture`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      updateUser(response.data);
      setMessage("Profile picture updated!");
      setError("");
    } catch {
      setError("Failed to upload profile picture.");
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone.",
    );
    if (!confirm) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/users/account`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      logout();
      navigate("/register");
    } catch {
      setError("Failed to delete account.");
    }
  };

  return (
    <div className="container">
      <div className="settings-page">
        <h1>Settings</h1>
        <div className="settings-section">
          <h2>Profile Picture</h2>
          <div className="avatar-preview">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt="avatar"
                className="settings-avatar"
              />
            ) : (
              <div className="settings-avatar-placeholder">
                {user?.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="settings-picture-actions">
            <label className="settings-upload-btn">
              Change Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
            </label>
            {user?.imageUrl && (
              <button
                className="settings-remove-btn"
                onClick={handleRemovePicture}
              >
                Remove Photo
              </button>
            )}
          </div>
        </div>
        <div className="settings-section">
          <h2>Edit Profile</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="settings-form">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && <p className="error">{errors.name.message}</p>}
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <p className="error">{errors.email.message}</p>}
            </div>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error">{error}</p>}
            <button type="submit" className="settings-save-btn">
              Save Changes
            </button>
          </form>
        </div>
        <div className="settings-section settings-danger">
          <h2>Danger Zone</h2>
          <p>Deleting your account is permanent and cannot be undone.</p>
          <button className="settings-delete-btn" onClick={handleDeleteAccount}>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
