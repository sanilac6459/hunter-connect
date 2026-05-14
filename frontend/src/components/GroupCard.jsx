import { useState } from "react";
import axios from "axios";

// card component to display group information on the home page
function GroupCard({ group, token, onJoin, onClick }) {
  const [joining, setJoining] = useState(false);

  // handle joining the group
  const handleJoin = async (e) => {
    e.stopPropagation();
    if (joining) return;
    setJoining(true);
    try {
      // create membership in the backend
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

  // render the group card
  return (
    <div className="group-card" onClick={onClick}>
      <div className="group-card-header">
        {group.imageUrl ? (
          <img src={group.imageUrl} alt={group.name} className="group-avatar" />
        ) : (
          <div className="group-avatar-placeholder">
            {group.name.charAt(0).toUpperCase()}
          </div>
        )}
        <h3>{group.name}</h3>
      </div>
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
