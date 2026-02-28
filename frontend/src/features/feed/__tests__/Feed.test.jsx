import React from "react";
import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Feed from "../components/Feed";
import { ToastProvider } from "../../../context/ToastContext.jsx";

vi.mock("../services/feed.api", () => ({
  fetchFeed: vi.fn(),
}));

const { fetchFeed } = await import("../services/feed.api");

describe("Feed", () => {
  beforeAll(() => {
    window.IntersectionObserver = class {
      constructor(cb) { this.cb = cb; }
      observe() { /* no-op */ }
      disconnect() { /* no-op */ }
    };
  });
  afterAll(() => {
    delete window.IntersectionObserver;
  });
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when no posts", async () => {
    fetchFeed.mockResolvedValueOnce({ success: true, posts: [], page: 1, count: 0 });
    render(<ToastProvider><Feed /></ToastProvider>);
    await waitFor(() => {
      expect(screen.getByText(/No posts yet/i)).toBeInTheDocument();
    });
  });

  it("renders posts after successful fetch", async () => {
    const posts = [
      { _id: "1", userId: { username: "alice", profile: { avatarUrl: "" } }, mediaUrl: "https://example.com/1.jpg", mediaType: "image", caption: "hello", likesCount: 0, commentsCount: 0, createdAt: new Date().toISOString() },
      { _id: "2", userId: { username: "bob", profile: { avatarUrl: "" } }, mediaUrl: "https://example.com/2.jpg", mediaType: "image", caption: "world", likesCount: 3, commentsCount: 1, createdAt: new Date().toISOString() },
    ];
    fetchFeed.mockResolvedValueOnce({ success: true, posts, page: 1, count: posts.length });
    render(<ToastProvider><Feed /></ToastProvider>);
    await waitFor(() => {
      expect(screen.getByText(/@alice/i)).toBeInTheDocument();
      expect(screen.getByText(/@bob/i)).toBeInTheDocument();
    });
  });

  it("handles network errors with retry", async () => {
    fetchFeed.mockRejectedValueOnce(new Error("Network error"));
    fetchFeed.mockResolvedValueOnce({ success: true, posts: [], page: 1, count: 0 });
    render(<ToastProvider><Feed /></ToastProvider>);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    await waitFor(() => {
      expect(screen.getByText(/No posts yet/i)).toBeInTheDocument();
    });
  });

  it("handles malformed responses gracefully", async () => {
    fetchFeed.mockResolvedValueOnce({ success: true, posts: null });
    render(<ToastProvider><Feed /></ToastProvider>);
    await waitFor(() => {
      expect(screen.getByText(/No posts yet/i)).toBeInTheDocument();
    });
  });
});
