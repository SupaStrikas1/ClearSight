'use client';

import React from 'react';

const ImageModal = ({ degradedUrl, cleanUrl, onClose, onDownload }) => {
  /* Close on backdrop click */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '1rem',
      }}
    >
      {/* Modal Container */}
      <div
        className="glass-modal fade-in-up"
        style={{
          width: '100%',
          maxWidth: '900px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--glass-border)',
          flexShrink: 0,
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: 0,
          }}>
            Image Comparison
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--r-pill)',
              border: '1px solid var(--glass-border)',
              background: 'var(--glass-bg)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'color 0.2s, background 0.2s, transform 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.background = 'rgba(255,80,80,0.12)';
              e.currentTarget.style.borderColor = 'rgba(255,80,80,0.35)';
              e.currentTarget.style.transform = 'rotate(90deg) scale(1.05)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.background = 'var(--glass-bg)';
              e.currentTarget.style.borderColor = 'var(--glass-border)';
              e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* Images Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '1.5rem',
          }}>
            {/* Original */}
            <div>
              <div style={{ marginBottom: '0.75rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.15rem' }}>
                  Original Image
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Input image</p>
              </div>
              <div className="cs-img-frame" style={{ minHeight: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={degradedUrl || "/placeholder.svg"}
                  alt="Original"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', minHeight: '280px' }}
                />
              </div>
            </div>

            {/* Enhanced */}
            <div>
              <div style={{ marginBottom: '0.75rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.15rem' }}>
                  Enhanced Image
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--accent)', margin: 0, fontWeight: 500 }}>AI enhanced output</p>
              </div>
              <div className="cs-img-frame" style={{ minHeight: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={cleanUrl || "/placeholder.svg"}
                  alt="Enhanced"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', minHeight: '280px' }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '0.875rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--divider)',
          }}
            className="flex-col-mobile"
          >
            <button
              onClick={onDownload}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Enhanced
            </button>
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;