'use client';

import React from 'react';
import { FaQuoteLeft } from 'react-icons/fa';

export default function Testimonials() {
  const testimonials = [
    {
      name: "Emily R.",
      role: "Computer Science Student",
      quote: "The live exam feature is incredibly smooth. I never have to worry about connection drops, and the UI is so intuitive. EduPlatform changed how I study.",
    },
    {
      name: "Prof. David K.",
      role: "Dean at Tech University",
      quote: "Managing 5,000 students was a nightmare until we switched. The dashboard gives us real-time insights that we just couldn't get anywhere else.",
    },
    {
      name: "Sarah M.",
      role: "Corporate Trainer",
      quote: "We use the marketplace to upskill our entire engineering team. The quality of courses is consistently high and the tracking is superb.",
    },
  ];

  return (
    <section id="testimonials" className="section testimonials-section">
      <div className="container">
        <div className="section-title">
          <h2>Trusted by the best</h2>
          <p>
            Join the platform that's powering the next generation of learners and leaders.
          </p>
        </div>

        <div className="grid-3 testimonials-grid">
          {testimonials.map((t, idx) => (
            <div key={idx} className="testimonial-card">
              <FaQuoteLeft className="quote-icon" />
              <p className="quote-text">"{t.quote}"</p>
              <div className="author">
                <div className="avatar">{t.name[0]}</div>
                <div>
                  <div className="author-name">{t.name}</div>
                  <div className="author-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .testimonials-section {
          background-color: var(--white);
        }

        .testimonials-grid {
          gap: 2rem;
        }

        .testimonial-card {
          padding: 2rem;
          background: #f9fafb;
          border-radius: 12px;
          border: 1px solid #f3f4f6;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          position: relative;
        }

        .quote-icon {
          color: rgba(19, 91, 236, 0.1);
          font-size: 2.5rem;
          position: absolute;
          top: 1.5rem;
          left: 1.5rem;
        }

        .quote-text {
          font-size: 1.125rem;
          line-height: 1.7;
          color: var(--text-primary);
          margin-bottom: 2rem;
          position: relative;
          z-index: 1;
          font-style: italic;
          padding-left: 2.5rem;
        }

        .author {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--text-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.25rem;
        }

        .author-name {
          font-weight: 700;
          font-size: 1rem;
          color: var(--text-primary);
        }

        .author-role {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
      `}</style>
    </section>
  );
}
