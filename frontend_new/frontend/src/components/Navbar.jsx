'use client';

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const Navbar = () => {
  const { logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 md:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link
              to="/home"
              className="flex items-center gap-2.5 group"
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--r-md)',
                background: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: '0 2px 10px rgba(0,0,0,0.30)',
              }}
              className="group-hover:scale-105"
              >
                <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--accent-fg)', letterSpacing: '-0.02em' }}>CS</span>
              </div>
              <span style={{
                fontWeight: 700,
                fontSize: '1.05rem',
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }} className="hidden sm:inline">
                ClearSight
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link to="/home" className="nav-link">
              Home
            </Link>
            <Link to="/history" className="nav-link">
              History
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: 'var(--r-pill)',
                background: 'var(--accent)',
                color: 'var(--accent-fg)',
                fontWeight: 600,
                fontSize: '0.825rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s ease, transform 0.15s ease',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;