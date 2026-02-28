import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaTruck, FaBell, FaChartLine, FaShieldAlt } from 'react-icons/fa';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: <FaTruck size={32} />,
      title: 'Real-Time Tracking',
      description: 'Get live updates on your package location and delivery status',
      color: 'primary'
    },
    {
      icon: <FaBell size={32} />,
      title: 'Smart Notifications',
      description: 'Receive instant alerts for important delivery milestones',
      color: 'secondary'
    },
    {
      icon: <FaChartLine size={32} />,
      title: 'Advanced Analytics',
      description: 'View detailed reports and delivery performance metrics',
      color: 'success'
    },
    {
      icon: <FaShieldAlt size={32} />,
      title: 'Secure & Reliable',
      description: 'Your data is protected with enterprise-grade security',
      color: 'warning'
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="hero" style={{ paddingTop: '6rem', paddingBottom: '6rem', marginBottom: '2rem' }}>
        <div className="container">
          <h1 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '1.5rem' }}>
            📦 Track Smarter, Deliver Faster
          </h1>
          <p style={{ fontSize: '1.3rem', marginBottom: '3rem', opacity: 0.95 }}>
            Experience the next generation of package delivery tracking. Real-time updates, beautiful analytics, and complete peace of mind.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {!isAuthenticated ? (
              <>
                <button className="btn btn-primary" onClick={() => navigate('/register')} style={{ padding: '1rem 2.5rem', fontSize: '1.05rem' }}>
                  Get Started Free
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/login')} style={{ padding: '1rem 2.5rem', fontSize: '1.05rem' }}>
                  Sign In
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ padding: '1rem 2.5rem', fontSize: '1.05rem' }}>
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="page-container">
        <div className="container">
          {/* Features Grid */}
          <section style={{ marginBottom: '4rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '1rem', color: 'white' }}>
                Why Choose DeliveryTracker?
              </h2>
              <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)' }}>
                Powerful features designed to make package tracking simple and delightful
              </p>
            </div>

            <div className="grid grid-3">
              {features.map((feature, idx) => (
                <div key={idx} className="stat-card" style={{ borderTop: `4px solid var(--${feature.color}-color)` }}>
                  <div className="stat-icon" style={{ color: `var(--${feature.color}-color)` }}>
                    {feature.icon}
                  </div>
                  <h3 style={{ color: 'var(--dark-color)', marginTop: '1rem', fontSize: '1.1rem' }}>{feature.title}</h3>
                  <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: '0.75rem 0 0 0' }}>{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Stats Section */}
          <section style={{ marginBottom: '4rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '3rem', color: 'white' }}>Trusted by Thousands</h2>
            <div className="grid grid-3">
              {[{ number: '50K+', label: 'Active Users' }, { number: '2M+', label: 'Packages Tracked' }, { number: '99.9%', label: 'Uptime' }].map((stat, idx) => (
                <div key={idx} className="card">
                  <div style={{ fontSize: '2.5rem', fontWeight: '900', background: 'linear-gradient(135deg, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>{stat.number}</div>
                  <p style={{ color: '#6b7280', fontSize: '1rem', margin: 0 }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          {!isAuthenticated && (
            <section style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(236, 72, 153, 0.15))', border: '2px solid rgba(99, 102, 241, 0.2)', borderRadius: '16px', padding: '3rem', textAlign: 'center', marginTop: '3rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem', color: 'white' }}>Start Tracking Today</h2>
              <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>No credit card required. Get started in seconds.</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => navigate('/register')} style={{ padding: '0.85rem 2rem' }}>Create Free Account</button>
                <button className="btn btn-secondary" onClick={() => navigate('/login')} style={{ padding: '0.85rem 2rem' }}>Already Have an Account?</button>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: 'rgba(31, 41, 55, 0.95)', color: 'rgba(255,255,255,0.7)', padding: '2rem', textAlign: 'center', marginTop: '4rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container">
          <p style={{ margin: 0 }}>© 2026 DeliveryTracker. All rights reserved. | Made with ❤️ for better deliveries</p>
        </div>
      </footer>
    </>
  );
};

export default HomePage;
