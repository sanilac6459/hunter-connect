import axios from "axios";
import { useAuth } from "../context/useAuth";

function EventCard({ event, onRSVP, onDelete, isAdmin, currentUser }) {
  const { token } = useAuth();

  const hasRSVPed = event.rsvps?.some((r) => r.userId === currentUser?.id);

  const handleRSVP = async (e) => {
    e.stopPropagation();
    try {
      if (hasRSVPed) {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/rsvps/${event.id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/rsvps/${event.id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }
      onRSVP();
    } catch {
      alert("Failed to update RSVP.");
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/events/${event.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onDelete();
    } catch {
      alert("Failed to delete event.");
    }
  };

  const eventDate = new Date(event.date);

  return (
    <div className="event-card">
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
        <p className="event-rsvp-count">{event.rsvps?.length || 0} going</p>
      </div>
      <div className="event-actions">
        {token && (
          <button
            className={hasRSVPed ? "rsvp-btn rsvp-btn-cancel" : "rsvp-btn"}
            onClick={handleRSVP}
          >
            {hasRSVPed ? "Cancel RSVP" : "RSVP"}
          </button>
        )}
        {(currentUser?.id === event.userId || isAdmin) && (
          <button className="event-delete-btn" onClick={handleDelete}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default EventCard;
