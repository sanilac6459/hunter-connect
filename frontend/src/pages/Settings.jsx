import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useAuth } from "../context/useAuth";

function Settings() {
  const { user, token, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [successModal, setSuccessModal] = useState({
    show: false,
    message: "",
  });
  const fileInputRef = useRef(null);

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

  const handleRemovePicture = async () => {
    setShowPhotoMenu(false);
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/users/profile-picture`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      updateUser(response.data);
      setSuccessModal({ show: true, message: "Profile picture removed." });
      setError("");
    } catch {
      setError("Failed to remove profile picture.");
    }
  };

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
      setSuccessModal({ show: true, message: "Profile picture updated!" });
      setError("");
    } catch {
      setError("Failed to upload profile picture.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/users/account`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      logout();
      navigate("/register");
    } catch {
      setShowDeleteModal(false);
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

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />

          <div className="settings-picture-actions">
            <div className="photo-menu-wrapper">
              <button
                className="settings-upload-btn"
                onClick={() => setShowPhotoMenu((prev) => !prev)}
              >
                Update Photo
              </button>
              {showPhotoMenu && (
                <div
                  className="photo-menu"
                  onMouseLeave={() => setShowPhotoMenu(false)}
                >
                  <button
                    className="photo-menu-item"
                    onClick={() => {
                      setShowPhotoMenu(false);
                      fileInputRef.current.click();
                    }}
                  >
                    {user?.imageUrl ? "Change Photo" : "Upload Photo"}
                  </button>
                  {user?.imageUrl && (
                    <button
                      className="photo-menu-item photo-menu-item--danger"
                      onClick={handleRemovePicture}
                    >
                      Delete Photo
                    </button>
                  )}
                </div>
              )}
            </div>
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
          <button
            className="settings-delete-btn"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Account
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="modal delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delete-modal-icon">⚠️</div>
            <h2>Delete Account</h2>
            <p>
              Are you sure you want to delete your account? All your posts and
              memberships will be permanently removed. This cannot be undone.
            </p>
            <div className="delete-modal-actions">
              <button
                className="delete-modal-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="delete-modal-confirm"
                onClick={handleDeleteAccount}
              >
                Yes, Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}

      {successModal.show && (
        <div
          className="modal-overlay"
          onClick={() => setSuccessModal({ show: false, message: "" })}
        >
          <div
            className="modal success-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{successModal.message}</h2>
            <button
              className="success-modal-close"
              onClick={() => setSuccessModal({ show: false, message: "" })}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
