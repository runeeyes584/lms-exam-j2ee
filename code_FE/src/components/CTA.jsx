'use client';

import React from 'react';
import { FaFacebook, FaLinkedin, FaTwitter, FaCheckCircle } from 'react-icons/fa';

export default function CTA() {
  return (
    <section className="section cta-section">
      <div className="container cta-container">
        <h2 className="cta-title">Ready to transform your education?</h2>
        <p className="cta-description">
          Join the platform that's powering the next generation of learners and leaders.
        </p>

        <div className="cta-actions">
          <button className="btn btn-primary">Start Learning Now</button>
          <button className="btn btn-secondary">Request a Demo</button>
        </div>

        <div className="cta-trust">
          <FaCheckCircle className="check-icon" /> No credit card required for 14-day trial
        </div>

        <div className="cta-social">
          <p className="social-text">Follow us</p>
          <div className="social-links">
            <a href="#" className="social-icon"><FaFacebook /></a>
            <a href="#" className="social-icon"><FaLinkedin /></a>
            <a href="#" className="social-icon"><FaTwitter /></a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cta-section {
          background-color: var(--bg-light);
          text-align: center;
          padding: 8rem 0;
          background: radial-gradient(circle at center, #ffffff 0%, #f3f4f6 100%);
        }

        .cta-container {
          max-width: 800px;
        }

        .cta-title {
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }

        .cta-description {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-bottom: 3rem;
        }

        .cta-actions {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .cta-trust {
          font-size: 0.95rem;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 3rem;
        }

        .check-icon { color: #10b981; }

        .cta-social {
          border-top: 1px solid #e5e7eb;
          padding-top: 2rem;
          display: inline-block;
          width: 100%;
          max-width: 400px;
        }
        
        .social-text {
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .social-links {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
        }

        .social-icon {
          font-size: 1.5rem;
          color: var(--text-secondary);
          transition: color 0.2s;
        }
        .social-icon:hover {
          color: var(--primary);
        }
      `}</style>
    </section>
  );
}
