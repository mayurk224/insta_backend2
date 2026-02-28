import React from "react";
import "../styles/feed.scss";

const PostSkeleton = () => {
  return (
    <article className="post-card skeleton" aria-busy="true">
      <header className="pc-header">
        <div className="pc-avatar skeleton-box" />
        <div className="pc-user">
          <div className="skeleton-line short" />
          <div className="skeleton-line tiny" />
        </div>
      </header>
      <div className="pc-media skeleton-box" style={{ height: 320 }} />
      <div className="pc-body">
        <div className="skeleton-line" />
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
      </div>
    </article>
  );
};

export default PostSkeleton;

