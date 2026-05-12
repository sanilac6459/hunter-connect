function PostCard({ post, currentUser, onDelete, onEdit }) {
  return (
    <div className="post-card">
      <h3>{post.title}</h3>
      <p>{post.content}</p>
      <small>Posted by {post.user.name}</small>
      {currentUser && currentUser.id === post.userId && (
        <div className="post-actions">
          <button onClick={() => onEdit(post)}>Edit</button>
          <button onClick={() => onDelete(post.id)}>Delete</button>
        </div>
      )}
    </div>
  );
}

export default PostCard;
