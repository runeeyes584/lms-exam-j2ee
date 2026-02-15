'use client';

import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = () => setMobileOpen(!mobileOpen);

  return (
    <nav className="header-nav">
      <div className="container header-container">
        <div className="logo">
          EduPlatform
        </div>
        
        <div className="desktop-menu">
          <a href="#features">Features</a>
          <a href="#marketplace">Marketplace</a>
          <a href="#pricing">Pricing</a>
          <a href="#institutions">Institutions</a>
        </div>
        
        <div className="actions">
          <a href="#login" className="login-link">Log in</a>
          <button className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>
            Get Started
          </button>
        </div>

        <button className="mobile-toggle" onClick={toggleMobile}>
          {mobileOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {mobileOpen && (
        <div className="mobile-menu">
          <a href="#features" onClick={toggleMobile}>Features</a>
          <a href="#marketplace" onClick={toggleMobile}>Marketplace</a>
          <a href="#pricing" onClick={toggleMobile}>Pricing</a>
          <a href="#institutions" onClick={toggleMobile}>Institutions</a>
          <a href="#login" onClick={toggleMobile}>Log in</a>
        </div>
      )}
      
      <style jsx>{`
        .header-nav {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          z-index: 1000;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
        }
        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 80px;
        }
        .logo {
          font-weight: 800;
          font-size: 1.5rem;
          color: var(--primary);
          letter-spacing: -0.02em;
        }
        .desktop-menu {
          display: flex;
          gap: 2.5rem;
        }
        .desktop-menu a {
          font-weight: 500;
          color: var(--text-secondary);
        }
        .desktop-menu a:hover {
          color: var(--primary);
        }
        .actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .login-link {
          font-weight: 600;
          color: var(--text-primary);
        }
        .mobile-toggle {
          display: None;
          font-size: 1.5rem;
          color: var(--text-primary);
        }
        
        @media (max-width: 992px) {
          .desktop-menu { display: none; }
          .actions { display: none; }
          .mobile-toggle { display: block; }
        }
        
        .mobile-menu {
          background: white;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          border-bottom: 1px solid #eee;
        }
        .mobile-menu a {
          font-size: 1.125rem;
          font-weight: 600;
        }
      `}</style>
    </nav>
  );
}
