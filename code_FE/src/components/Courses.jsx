'use client';

import React from 'react';
import { FaPlayCircle, FaStar } from 'react-icons/fa';

export default function Courses() {
  const courses = [
    {
      title: "Business Intelligence & Data Analysis",
      description: "Master the most in-demand skills today and get certified.",
      rating: 4.8,
      students: "12k",
      image: "linear-gradient(135deg, #FF6B6B, #556270)",
      duration: "8 Weeks",
    },
    {
      title: "Full-Stack Web Development Bootcamp",
      description: "From HTML to React and Node.js – Become a complete developer.",
      rating: 4.9,
      students: "18k",
      image: "linear-gradient(135deg, #135bec, #4bc0c8)",
      duration: "12 Weeks",
    },
    {
      title: "Digital Marketing Strategy 2026",
      description: "Learn SEO, SEM, and Social Media Marketing from experts.",
      rating: 4.7,
      students: "9k",
      image: "linear-gradient(135deg, #FDB99B, #CF8BF3, #A770EF)",
      duration: "6 Weeks",
    },
  ];

  return (
    <section id="courses" className="section courses-section">
      <div className="container">
        <div className="section-title">
          <h2>Explore Top Courses</h2>
          <p>
            Master the most in-demand skills today.
          </p>
        </div>

        <div className="grid-3">
          {courses.map((course, idx) => (
            <div key={idx} className="course-card">
              <div className="course-thumb" style={{ background: course.image }}>
                <span className="course-badge">Best Seller</span>
              </div>
              <div className="course-content">
                <div className="course-meta">
                  <span className="meta-item"><FaStar className="star-icon"/> {course.rating}</span>
                  <span className="meta-item">{course.students} Students</span>
                </div>
                <h3 className="course-title">{course.title}</h3>
                <p className="course-desc">{course.description}</p>
                <div className="course-footer">
                  <span className="duration">{course.duration}</span>
                  <button className="btn-link">View Details &rarr;</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button className="btn btn-secondary">
            View Marketplace
          </button>
        </div>
      </div>

      <style jsx>{`
        .courses-section {
          background-color: var(--bg-light);
        }

        .course-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid #eee;
        }

        .course-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        }

        .course-thumb {
          height: 180px;
          position: relative;
        }
        
        .course-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: rgba(0,0,0,0.6);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          backdrop-filter: blur(4px);
        }

        .course-content {
          padding: 1.5rem;
        }

        .course-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .star-icon { color: #fbbf24; }

        .course-title {
          font-size: 1.125rem;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }

        .course-desc {
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .course-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #f3f4f6;
        }
        
        .duration {
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .btn-link {
          color: var(--primary);
          font-weight: 600;
          font-size: 0.9rem;
          padding: 0;
        }
        .btn-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </section>
  );
}
