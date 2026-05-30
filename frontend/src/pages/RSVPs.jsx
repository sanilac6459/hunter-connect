import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/useAuth";

function RSVPs() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRSVPs = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/rsvps`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setRsvps(response.data);
    } catch {
      setRsvps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRSVPs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancelRSVP = async (eventId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/rsvps/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRSVPs();
    } catch {
      alert("Failed to cancel RSVP.");
    }
  };

  if (!token) return null;

  return (
    <div className="container">
      <div className="home-header">
        <h1>My RSVPs</h1>
      </div>
      {loading && <p>Loading...</p>}
      {!loading && rsvps.length === 0 && (
        <p>
          You haven't RSVPed to any events yet. Check out your clubs for
          upcoming events!
        </p>
      )}
      <div className="events-list">
        {rsvps.map((rsvp) => {
          const event = rsvp.event;
          const eventDate = new Date(event.date);
          return (
            <div key={rsvp.id} className="event-card">
              <div className="event-date-badge">
                <span className="event-month">
                  {eventDate
                    .toLocaleString("default", { month: "short" })
                    .toUpperCase()}
                </span>
                <span className="event-day">{eventDate.getDate()}</span>
              </div>
              <div className="event-info">
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                {event.location && (
                  <p className="event-location">📍 {event.location}</p>
                )}
                <small>
                  {eventDate.toLocaleDateString()} at{" "}
                  {eventDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </small>
                <p className="event-club">
                  Club:{" "}
                  <span
                    onClick={() => navigate(`/groups/${event.group.id}`)}
                    className="event-club-link"
                  >
                    {event.group.name}
                  </span>
                </p>
              </div>
              <div className="event-actions">
                <button
                  className="rsvp-btn rsvp-btn-cancel"
                  onClick={() => handleCancelRSVP(event.id)}
                >
                  Cancel RSVP
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RSVPs;
