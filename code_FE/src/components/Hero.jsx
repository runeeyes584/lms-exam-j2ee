'use client';

import React from 'react';
import { FaPlay, FaArrowRight, FaCheckCircle } from 'react-icons/fa';

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-content">
        <div className="hero-text">
          <h1 className="hero-title">
            The Future of <span className="highlight">Learning</span> Is Here.
          </h1>
          <p className="hero-description">
            Unlock your potential with our all-in-one ecosystem. Whether you're mastering a new skill or managing a university, we have the tools you need.
          </p>
          
          <div className="hero-actions">
            <button className="btn btn-primary">
              Start Learning <FaArrowRight style={{ marginLeft: '8px' }} />
            </button>
            <button className="btn btn-secondary">
              <FaPlay style={{ marginRight: '8px', fontSize: '0.8rem' }} /> Request Demo
            </button>
          </div>

          <div className="hero-stat">
            <FaCheckCircle className="check-icon" />
            <span>Join 50,000+ learners today</span>
          </div>
        </div>

        <div className="hero-visual">
          {/* Placeholder for a hero image or graphic */}
          <div className="visual-card">
            <div className="card-header">
              <div className="dot red"></div>
              <div className="dot yellow"></div>
              <div className="dot green"></div>
            </div>
            <div className="card-body">
              <div className="stat-row">
                <span className="label">Exam Status</span>
                <span className="value success">Passed 98%</span>
              </div>
              <div className="chart-placeholder">
                <div className="bar" style={{ height: '60%' }}></div>
                <div className="bar" style={{ height: '80%' }}></div>
                <div className="bar active" style={{ height: '100%' }}></div>
                <div className="bar" style={{ height: '70%' }}></div>
              </div>
              <div className="course-card-mini">
                <div className="icon-box">DS</div>
                <div>
                  <div className="course-title">Data Science</div>
                  <div className="course-progress">
                    <div className="progress-bar" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero {
          padding-top: 140px;
          padding-bottom: 100px;
          background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
          position: relative;
          overflow: hidden;
        }
        
        .hero-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .hero-title {
          font-size: 3.75rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          letter-spacing: -0.03em;
          color: var(--text-primary);
        }

        .highlight {
          color: var(--primary);
          position: relative;
          display: inline-block;
        }
        
        .hero-description {
          font-size: 1.25rem;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: 2.5rem;
          max-width: 540px;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .hero-stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .check-icon {
          color: #10b981;
        }

        /* Visual Graphic Styling */
        .visual-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.15);
          padding: 1.5rem;
          transform: perspective(1000px) rotateY(-5deg) rotateX(2deg);
          transition: transform 0.3s ease;
          border: 1px solid rgba(0,0,0,0.05);
        }
        
        .visual-card:hover {
          transform: perspective(1000px) rotateY(0deg) rotateX(0deg);
        }

        .card-header {
          display: flex;
          gap: 6px;
          margin-bottom: 1.5rem;
        }
        .dot { width: 10px; height: 10px; border-radius: 50%; }
        .red { background: #ff5f57; }
        .yellow { background: #febc2e; }
        .green { background: #28c840; }

        .stat-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          font-weight: 600;
        }
        .success { color: #10b981; }

        .chart-placeholder {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          height: 120px;
          margin-bottom: 2rem;
          padding-bottom: 10px;
          border-bottom: 2px solid #f3f4f6;
        }
        .bar {
          flex: 1;
          background: #e5e7eb;
          border-radius: 4px 4px 0 0;
          transition: height 1s ease;
        }
        .bar.active { background: var(--primary); }

        .course-card-mini {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #f9fafb;
          padding: 1rem;
          border-radius: 12px;
        }
        .icon-box {
          width: 40px;
          height: 40px;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.8rem;
        }
        .course-title { font-weight: 600; font-size: 0.9rem; margin-bottom: 4px; }
        .course-progress {
          width: 100px;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
        }
        .progress-bar {
          height: 100%;
          background: #10b981;
          border-radius: 3px;
        }

        @media (max-width: 992px) {
          .hero-content {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .hero-text {
            margin: 0 auto;
          }
          .hero-description {
            margin: 0 auto 2.5rem;
          }
          .hero-actions {
            justify-content: center;
          }
          .hero-stat {
            justify-content: center;
          }
          .hero-visual {
            margin-top: 4rem;
          }
          .hero-title {
            font-size: 2.75rem;
          }
        }
      `}</style>
    </section>
  );
}
