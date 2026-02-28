import React, { useState } from 'react';
import { FaStar, FaUser, FaCalendarAlt, FaThumbsUp } from 'react-icons/fa';

const RatingsPage = () => {
  const [ratings] = useState([
    {
      id: 1,
      packageId: 'PKG-001',
      rating: 5,
      title: 'Excellent Service!',
      comment: 'Package arrived on time and in perfect condition. Great tracking updates throughout the delivery.',
      author: 'John Doe',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      helpful: 24
    },
    {
      id: 2,
      packageId: 'PKG-002',
      rating: 4,
      title: 'Good Experience',
      comment: 'Delivery was fast. Only minor issue with the packaging but overall very satisfied.',
      author: 'Jane Smith',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      helpful: 12
    },
    {
      id: 3,
      packageId: 'PKG-003',
      rating: 5,
      title: 'Outstanding',
      comment: 'Real-time tracking is amazing! Knew exactly when my package would arrive.',
      author: 'Mike Johnson',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      helpful: 18
    }
  ]);

  const avgRating = (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1);
  const ratingDistribution = {
    5: ratings.filter(r => r.rating === 5).length,
    4: ratings.filter(r => r.rating === 4).length,
    3: ratings.filter(r => r.rating === 3).length,
    2: ratings.filter(r => r.rating === 2).length,
    1: ratings.filter(r => r.rating === 1).length
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <FaStar
        key={i}
        size={16}
        style={{
          color: i < rating ? '#f59e0b' : '#d1d5db',
          marginRight: '2px'
        }}
      />
    ));
  };

  return (
    <div className="page-container">
      <div className="container">
        <div className="hero" style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⭐ Customer Ratings & Reviews</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>See what our customers are saying</p>
        </div>

        {/* Overall Rating */}
        <div className="card" style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <div style={{ paddingBottom: '1.5rem' }}>
            <div style={{
              fontSize: '4rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0.5rem 0'
            }}>
              {avgRating}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', margin: '1rem 0' }}>
              {renderStars(Math.round(parseFloat(avgRating)))}
            </div>
            <p style={{ color: '#6b7280', fontSize: '1.05rem' }}>
              Based on {ratings.length} reviews
            </p>
          </div>

          {/* Rating Distribution */}
          <div style={{ marginTop: '2rem', textAlign: 'left' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--dark-color)' }}>Rating Distribution</h3>
            {[5, 4, 3, 2, 1].map(star => (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                <span style={{ width: '60px', textAlign: 'right', fontWeight: '500' }}>
                  {star} <FaStar size={14} style={{ display: 'inline', marginLeft: '0.25rem' }} />
                </span>
                <div style={{
                  flex: 1,
                  height: '8px',
                  background: 'rgba(0,0,0,0.1)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(ratingDistribution[star] / ratings.length) * 100}%`,
                    background: `linear-gradient(90deg, #f59e0b, #ec4899)`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <span style={{ width: '40px', textAlign: 'right', color: '#6b7280', fontSize: '0.9rem' }}>
                  {ratingDistribution[star]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '2rem', color: 'var(--dark-color)', fontSize: '1.5rem' }}>
            Latest Reviews
          </h2>

          <div className="grid" style={{ gap: '2rem' }}>
            {ratings.map(review => (
              <div key={review.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {renderStars(review.rating)}
                    </div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--dark-color)', fontSize: '1.1rem' }}>
                      {review.title}
                    </h3>
                  </div>
                  <span style={{
                    background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                    color: 'white',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                  }}>
                    {review.packageId}
                  </span>
                </div>

                <p style={{ color: '#6b7280', marginBottom: '1rem', lineHeight: '1.6' }}>
                  {review.comment}
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(0,0,0,0.08)',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#6b7280' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FaUser size={14} />
                      {review.author}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FaCalendarAlt size={14} />
                      {review.date.toLocaleDateString()}
                    </span>
                  </div>
                  <button style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: 'none',
                    color: 'var(--primary-color)',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'}
                  >
                    <FaThumbsUp size={14} />
                    Helpful ({review.helpful})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingsPage;
