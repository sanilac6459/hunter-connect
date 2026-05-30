// home page that shows all clubs and allows logged in users to create new clubs

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import GroupCard from "../components/GroupCard";

function Home() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [userGroupIds, setUserGroupIds] = useState(new Set());
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [modal, setModal] = useState({ show: false, type: "", message: "" });

  const fetchGroups = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/groups`,
      );
      setGroups(response.data);

      if (token) {
        const membershipsRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/memberships`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setUserGroupIds(new Set(membershipsRes.data.map((m) => m.id)));
      }
    } catch {
      setModal({
        show: true,
        type: "error",
        message: "Failed to fetch groups.",
      });
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      if (image) formData.append("image", image);

      await axios.post(`${import.meta.env.VITE_API_URL}/groups`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setName("");
      setDescription("");
      setImage(null);
      setShowForm(false);
      fetchGroups();
      setModal({
        show: true,
        type: "success",
        message: "Club created successfully!",
      });
    } catch {
      setModal({
        show: true,
        type: "error",
        message: "Failed to create club.",
      });
    }
  };

  const closeFormModal = () => {
    setShowForm(false);
    setName("");
    setDescription("");
    setImage(null);
  };

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="container">
      <div className="home-header">
        <h1>Hunter College Clubs</h1>
        {user && (
          <button onClick={() => setShowForm(true)}>+ Create Club</button>
        )}
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search clubs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="groups-grid">
        {filteredGroups.length === 0 && search && (
          <p>No clubs found for "{search}".</p>
        )}
        {filteredGroups.length === 0 && !search && (
          <p>No clubs yet! Create one!</p>
        )}
        {filteredGroups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            token={token}
            isMember={userGroupIds.has(group.id)}
            onJoin={fetchGroups}
            onClick={() => navigate(`/groups/${group.id}`)}
          />
        ))}
      </div>

      {/* Create Club Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={closeFormModal}>
          <div
            className="modal delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Create a Club</h2>
            <form className="create-form" onSubmit={handleCreateGroup}>
              <input
                type="text"
                placeholder="Club name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <label style={{ display: "block" }}>
                Club Profile Picture (optional)
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  style={{
                    display: "block",
                    marginTop: "0.4rem",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </label>
              <div className="delete-modal-actions">
                <button
                  type="button"
                  className="delete-modal-cancel"
                  onClick={closeFormModal}
                >
                  Cancel
                </button>
                <button type="submit" className="delete-modal-confirm">
                  Create Club
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success/Error Modal */}
      {modal.show && (
        <div
          className="modal-overlay"
          onClick={() => setModal({ ...modal, show: false })}
        >
          <div
            className="modal delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delete-modal-icon">
              {modal.type === "success" ? "✅" : "⚠️"}
            </div>
            <h2>{modal.type === "success" ? "Success" : "Error"}</h2>
            <p>{modal.message}</p>
            <div className="delete-modal-actions">
              <button
                className="delete-modal-confirm"
                onClick={() => setModal({ ...modal, show: false })}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
