import React, { useMemo, useState } from "react";
import { useToast } from "../../../context/ToastContext";
import { addComment, toggleLike, toggleSave } from "../../posts/services/posts.api";
import "../styles/feed.scss";

function timeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, Math.floor((now - then) / 1000));
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];
  for (const [name, sec] of units) {
    const val = Math.floor(diff / sec);
    if (val >= 1) return `${val} ${name}${val > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

const PostCard = ({ post, onUpdate }) => {
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState({ like: false, save: false, comment: false });
  const { showToast } = useToast();

  const avatar = useMemo(() => post?.userId?.profile?.avatarUrl || "", [post]);
  const username = useMemo(() => post?.userId?.username || "unknown", [post]);
  const created = useMemo(() => timeAgo(post?.createdAt), [post?.createdAt]);

  const handleLike = async () => {
    if (busy.like) return;
    try {
      setBusy((b) => ({ ...b, like: true }));
      onUpdate?.(post._id, (p) => ({
        ...p,
        liked: !p.liked,
        likesCount: (p.likesCount || 0) + (p.liked ? -1 : 1),
      }));
      const res = await toggleLike(post._id);
      const liked = !!res?.liked;
      onUpdate?.(post._id, (p) => ({
        ...p,
        liked,
        likesCount: Math.max(0, p.likesCount ?? 0),
      }));
    } catch (err) {
      onUpdate?.(post._id, (p) => ({
        ...p,
        liked: !p.liked,
        likesCount: (p.likesCount || 0) + (p.liked ? 1 : -1),
      }));
      showToast(err?.message || "Failed to toggle like", "error");
    } finally {
      setBusy((b) => ({ ...b, like: false }));
    }
  };

  const handleSave = async () => {
    if (busy.save) return;
    try {
      setBusy((b) => ({ ...b, save: true }));
      onUpdate?.(post._id, (p) => ({ ...p, saved: !p.saved }));
      const res = await toggleSave(post._id);
      const saved = !!res?.saved;
      onUpdate?.(post._id, (p) => ({ ...p, saved }));
    } catch (err) {
      onUpdate?.(post._id, (p) => ({ ...p, saved: !p.saved }));
      showToast(err?.message || "Failed to toggle save", "error");
    } finally {
      setBusy((b) => ({ ...b, save: false }));
    }
  };

  const handleAddComment = async () => {
    const text = comment.trim();
    if (!text) return;
    if (busy.comment) return;
    try {
      setBusy((b) => ({ ...b, comment: true }));
      onUpdate?.(post._id, (p) => ({
        ...p,
        commentsCount: (p.commentsCount || 0) + 1,
      }));
      await addComment(post._id, text);
      setComment("");
      showToast("Comment added", "success");
    } catch (err) {
      onUpdate?.(post._id, (p) => ({
        ...p,
        commentsCount: Math.max(0, (p.commentsCount || 1) - 1),
      }));
      showToast(err?.message || "Failed to add comment", "error");
    } finally {
      setBusy((b) => ({ ...b, comment: false }));
    }
  };

  return (
    <article className="post-card">
      <header className="pc-header">
        {avatar ? (
          <img src={avatar} alt="" className="pc-avatar" />
        ) : (
          <div aria-hidden="true" className="pc-avatar" />
        )}
        <div className="pc-user">
          <div className="pc-username">@{username}</div>
          <div className="pc-time">{created}</div>
        </div>
      </header>
      <div className="pc-media">
        {post?.mediaType === "video" ? (
          <video controls src={post?.mediaUrl} />
        ) : (
          <img src={post?.mediaUrl} alt="" />
        )}
      </div>
      {!!post?.caption && (
        <div className="pc-caption">{post.caption}</div>
      )}
      <footer className="pc-actions">
        <button
          type="button"
          className="pc-btn"
          aria-pressed={post?.liked ? "true" : "false"}
          onClick={handleLike}
          disabled={busy.like}
        >
          {post?.liked ? "♥ Liked" : "♡ Like"} • {post?.likesCount ?? 0}
        </button>
        <button
          type="button"
          className="pc-btn"
          aria-pressed={post?.saved ? "true" : "false"}
          onClick={handleSave}
          disabled={busy.save}
        >
          {post?.saved ? "✓ Saved" : "＋ Save"}
        </button>
      </footer>
      <div className="pc-interact">
        <input
          type="text"
          className="pc-input"
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={busy.comment}
        />
        <button
          type="button"
          className="pc-add"
          onClick={handleAddComment}
          disabled={busy.comment || !comment.trim()}
        >
          Add Comment
        </button>
      </div>
    </article>
  );
};

export default PostCard;

