'use client';

import React from 'react';
import { FaChalkboardTeacher, FaAward, FaBrain } from 'react-icons/fa';

export default function Features() {
  const features = [
    {
      icon: <FaChalkboardTeacher />,
      title: "Learn from the Best",
      description: "Access courses curated by top professors and industry leaders from around the globe.",
      color: "#e11d48", // Rose Red
    },
    {
      icon: <FaAward />,
      title: "Secure Certifications",
      description: "Earn recognized certificates that are blockchain-verified and shareable on LinkedIn.",
      color: "#2563eb", // Royal Blue
    },
    {
      icon: <FaBrain />,
      title: "AI Progress Tracking",
      description: "Get personalized insights on your learning habits and areas for improvement.",
      color: "#7c3aed", // Violet
    },
  ];

  return (
    <section id="features" className="section features-section">
      <div className="container">
        <div className="section-title">
          <h2>One Platform, Endless Possibilities</h2>
          <p>
            Tailored experiences whether you are looking to learn or looking to teach.
          </p>
        </div>

        <div className="grid-3 features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon" style={{ backgroundColor: `${feature.color}15`, color: feature.color }}>
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .features-section {
          background-color: var(--white);
        }

        .feature-card {
          padding: 2.5rem;
          border-radius: 12px;
          border: 1px solid #f3f4f6;
          transition: all 0.3s ease;
          background: var(--bg-light);
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--card-shadow);
          background: white;
          border-color: transparent;
        }

        .feature-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .feature-title {
          font-size: 1.25rem;
          margin-bottom: 1rem;
        }

        .feature-desc {
          font-size: 1rem;
          line-height: 1.6;
          color: var(--text-secondary);
        }
      `}</style>
    </section>
  );
}
