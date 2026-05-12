import { useState } from "react";
import axios from "axios";

function GroupCard({ group, token, onJoin, onClick }) {
  const [joining, setJoining] = useState(false);

  const handleJoin = async (e) => {
    e.stopPropagation();
    if (joining) return;
    setJoining(true);
    try {
      await axios.post(
        `http://localhost:3000/memberships/join/${group.id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onJoin();
      onClick();
    } catch (err) {
      if (err.response?.status === 400) {
        alert("You're already in this group!");
      } else {
        alert("Failed to join group.");
      }
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="group-card" onClick={onClick}>
      <h3>{group.name}</h3>
      <p>{group.description}</p>
      {token && (
        <button onClick={handleJoin} disabled={joining}>
          {joining ? "Joining..." : "Join Group"}
        </button>
      )}
    </div>
  );
}

export default GroupCard;
