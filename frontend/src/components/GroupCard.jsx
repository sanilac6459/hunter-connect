import axios from "axios";

function GroupCard({ group, token, onJoin, onClick }) {
  const handleJoin = async (e) => {
    e.stopPropagation();
    try {
      await axios.post(
        `http://localhost:3000/memberships/join/${group.id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onJoin();
    } catch {
      alert("Failed to join group.");
    }
  };

  return (
    <div className="group-card" onClick={onClick}>
      <h3>{group.name}</h3>
      <p>{group.description}</p>
      {token && <button onClick={handleJoin}>Join Group</button>}
    </div>
  );
}

export default GroupCard;
