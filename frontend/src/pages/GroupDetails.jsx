import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import PostCard from "../components/PostCard";

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

  const fetchGroup = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/groups/${id}`);
      setGroup(response.data);
    } catch {
      alert("Failed to fetch group.");
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/posts/group/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPosts(response.data);
      setIsMember(true);
    } catch {
      setIsMember(false);
    }
  };

  useEffect(() => {
    fetchGroup();
    if (token) fetchPosts();
  }, [id]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (image) formData.append("image", image);

      await axios.post(`http://localhost:3000/posts/group/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      await axios.delete(`http://localhost:3000/posts/${postId}`, {
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
        `http://localhost:3000/posts/${editingPost.id}`,
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
      await axios.delete(`http://localhost:3000/memberships/leave/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/");
    } catch {
      alert("Failed to leave group.");
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await axios.delete(`http://localhost:3000/groups/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/");
    } catch {
      alert("Failed to delete group.");
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
            <button onClick={handleLeaveGroup}>Leave Group</button>
            <button onClick={handleDeleteGroup}>Delete Group</button>
          </div>
        )}
      </div>

      {!token && <p>Please login to view posts and join this group.</p>}

      {token && !isMember && (
        <p>You are not a member of this group. Join to see posts!</p>
      )}

      {isMember && (
        <>
          <div className="posts-header">
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
