// shows each club's details, posts, and allows members to create/edit/delete posts and leave the club

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import PostCard from "../components/PostCard";

// group details page component
function GroupDetails() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [editingPost, setEditingPost] = useState(null);

  // fetch the club details and posts when the page first loads
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        // fetch club details from the backend
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/groups/${id}`,
        );
        setGroup(response.data);
      } catch {
        alert("Failed to fetch group.");
      }
    };

    // fetch posts for this club and confirm the user is a member
    const fetchPosts = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/posts/group/${id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setPosts(response.data);
        setIsMember(true);
      } catch {
        setIsMember(false);
      }
    };

    fetchGroup();
    if (token) fetchPosts();
  }, [id, token]);

  // refetch posts after creating/editing/deleting a post
  const refetchPosts = useCallback(async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/posts/group/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPosts(response.data);
      setIsMember(true);
    } catch {
      setIsMember(false);
    }
  }, [id, token]);

  // handle closing the create/edit post modal
  const handleCloseModal = () => {
    setShowPostForm(false);
    setEditingPost(null);
    setTitle("");
    setContent("");
    setImage(null);
  };

  // handle form submission to create a new post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (image) formData.append("image", image);

      // send create post request to the backend
      await axios.post(
        `${import.meta.env.VITE_API_URL}/posts/group/${id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      handleCloseModal();
      refetchPosts();
    } catch {
      alert("Failed to create post.");
    }
  };

  // handle deleting a post
  const handleDeletePost = async (postId) => {
    try {
      // send delete request to the backend
      await axios.delete(`${import.meta.env.VITE_API_URL}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      refetchPosts();
    } catch {
      alert("Failed to delete post.");
    }
  };

  // handle editing a post
  const handleEditPost = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (image) formData.append("image", image);

      // send update request to the backend
      await axios.put(
        `${import.meta.env.VITE_API_URL}/posts/${editingPost.id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      handleCloseModal();
      refetchPosts();
    } catch {
      alert("Failed to update post.");
    }
  };

  // handle leaving the group
  const handleLeaveGroup = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/memberships/leave/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      navigate("/");
    } catch {
      alert("Failed to leave group.");
    }
  };

  // handle deleting the group
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

  if (!group) return <div className="container">Loading...</div>; // show loading state while fetching group details

  // render the group details page
  return (
    <div className="container">
      <div className="group-header">
        <div className="group-header-top">
          <div className="group-header-left">
            {group.imageUrl ? (
              <img
                src={group.imageUrl}
                alt={group.name}
                className="group-details-avatar"
              />
            ) : (
              <div className="group-details-avatar-placeholder">
                {group.name.charAt(0).toUpperCase()}
              </div>
            )}
            <h1>{group.name}</h1>
          </div>
          {user && isMember && (
            <div className="group-actions">
              <button onClick={handleLeaveGroup}>Leave Group</button>
              <button onClick={handleDeleteGroup}>Delete Group</button>
            </div>
          )}
        </div>
        <p>{group.description}</p>
      </div>

      {!token && <p>Please login to view posts and join this group.</p>}

      {token && !isMember && (
        <p>You are not a member of this group. Join to see posts!</p>
      )}

      {isMember && (
        <>
          <div className="posts-header">
            <h2>Posts</h2>
            <button onClick={() => setShowPostForm(true)}>+ New Post</button>
          </div>

          {showPostForm && (
            <div className="modal-overlay" onClick={handleCloseModal}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={handleCloseModal}>
                  ✕
                </button>
                <h2>{editingPost ? "Edit Post" : "Create a New Post"}</h2>
                <form
                  className="create-form"
                  onSubmit={editingPost ? handleEditPost : handleCreatePost}
                >
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      placeholder="Post title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Content</label>
                    <textarea
                      placeholder="Post content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImage(e.target.files[0])}
                    />
                  </div>
                  <button type="submit">
                    {editingPost ? "Update Post" : "Create Post"}
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="posts-list">
            {posts.length === 0 && <p>No posts yet. Be the first to post!</p>}
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={user}
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
