// shows each club's details, posts, and allows members to create/edit/delete posts and leave the club

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import PostCard from "../components/PostCard";
import EventCard from "../components/EventCard";

function GroupDetails() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [modal, setModal] = useState({ show: false, type: "", message: "" });
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    action: null,
    message: "",
  });

  const showModal = (type, message) => setModal({ show: true, type, message });
  const closeModal = () => setModal({ show: false, type: "", message: "" });

  const fetchGroup = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/groups/${id}`,
      );
      setGroup(response.data);

      if (user) {
        const membership = response.data.memberships.find(
          (m) => m.userId === user.id,
        );
        if (membership) {
          setIsMember(true);
          setIsAdmin(membership.role === "ADMIN");
        }
      }
    } catch {
      showModal("error", "Failed to fetch group.");
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/posts/group/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPosts(response.data);
    } catch {
      setIsMember(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/events/group/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setEvents(response.data);
    } catch {
      setEvents([]);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGroup();
    if (token) {
      fetchPosts();
      fetchEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (image) formData.append("image", image);

      await axios.post(
        `${import.meta.env.VITE_API_URL}/posts/group/${id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setTitle("");
      setContent("");
      setImage(null);
      setShowPostForm(false);
      fetchPosts();
      showModal("success", "Post created successfully!");
    } catch {
      showModal("error", "Failed to create post.");
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts();
    } catch {
      showModal("error", "Failed to delete post.");
    }
  };

  const handleEditPost = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (image) formData.append("image", image);

      await axios.put(
        `${import.meta.env.VITE_API_URL}/posts/${editingPost.id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setEditingPost(null);
      setTitle("");
      setContent("");
      setImage(null);
      setShowPostForm(false);
      fetchPosts();
      showModal("success", "Post updated successfully!");
    } catch {
      showModal("error", "Failed to update post.");
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/memberships/leave/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      navigate("/");
    } catch {
      showModal("error", "Failed to leave group.");
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/groups/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/");
    } catch {
      showModal("error", "Failed to delete group.");
    }
  };

  const handleUpdateRole = async (targetUserId, newRole) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/memberships/${id}/role/${targetUserId}`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchGroup();
    } catch {
      showModal("error", "Failed to update member role.");
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (new Date(eventEndDate) <= new Date(eventStartDate)) {
      showModal("error", "End time must be after start time.");
      return;
    }
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/events/group/${id}`,
        {
          title: eventTitle,
          description: eventDescription,
          date: eventStartDate,
          endDate: eventEndDate,
          location: eventLocation,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setEventTitle("");
      setEventDescription("");
      setEventStartDate("");
      setEventEndDate("");
      setEventLocation("");
      setShowEventForm(false);
      fetchEvents();
      showModal("success", "Event created successfully!");
    } catch {
      showModal("error", "Failed to create event.");
    }
  };

  const closeEventForm = () => {
    setShowEventForm(false);
    setEventTitle("");
    setEventDescription("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLocation("");
  };

  const closePostForm = () => {
    setShowPostForm(false);
    setEditingPost(null);
    setTitle("");
    setContent("");
    setImage(null);
  };

  if (!group) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <div
        className="group-header"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {group.imageUrl ? (
          <img
            src={group.imageUrl}
            alt={group.name}
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "#e8e0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#4b0082",
              flexShrink: 0,
            }}
          >
            {group.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 style={{ margin: 0 }}>{group.name}</h1>
          <p style={{ margin: "0.25rem 0 0" }}>{group.description}</p>
          {user && isMember && (
            <div className="group-actions" style={{ marginTop: "0.75rem" }}>
              {!isAdmin && (
                <button
                  onClick={() =>
                    setConfirmModal({
                      show: true,
                      action: handleLeaveGroup,
                      message: "Are you sure you want to leave this group?",
                    })
                  }
                >
                  Leave Group
                </button>
              )}
              {isAdmin && (
                <>
                  <button
                    onClick={() =>
                      setConfirmModal({
                        show: true,
                        action: handleDeleteGroup,
                        message:
                          "Are you sure you want to delete this group? This cannot be undone.",
                      })
                    }
                  >
                    Delete Group
                  </button>
                  <button onClick={() => setShowMembers(true)}>
                    Manage Members
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {!token && <p>Please login to view posts and join this group.</p>}
      {token && !isMember && (
        <p>You are not a member of this group. Join to see posts!</p>
      )}

      {isMember && (
        <>
          {/* Events Section */}
          <div className="posts-header">
            <h2>Events</h2>
            <button onClick={() => setShowEventForm(true)}>+ New Event</button>
          </div>

          <div className="events-list">
            {events.length === 0 && <p>No events yet.</p>}
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                currentUser={user}
                isAdmin={isAdmin}
                onRSVP={fetchEvents}
                onDelete={fetchEvents}
              />
            ))}
          </div>

          {/* Posts Section */}
          <div className="posts-header" style={{ marginTop: "2rem" }}>
            <h2>Posts</h2>
            <button onClick={() => setShowPostForm(true)}>+ New Post</button>
          </div>

          <div className="posts-list">
            {posts.length === 0 && <p>No posts yet. Be the first to post!</p>}
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={user}
                isAdmin={isAdmin}
                onDelete={handleDeletePost}
                onEdit={(post) => {
                  setEditingPost(post);
                  setTitle(post.title);
                  setContent(post.content);
                  setImage(null);
                  setShowPostForm(true);
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* Manage Members Modal */}
      {showMembers && (
        <div className="modal-overlay" onClick={() => setShowMembers(false)}>
          <div
            className="modal delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Manage Members</h2>
            <div
              className="members-list"
              style={{
                maxHeight: "400px",
                overflowY: "auto",
                margin: "1rem 0",
              }}
            >
              {group.memberships.map((membership) => (
                <div key={membership.id} className="member-item">
                  <div className="member-info">
                    {membership.user.imageUrl ? (
                      <img
                        src={membership.user.imageUrl}
                        alt="avatar"
                        className="member-avatar"
                      />
                    ) : (
                      <div className="member-avatar-placeholder">
                        {membership.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span>{membership.user.name}</span>
                    <span
                      className={`role-badge ${membership.role === "ADMIN" ? "role-admin" : "role-member"}`}
                    >
                      {membership.role}
                    </span>
                  </div>
                  {membership.userId !== user.id && (
                    <button
                      className="role-toggle-btn"
                      onClick={() =>
                        handleUpdateRole(
                          membership.userId,
                          membership.role === "ADMIN" ? "MEMBER" : "ADMIN",
                        )
                      }
                    >
                      {membership.role === "ADMIN"
                        ? "Remove Admin"
                        : "Make Admin"}
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="delete-modal-actions">
              <button
                className="delete-modal-confirm"
                onClick={() => setShowMembers(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Action Modal */}
      {confirmModal.show && (
        <div
          className="modal-overlay"
          onClick={() =>
            setConfirmModal({ show: false, action: null, message: "" })
          }
        >
          <div
            className="modal delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delete-modal-icon">⚠️</div>
            <h2>Are you sure?</h2>
            <p>{confirmModal.message}</p>
            <div className="delete-modal-actions">
              <button
                className="delete-modal-cancel"
                onClick={() =>
                  setConfirmModal({ show: false, action: null, message: "" })
                }
              >
                Cancel
              </button>
              <button
                className="delete-modal-confirm"
                onClick={() => {
                  confirmModal.action();
                  setConfirmModal({ show: false, action: null, message: "" });
                }}
              >
                Yes, confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showEventForm && (
        <div className="modal-overlay" onClick={closeEventForm}>
          <div
            className="modal delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Create an Event</h2>
            <form className="create-form" onSubmit={handleCreateEvent}>
              <input
                type="text"
                placeholder="Event title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Event description"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                required
              />
              <label style={{ display: "block" }}>
                Start Date & Time
                <input
                  type="datetime-local"
                  value={eventStartDate}
                  onChange={(e) => setEventStartDate(e.target.value)}
                  required
                  style={{
                    display: "block",
                    marginTop: "0.4rem",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </label>
              <label style={{ display: "block" }}>
                End Date & Time
                <input
                  type="datetime-local"
                  value={eventEndDate}
                  onChange={(e) => setEventEndDate(e.target.value)}
                  required
                  style={{
                    display: "block",
                    marginTop: "0.4rem",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </label>
              <input
                type="text"
                placeholder="Location"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                required
              />
              <div className="delete-modal-actions">
                <button
                  type="button"
                  className="delete-modal-cancel"
                  onClick={closeEventForm}
                >
                  Cancel
                </button>
                <button type="submit" className="delete-modal-confirm">
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Post Modal */}
      {showPostForm && (
        <div className="modal-overlay" onClick={closePostForm}>
          <div
            className="modal delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{editingPost ? "Edit Post" : "Create a Post"}</h2>
            <form
              className="create-form"
              onSubmit={editingPost ? handleEditPost : handleCreatePost}
            >
              <input
                type="text"
                placeholder="Post title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Post content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
              <label style={{ display: "block" }}>
                Image (optional)
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
                  onClick={closePostForm}
                >
                  Cancel
                </button>
                <button type="submit" className="delete-modal-confirm">
                  {editingPost ? "Update Post" : "Create Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success/Error Modal */}
      {modal.show && (
        <div className="modal-overlay" onClick={closeModal}>
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
              <button className="delete-modal-confirm" onClick={closeModal}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupDetails;
