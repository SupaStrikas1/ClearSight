"use client";

import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import API_BASE from "../api";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, { username, password });
      login(res.data.token);
    } catch (_) {
      setError("Invalid credentials");
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background */}
      <div className="cs-bg"><div className="orb3" /></div>

      {/* ClearSight wordmark */}
      <div className="fade-in-up" style={{ marginBottom: '2rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.625rem',
          marginBottom: '0.5rem',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--r-md)',
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.30)',
          }}>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--accent-fg)' }}>CS</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            ClearSight
          </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
          AI-Powered Image Enhancement
        </p>
      </div>

      {/* Glass Card */}
      <div className="glass fade-in-up" style={{
        width: '100%',
        maxWidth: '400px',
        padding: 'clamp(1.75rem, 5vw, 2.5rem)',
        position: 'relative',
        zIndex: 1,
        animationDelay: '0.08s',
      }}>
        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            margin: '0 0 0.3rem',
          }}>
            Welcome back
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
            Sign in to your account
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="cs-error" style={{ marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label className="cs-label" htmlFor="login-username">Username</label>
            <input
              id="login-username"
              type="text"
              className="cs-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your username"
              required
            />
          </div>

          <div>
            <label className="cs-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="cs-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '0.25rem' }}>
            Sign In
          </button>
        </form>

        <div className="cs-divider" />

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}
            onMouseEnter={e => e.target.style.textDecoration = 'underline'}
            onMouseLeave={e => e.target.style.textDecoration = 'none'}
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;