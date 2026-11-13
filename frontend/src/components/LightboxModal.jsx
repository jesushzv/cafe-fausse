import React, { useEffect, useRef } from "react";

export default function LightboxModal({
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}) {
  const isOpen = Boolean(currentIndex !== null && images && images[currentIndex]);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Open/Close Focus & Scroll Lock Effect
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === "function") {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  // Keyboard Listener Effect
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        onPrev();
      } else if (e.key === "ArrowRight") {
        onNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, onPrev, onNext]);

  if (!isOpen) return null;

  const activeImage = images[currentIndex];

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="lightbox-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`Image preview: ${activeImage.title}`}
      onClick={handleBackdropClick}
    >
      <div className="lightbox-dialog">
        <button
          ref={closeButtonRef}
          type="button"
          className="lightbox-close"
          onClick={onClose}
          aria-label="Close lightbox"
        >
          Close &times;
        </button>

        <div className="lightbox-stage">
          {images.length > 1 && (
            <button
              type="button"
              className="lightbox-nav lightbox-nav--prev"
              onClick={onPrev}
              aria-label="Previous image"
            >
              &#8249;
            </button>
          )}

          <img
            src={activeImage.src}
            alt={activeImage.alt}
            className="lightbox-img"
          />

          {images.length > 1 && (
            <button
              type="button"
              className="lightbox-nav lightbox-nav--next"
              onClick={onNext}
              aria-label="Next image"
            >
              &#8250;
            </button>
          )}
        </div>

        <div className="lightbox-meta">
          <div className="lightbox-meta__title">{activeImage.title}</div>
          <p className="lightbox-meta__caption">{activeImage.caption}</p>
          <span className="lightbox-meta__counter">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
      </div>
    </div>
  );
}

