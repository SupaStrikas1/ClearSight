"use client";

import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import API_BASE from "../api";

const Home = () => {
  const [file, setFile] = useState(null);
  const [degradedUrl, setDegradedUrl] = useState("");
  const [cleanUrl, setCleanUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { token } = useContext(AuthContext);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) { clearInterval(interval); return 100; }
          return prev + 1;
        });
      }, 300);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) { setFile(selectedFile); setError(""); }
  };

  const handleUpload = async () => {
    if (!file) { setError("Please select an image first"); return; }
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("image", file);

    try {
      // Start API request and a 30-second timer simultaneously
      const uploadPromise = axios.post(
        `${API_BASE}/api/images/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` } }
      );
      const timerPromise = new Promise(resolve => setTimeout(resolve, 30000));

      const [res] = await Promise.all([uploadPromise, timerPromise]);

      setDegradedUrl(res.data.degradedUrl);
      setCleanUrl(res.data.cleanUrl);
    } catch (_) {
      setError("Upload failed. Please try again.");
    }
    setLoading(false);
  };

  const forceDownload = async (url, filename = "enhanced-image.jpg") => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch image");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      alert("Could not download the image. Try right-click → Save image as.");
    }
  };

  return (
    <div className="cs-page" style={{ minHeight: '100vh' }}>
      {/* Animated background */}
      <div className="cs-bg"><div className="orb3" /></div>

      <Navbar />

      <main style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 5rem)',
        padding: '2rem 1rem',
      }}>
        <div style={{ width: '100%', maxWidth: '860px' }} className="fade-in-up">
          {!cleanUrl ? (
            /* ── Upload Card ── */
            <div className="glass" style={{ padding: 'clamp(1.5rem, 4vw, 3rem)' }}>
              <div className="cs-section-header">
                <h2>Enhance Image</h2>
                <p>Upload your image for AI-powered processing</p>
              </div>

              {error && (
                <div className="cs-error" style={{ marginBottom: '1.5rem' }}>
                  {error}
                </div>
              )}

              {/* Drop Zone */}
              <div style={{ marginBottom: '2rem' }}>
                <label className="cs-label" htmlFor="file-upload">
                  Select Document / Image
                </label>
                <div className={`cs-dropzone ${file ? 'has-file' : ''}`} style={{ position: 'relative' }}>
                  <input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    disabled={loading}
                    style={{
                      position: 'absolute', inset: 0, width: '100%', height: '100%',
                      opacity: 0, cursor: loading ? 'not-allowed' : 'pointer', zIndex: 2,
                    }}
                  />
                  {file ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                      <div className="cs-img-frame" style={{
                        height: '200px', maxWidth: '340px', margin: '0 auto 1rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
                        {file.name}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                      <svg
                        style={{ display: 'block', margin: '0 auto 1rem', color: 'var(--accent)', opacity: 0.7 }}
                        width="48" height="48" stroke="currentColor" fill="none" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', margin: '0 0 0.4rem' }}>
                        Click or drag to upload image
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                        Supported: PNG, JPG, GIF (up to 50MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Area */}
              {!loading ? (
                <button
                  className="btn-primary"
                  onClick={handleUpload}
                  disabled={!file}
                >
                  PROCESS IMAGE
                </button>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Processing…
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>
                      {progress}%
                    </span>
                  </div>
                  <div className="cs-progress-track">
                    <div className="cs-progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.75rem', textAlign: 'center', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Applying AI Enhancements
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* ── Results Card ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="glass" style={{ padding: 'clamp(1.5rem, 4vw, 3rem)' }}>
                <div className="cs-section-header">
                  <h2>Enhancement Results</h2>
                  <p>Compare the original and enhanced images</p>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '2rem',
                  marginBottom: '2rem',
                }}>
                  {/* Original */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Original Image
                    </p>
                    <div className="cs-img-frame" style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', flex: 1  }}>
                      <img src={degradedUrl || "/placeholder.svg"} alt="Degraded" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                  </div>

                  {/* Enhanced */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Enhanced Image
                    </p>
                    <div className="cs-img-frame" style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', flex: 1 }}>
                      <img src={cleanUrl || "/placeholder.svg"} alt="Clean" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <button
                      className="btn-primary"
                      onClick={() => forceDownload(cleanUrl, `enhanced-${new Date().toISOString().split("T")[0]}.jpg`)}
                    >
                      DOWNLOAD ENHANCED IMAGE
                    </button>
                  </div>
                </div>
              </div>

              {/* Process Another */}
              <button
                className="btn-secondary"
                onClick={() => { setFile(null); setDegradedUrl(""); setCleanUrl(""); }}
              >
                PROCESS ANOTHER IMAGE
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
