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
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");

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
      alert("Failed to fetch group.");
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
    } catch {
      alert("Failed to create post.");
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts();
    } catch {
      alert("Failed to delete post.");
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
      fetchPosts();
    } catch {
      alert("Failed to update post.");
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
      alert("Failed to leave group.");
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/groups/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/");
    } catch {
      alert("Failed to delete group.");
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
      alert("Failed to update member role.");
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/events/group/${id}`,
        {
          title: eventTitle,
          description: eventDescription,
          date: eventDate,
          location: eventLocation,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setEventTitle("");
      setEventDescription("");
      setEventDate("");
      setEventLocation("");
      setShowEventForm(false);
      fetchEvents();
    } catch {
      alert("Failed to create event.");
    }
  };

  if (!group) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <div className="group-header">
        <h1>{group.name}</h1>
        <p>{group.description}</p>
        {user && isMember && (
          <div className="group-actions">
            {!isAdmin && (
              <button onClick={handleLeaveGroup}>Leave Group</button>
            )}
            {isAdmin && (
              <>
                <button onClick={handleDeleteGroup}>Delete Group</button>
                <button onClick={() => setShowMembers(!showMembers)}>
                  {showMembers ? "Hide Members" : "Manage Members"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
      {isAdmin && showMembers && (
        <div className="members-section">
          <h2>Members</h2>
          <div className="members-list">
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
        </div>
      )}

      {!token && <p>Please login to view posts and join this group.</p>}
      {token && !isMember && (
        <p>You are not a member of this group. Join to see posts!</p>
      )}

      {isMember && (
        <>
          <div className="posts-header">
            <h2>Events</h2>
            <button onClick={() => setShowEventForm(!showEventForm)}>
              {showEventForm ? "Cancel" : "+ New Event"}
            </button>
          </div>

          {showEventForm && (
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
              <input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Location (optional)"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
              />
              <button type="submit">Create Event</button>
            </form>
          )}

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
            <button
              onClick={() => {
                setShowPostForm(!showPostForm);
                setEditingPost(null);
                setTitle("");
                setContent("");
                setImage(null);
              }}
            >
              {showPostForm ? "Cancel" : "+ New Post"}
            </button>
          </div>

          {showPostForm && (
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
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
              />
              <button type="submit">
                {editingPost ? "Update Post" : "Create Post"}
              </button>
            </form>
          )}

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
    </div>
  );
}

export default GroupDetails;
