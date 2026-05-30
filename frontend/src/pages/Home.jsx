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
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/groups`,
      );
      setGroups(response.data);
    } catch {
      alert("Failed to fetch groups.");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGroups();
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
    } catch {
      alert("Failed to create group.");
    }
  };

  // filter groups based on search input
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="container">
      <div className="home-header">
        <h1>Hunter College Clubs</h1>
        {user && (
          <button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Create Club"}
          </button>
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

      {showForm && (
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
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <button type="submit">Create Club</button>
        </form>
      )}

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
            onJoin={fetchGroups}
            onClick={() => navigate(`/groups/${group.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

export default Home;
