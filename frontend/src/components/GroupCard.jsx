import { useState } from "react";
import axios from "axios";

function GroupCard({ group, token, onJoin, onClick, isMember }) {
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
      onJoin(); // adds group id to joinedGroupIds in Home → isMember becomes true
      onClick(); // navigate into the group
    } catch {
      alert("Failed to join group.");
    } finally {
      setJoining(false);
    }
  };

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
      {token &&
        (isMember ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            View Group
          </button>
        ) : (
          <button onClick={handleJoin} disabled={joining}>
            {joining ? "Joining..." : "Join Group"}
          </button>
        ))}
    </div>
  );
}

export default GroupCard;
