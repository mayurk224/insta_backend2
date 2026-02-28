import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchFeed } from "../services/feed.api";
import PostCard from "./PostCard";
import PostSkeleton from "./PostSkeleton";
import "../styles/feed.scss";

const LIMIT = 6;

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  const loadPage = useCallback(
    async (pg, replace = false) => {
      try {
        if (pg === 1) setInitialLoading(true);
        else setLoadingMore(true);
        setError(null);
        const res = await fetchFeed({ page: pg, limit: LIMIT });
        const list = Array.isArray(res?.posts) ? res.posts : [];
        setHasMore(list.length === LIMIT);
        setPosts((prev) => (replace ? list : [...prev, ...list]));
      } catch (err) {
        setError(err?.message || "Failed to load feed");
      } finally {
        setInitialLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadPage(1, true);
  }, [loadPage]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && hasMore && !loadingMore && !initialLoading) {
          const next = page + 1;
          setPage(next);
          loadPage(next);
        }
      },
      { rootMargin: "300px" },
    );
    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [page, hasMore, loadingMore, initialLoading, loadPage]);

  const updatePost = useCallback((id, updater) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === id ? updater(p) : p)),
    );
  }, []);

  const content = useMemo(() => {
    if (initialLoading) {
      return (
        <div className="feed-list">
          {Array.from({ length: LIMIT }).map((_, idx) => (
            <PostSkeleton key={idx} />
          ))}
        </div>
      );
    }
    if (error) {
      return (
        <div role="alert" className="feed-error">
          <p>{error}</p>
          <button type="button" onClick={() => loadPage(1, true)}>
            Retry
          </button>
        </div>
      );
    }
    if (posts.length === 0) {
      return (
        <div className="feed-empty" aria-live="polite">
          <p>No posts yet</p>
        </div>
      );
    }
    return (
      <>
        <div className="feed-list">
          {posts.map((p) => (
            <PostCard key={p._id} post={p} onUpdate={updatePost} />
          ))}
        </div>
        <div ref={sentinelRef} style={{ height: 1 }} />
        {loadingMore && (
          <div className="feed-loading-more" aria-live="polite">
            Loading more...
          </div>
        )}
      </>
    );
  }, [initialLoading, error, posts, updatePost, loadingMore, loadPage]);

  return <section className="feed-root">{content}</section>;
};

export default Feed;
