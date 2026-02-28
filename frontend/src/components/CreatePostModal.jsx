import React, { useEffect, useRef, useState } from "react";
import "./CreatePostModal.scss";
import { useToast } from "../context/ToastContext";
import { createPost } from "../features/posts/services/posts.api";

const CAPTION_MAX = 2200;
const MAX_FILE_SIZE_MB = 20;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
];

const CreatePostModal = ({ isOpen, onClose, onSuccess }) => {
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Tab") {
        const focusable = dialogRef.current.querySelectorAll(
          'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    setTimeout(() => closeBtnRef.current?.focus(), 0);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setCaption("");
      setMedia(null);
      setErrors({});
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const validate = () => {
    const errs = {};
    if (!media) errs.media = "Please select an image or video.";
    if (caption.length > CAPTION_MAX)
      errs.caption = `Caption exceeds ${CAPTION_MAX} characters.`;
    if (media) {
      if (!ALLOWED_TYPES.includes(media.type)) {
        errs.media =
          "Unsupported file type. Use JPG, PNG, WEBP, GIF, MP4, MOV, or WEBM.";
      }
      const sizeMb = media.size / (1024 * 1024);
      if (sizeMb > MAX_FILE_SIZE_MB) {
        errs.media = `File must be under ${MAX_FILE_SIZE_MB}MB.`;
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setMedia(file);
    setErrors((prev) => ({ ...prev, media: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      const form = new FormData();
      form.append("caption", caption);
      form.append("media", media);
      const res = await createPost(form);
      showToast(res.message || "Post created", "success");
      onSuccess?.(res.post);
      onClose();
    } catch (err) {
      const msg =
        err?.message || err?.error || "Failed to create post. Please try again.";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="cp-modal-overlay"
      onClick={handleOverlayClick}
      aria-hidden="true"
    >
      <div
        className="cp-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-post-title"
        aria-describedby="create-post-description"
        ref={dialogRef}
      >
        <div className="cp-modal-header">
          <h2 id="create-post-title">Create Post</h2>
          <button
            type="button"
            className="cp-close"
            aria-label="Close"
            onClick={onClose}
            ref={closeBtnRef}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="cp-form">
          <div id="create-post-description" className="sr-only">
            Upload an image or video and add an optional caption.
          </div>
          <div className="cp-field">
            <label htmlFor="cp-media">Media</label>
            <input
              id="cp-media"
              name="media"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
              onChange={handleFileChange}
              required
              aria-invalid={!!errors.media}
              aria-describedby={errors.media ? "cp-media-error" : undefined}
            />
            {errors.media && (
              <div id="cp-media-error" className="cp-error" role="alert">
                {errors.media}
              </div>
            )}
            <div className="cp-hint">
              JPG, PNG, WEBP, GIF, MP4, MOV, or WEBM. Max {MAX_FILE_SIZE_MB}MB.
            </div>
          </div>
          <div className="cp-field">
            <label htmlFor="cp-caption">Caption</label>
            <textarea
              id="cp-caption"
              name="caption"
              rows={4}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={CAPTION_MAX}
              aria-invalid={!!errors.caption}
              aria-describedby="cp-caption-help"
              placeholder="Write a caption..."
            />
            <div id="cp-caption-help" className="cp-help">
              {caption.length}/{CAPTION_MAX}
            </div>
            {errors.caption && (
              <div className="cp-error" role="alert">
                {errors.caption}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="cp-submit"
            disabled={submitting}
            aria-busy={submitting ? "true" : "false"}
          >
            {submitting ? "Posting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;

