import React, { useState, memo } from 'react';
import { FaBell, FaTimes, FaCheckCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Package Delivered',
      message: 'Your package #PKG-001 has been delivered successfully',
      timestamp: new Date(Date.now() - 5 * 60000)
    },
    {
      id: 2,
      type: 'info',
      title: 'Package Shipped',
      message: 'Your package #PKG-002 has been shipped and is on the way',
      timestamp: new Date(Date.now() - 30 * 60000)
    },
    {
      id: 3,
      type: 'warning',
      title: 'Delivery Delayed',
      message: 'Your package #PKG-003 delivery has been delayed',
      timestamp: new Date(Date.now() - 2 * 60 * 60000)
    }
  ]);

  const [isOpen, setIsOpen] = useState(false);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle style={{ color: '#10b981' }} />;
      case 'warning':
        return <FaExclamationCircle style={{ color: '#f59e0b' }} />;
      case 'info':
        return <FaInfoCircle style={{ color: '#6366f1' }} />;
      default:
        return <FaBell />;
    }
  };

  const formatTime = (date) => {
    const minutes = Math.floor((Date.now() - date) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '1.3rem',
          cursor: 'pointer',
          position: 'relative',
          color: 'var(--dark-color)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'}
        onMouseLeave={(e) => e.target.style.color = 'var(--dark-color)'}
      >
        <FaBell />
        {notifications.length > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            background: 'var(--danger-color)',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}>
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          right: '-320px',
          top: '40px',
          width: '350px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          maxHeight: '500px',
          overflowY: 'auto',
          zIndex: 1000,
          animation: 'slideUp 0.3s ease'
        }}>
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h4 style={{ margin: 0, color: 'var(--dark-color)', fontSize: '1rem' }}>
              Notifications
            </h4>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                color: '#9ca3af'
              }}
            >
              <FaTimes />
            </button>
          </div>

          {notifications.length === 0 ? (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: '#9ca3af'
            }}>
              <p>No notifications</p>
            </div>
          ) : (
            <div>
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    background: 'rgba(0, 0, 0, 0.02)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.02)'}
                >
                  <div style={{ fontSize: '1.2rem', marginTop: '0.2rem' }}>
                    {getIcon(notif.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: '600',
                      color: 'var(--dark-color)',
                      fontSize: '0.95rem',
                      marginBottom: '0.25rem'
                    }}>
                      {notif.title}
                    </div>
                    <div style={{
                      color: '#6b7280',
                      fontSize: '0.85rem',
                      marginBottom: '0.5rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {notif.message}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#9ca3af'
                    }}>
                      {formatTime(notif.timestamp)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notif.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(NotificationCenter);
