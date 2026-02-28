import React, { useState } from "react";
import "./NavBar.scss";
import CreatePostModal from "./CreatePostModal";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../features/auth/hooks/useAuth";
import { useNavigate } from "react-router";

const NavBar = () => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { showToast } = useToast();
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();

  const onSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    showToast(`Search for "${q}" coming soon`, "success");
  };

  const handleCreateSuccess = () => {};

  const onLogout = async () => {
    try {
      const res = await handleLogout();
      showToast(res.message || "Logged out", "success");
      navigate("/sign-in");
    } catch {
      showToast("Failed to logout", "error");
    }
  };

  return (
    <>
      <header className="nb-root">
        <div className="nb-left">
          <img
            className="nb-logo"
            src="https://ik.imagekit.io/m0no8ccps/Untitled%20(6).png"
            alt="Glimpes logo"
          />
          <span className="nb-brand">Glimpes</span>
        </div>
        <div className="nb-center">
          <form onSubmit={onSearch} aria-label="Search">
            <input
              type="search"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search input"
            />
          </form>
        </div>
        <div className="nb-right">
          <button
            type="button"
            className="nb-create"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-controls="create-post-title"
          >
            Create Post
          </button>
          {user && (
            <button type="button" className="nb-logout" onClick={onLogout}>
              Logout
            </button>
          )}
        </div>
      </header>
      <CreatePostModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
};

export default NavBar;
