// home page that shows all clubs and allows logged in users to create new clubs

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import GroupCard from "../components/GroupCard";

// home page component
function Home() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [joinedGroupIds, setJoinedGroupIds] = useState(new Set());
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  // fetch all clubs when the page first loads
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(
          "${import.meta.env.VITE_API_URL}/groups",
        );
        setGroups(response.data);
      } catch {
        alert("Failed to fetch groups.");
      }
    };

    const fetchMemberships = async () => {
      if (!token) return;
      try {
        const response = await axios.get(
          "${import.meta.env.VITE_API_URL}/memberships",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setJoinedGroupIds(new Set(response.data.map((g) => g.id)));
      } catch {
        // silently fail
      }
    };

    fetchGroups();
    fetchMemberships();
  }, [token]);

  // refresh the clubs list after creating a new one
  const refetchGroups = useCallback(async () => {
    try {
      const response = await axios.get(
        "${import.meta.env.VITE_API_URL}/groups",
      );
      setGroups(response.data);
    } catch {
      alert("Failed to fetch groups.");
    }
  }, []);

  // handle creating a new group
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      if (image) formData.append("image", image);

      const response = await axios.post(
        "${import.meta.env.VITE_API_URL}/groups",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // creator is auto-joined once they create the group
      setJoinedGroupIds((prev) => new Set([...prev, response.data.id]));

      setName("");
      setDescription("");
      setImage(null);
      setShowForm(false);
      refetchGroups();
    } catch {
      alert("Failed to create group.");
    }
  };

  // handle closing the create group modal
  const handleCloseModal = () => {
    setShowForm(false);
    setName("");
    setDescription("");
    setImage(null);
  };

  // render the home page
  return (
    <div className="container">
      <div className="home-header">
        <h1>Hunter College Clubs</h1>
        {user && (
          <button onClick={() => setShowForm(true)}>+ Create Club</button>
        )}
      </div>

      {/* modal overlay */}
      {showForm && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>
              ✕
            </button>
            <h2>Create a New Club</h2>
            <form className="create-form" onSubmit={handleCreateGroup}>
              <div className="form-group">
                <label>Club Name</label>
                <input
                  type="text"
                  placeholder="Club name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Club Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </div>
              <button type="submit">Create Club</button>
            </form>
          </div>
        </div>
      )}

      <div className="groups-grid">
        {groups.length === 0 && <p>No clubs yet! Create one!</p>}
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            token={token}
            isMember={joinedGroupIds.has(group.id)}
            onJoin={() =>
              setJoinedGroupIds((prev) => new Set([...prev, group.id]))
            }
            onClick={() => navigate(`/groups/${group.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

export default Home;
