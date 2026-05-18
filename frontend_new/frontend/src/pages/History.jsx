'use client';

import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import ImageModal from "../components/ImageModal";
import { AuthContext } from "../context/AuthContext";
import API_BASE from "../api";

const History = () => {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/images/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistory(res.data);
      } catch (_) {
        console.error("History fetch error");
      }
    };
    fetchHistory();
  }, [token]);

  const openModal  = (item) => setSelected(item);
  const closeModal = () => setSelected(null);

  const handleDownload = () => {
    if (selected && selected.cleanUrl) {
      const link = document.createElement("a");
      link.href = selected.cleanUrl;
      link.download = `enhanced-image-${new Date(selected.createdAt).toISOString().split("T")[0]}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("No enhanced image available for download");
    }
  };

  return (
    <div className="cs-page">
      {/* Animated background */}
      <div className="cs-bg"><div className="orb3" /></div>

      <Navbar />

      <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(1.5rem, 4vw, 3rem) 1rem' }}>
        {/* Page Header */}
        <div className="fade-in-up" style={{ maxWidth: '1200px', margin: '0 auto 2.5rem', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: 'var(--text-primary)',
            margin: '0 0 0.4rem',
          }}>
            Image History
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
            Browse your previously enhanced images
          </p>
        </div>

        {history.length > 0 ? (
          <div className="fade-in-up" style={{ maxWidth: '1200px', margin: '0 auto', animationDelay: '0.1s' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '1.25rem',
            }}>
              {history.map((item, index) => (
                <div
                  key={index}
                  className="cs-history-card"
                  onClick={() => openModal(item)}
                  style={{ animationDelay: `${0.05 * index}s` }}
                >
                  {/* Thumbnail */}
                  <div style={{
                    position: 'relative',
                    height: '180px',
                    overflow: 'hidden',
                    background: 'var(--input-bg)',
                  }}>
                    <img
                      src={item.cleanUrl}
                      alt="Thumbnail"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.35s ease',
                        display: 'block',
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                    {/* Gradient overlay */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)',
                      pointerEvents: 'none',
                    }} />
                  </div>

                  {/* Meta */}
                  <div style={{
                    padding: '0.875rem 1rem',
                    borderTop: '1px solid var(--glass-border)',
                  }}>
                    <p style={{
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      color: 'var(--text-primary)',
                      margin: '0 0 0.2rem',
                    }}>
                      {new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="fade-in-up" style={{ maxWidth: '480px', margin: '0 auto', animationDelay: '0.1s' }}>
            <div className="glass" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
              <svg
                style={{ display: 'block', margin: '0 auto 1.25rem', color: 'var(--accent)', opacity: 0.5 }}
                width="64" height="64" stroke="currentColor" fill="none" viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: '0 0 0.5rem',
                letterSpacing: '-0.02em',
              }}>
                No Enhanced Images Yet
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0 0 1.75rem', lineHeight: 1.6 }}>
                Start by uploading an image on the home page to see your enhancement history here.
              </p>
              <a
                href="/home"
                className="btn-primary"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 2rem',
                  textDecoration: 'none',
                  background: 'var(--accent)',
                  color: 'var(--accent-fg)',
                  borderRadius: 'var(--r-md)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  letterSpacing: '0.05em',
                  width: 'auto',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.20)',
                  transition: 'background 0.2s, transform 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Go to Home
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <ImageModal
          degradedUrl={selected.degradedUrl}
          cleanUrl={selected.cleanUrl}
          onClose={closeModal}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
};

export default History;