import React from 'react';

const ErrorModal = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: '1.5rem',
        maxWidth: '350px',
        width: '90%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e5e7eb',
        position: 'relative',
      }}>
        {/* Error Icon */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '0.75rem',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#fef2f2',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: '2px solid #fecaca',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#dc2626"/>
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <h3 style={{
          color: '#dc2626',
          fontSize: '1.1rem',
          fontWeight: 700,
          textAlign: 'center',
          margin: '0 0 0.5rem 0',
        }}>
          Validation Required
        </h3>
        
        <p style={{
          color: '#374151',
          fontSize: '0.9rem',
          lineHeight: 1.4,
          textAlign: 'left',
          margin: '0 0 1rem 0',
          whiteSpace: 'pre-line',
        }}>
          {message}
        </p>

        {/* Close Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
        }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '0.5rem 1.5rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
          >
            Understood
          </button>
        </div>

        {/* Close button in top-right corner */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            background: 'none',
            border: 'none',
            fontSize: '1.25rem',
            cursor: 'pointer',
            color: '#9ca3af',
            padding: '0.25rem',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ErrorModal; 