import React, { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register';
import EmailVerification from './EmailVerification';
import ForgotPassword from './ForgotPassword';
import { useAuth } from './AuthContext';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  // All hooks at the top!
  const [view, setView] = useState('login'); // 'login' | 'register' | 'verify'
  const [showForgot, setShowForgot] = useState(false);
  const [error, setError] = useState('');
  const { login, register, forgotPassword } = useAuth();
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');

  useEffect(() => {
    const handler = () => {
      setShowForgot(true);
    };
    window.addEventListener('showForgotPassword', handler);
    return () => window.removeEventListener('showForgotPassword', handler);
  }, []);

  if (!isOpen) return null;

  const handleLogin = async ({ email, password }) => {
    setError('');
    try {
      await login({ usernameOrEmail: email, password });
      if (onAuthSuccess) onAuthSuccess();
      onClose();
    } catch (err) {
      setError('Incorrect password. Please try again.');
    }
  };

  const handleRegister = async ({ username, email, password }) => {
    setError('');
    try {
      await register({ username, email, password });
      setView('login');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  const handleVerify = async (email) => {
    return 'Verification email sent! Please check your inbox.';
  };

  const handleForgot = async (email) => {
    setForgotError('');
    setForgotMsg('');
    try {
      const msg = await forgotPassword(email);
      setForgotMsg(msg);
    } catch (err) {
      setForgotError(err.message || 'Failed to send reset link.');
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <button className="auth-modal-close" onClick={onClose}>&times;</button>
        {error && <div style={{ color: '#ef4444', marginBottom: 8 }}>{error}</div>}
        {view === 'login' && !showForgot && (
          <Login 
            onLogin={handleLogin} 
            onShowRegister={() => setView('register')} 
            onShowForgot={() => setShowForgot(true)}
          />
        )}
        {view === 'register' && !showForgot && (
          <Register 
            onRegister={handleRegister} 
            onShowLogin={() => setView('login')} 
          />
        )}
        {view === 'verify' && !showForgot && (
          <EmailVerification 
            onVerify={handleVerify} 
            onShowLogin={() => setView('login')} 
          />
        )}
        {showForgot && (
          <ForgotPassword isOpen={showForgot} onClose={() => setShowForgot(false)} forgotPassword={handleForgot} forgotMsg={forgotMsg} forgotError={forgotError} />
        )}
      </div>
      <style>{`
        .auth-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .auth-modal {
          background: #fff;
          border-radius: 16px;
          padding: 2rem;
          min-width: 320px;
          max-width: 90vw;
          box-shadow: 0 8px 32px rgba(34,197,94,0.15);
          position: relative;
          border: 1px solid #e5e7eb;
        }
        .auth-modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 2rem;
          color: #6b7280;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        .auth-modal-close:hover {
          color: #16a34a;
        }
      `}</style>
    </div>
  );
};

export default AuthModal; 