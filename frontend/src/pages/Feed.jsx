import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import PostCard from "../components/PostCard";
import EventCard from "../components/EventCard";
import { useNavigate } from "react-router-dom";

function Feed() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      // get all groups the user is a member of
      const membershipsRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/memberships`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const groups = membershipsRes.data;

      // fetch posts and events from each group
      const postPromises = groups.map((group) =>
        axios.get(`${import.meta.env.VITE_API_URL}/posts/group/${group.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );

      const eventPromises = groups.map((group) =>
        axios.get(`${import.meta.env.VITE_API_URL}/events/group/${group.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );

      const [postResults, eventResults] = await Promise.all([
        Promise.all(postPromises),
        Promise.all(eventPromises),
      ]);

      // flatten and sort posts by newest first
      const allPosts = postResults
        .flatMap((res, i) =>
          res.data.map((post) => ({ ...post, groupName: groups[i].name })),
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // flatten and sort events by date
      const allEvents = eventResults
        .flatMap((res, i) =>
          res.data.map((event) => ({ ...event, group: groups[i] })),
        )
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setPosts(allPosts);
      setEvents(allEvents);
    } catch {
      setPosts([]);
      setEvents([]);
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
      {loading && <p>Loading...</p>}

      {!loading && (
        <>
          <div className="home-header">
            <h1>Upcoming Events</h1>
          </div>
          {events.length === 0 ? (
            <p>No upcoming events from your clubs.</p>
          ) : (
            <div className="events-list">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  currentUser={user}
                  isAdmin={false}
                  onRSVP={fetchFeed}
                  onDelete={fetchFeed}
                />
              ))}
            </div>
          )}

          <div className="home-header" style={{ marginTop: "2rem" }}>
            <h1>Latest Posts</h1>
          </div>
          {posts.length === 0 ? (
            <p>No posts yet. Join some clubs to see their updates here!</p>
          ) : (
            <div className="posts-list">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={user}
                  isAdmin={false}
                  onDelete={fetchFeed}
                  onEdit={() => {}}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Feed;
