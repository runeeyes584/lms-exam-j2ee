'use client';

import React from 'react';

export default function Footer() {
  const links = {
    platform: ["Overview", "Features", "Pricing", "Releases"],
    resources: ["Blog", "Newsletter", "Events", "Help Centre"],
    company: ["About Us", "Careers", "Contact", "Partners"],
  };

  return (
    <footer className="footer-section">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h4>EduPlatform</h4>
            <p className="footer-desc">
              Empowering institutions and students with cutting-edge technology for a better learning future.
            </p>
          </div>
          <div className="footer-col">
            <h5>Platform</h5>
            <ul>{links.platform.map((link) => <li key={link}><a href="#">{link}</a></li>)}</ul>
          </div>
          <div className="footer-col">
            <h5>Resources</h5>
            <ul>{links.resources.map((link) => <li key={link}><a href="#">{link}</a></li>)}</ul>
          </div>
          <div className="footer-col">
            <h5>Company</h5>
            <ul>{links.company.map((link) => <li key={link}><a href="#">{link}</a></li>)}</ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2026 EduPlatform Inc. All rights reserved.</p>
          <div className="legal-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer-section {
          background-color: #f9fafb;
          color: var(--text-secondary);
          padding: 6rem 0 2rem;
          border-top: 1px solid #e5e7eb;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 4rem;
          margin-bottom: 4rem;
        }

        .footer-col h4 {
          color: var(--text-primary);
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .footer-col h5 {
          color: var(--text-primary);
          font-size: 1rem;
          margin-bottom: 1.25rem;
          font-weight: 600;
        }

        .footer-desc {
          font-size: 0.95rem;
          line-height: 1.6;
          max-width: 300px;
        }

        .footer-col ul li {
          margin-bottom: 0.75rem;
        }

        .footer-col a {
          font-size: 0.95rem;
          color: var(--text-secondary);
        }
        .footer-col a:hover {
          color: var(--primary);
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 2rem;
          border-top: 1px solid #e5e7eb;
          font-size: 0.875rem;
        }

        .legal-links {
          display: flex;
          gap: 2rem;
        }

        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .footer-bottom {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
