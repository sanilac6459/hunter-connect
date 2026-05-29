import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import PostCard from "../components/PostCard";
import { useNavigate } from "react-router-dom";

function Feed() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      // Get all groups the user is a member of
      const membershipsRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/memberships`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Fetch posts from each group
      const postPromises = membershipsRes.data.map((group) =>
        axios.get(`${import.meta.env.VITE_API_URL}/posts/group/${group.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );

      const postResults = await Promise.all(postPromises);

      // Flatten all posts into one array and sort by newest first
      const allPosts = postResults
        .flatMap((res) => res.data)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setPosts(allPosts);
    } catch {
      setPosts([]);
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
    fetchFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!token) return null;

  return (
    <div className="container">
      <div className="home-header">
        <h1>Your Feed</h1>
      </div>
      {loading && <p>Loading...</p>}
      {!loading && posts.length === 0 && (
        <p>No posts yet. Join some clubs to see their updates here!</p>
      )}
      <div className="posts-list">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={user}
            isAdmin={false}
            onDelete={() => fetchFeed()}
            onEdit={() => {}}
          />
        ))}
      </div>
    </div>
  );
}

export default Feed;
