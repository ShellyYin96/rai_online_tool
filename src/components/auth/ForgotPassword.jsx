import React, { useState } from 'react';

const ForgotPassword = ({ isOpen, onClose, forgotPassword, forgotMsg, forgotError }) => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!forgotPassword) return;
    setSubmitting(true);
    await forgotPassword(email);
    setSubmitting(false);
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal compact-auth">
        <button className="auth-modal-close" onClick={onClose}>&times;</button>
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit} className="auth-form compact-auth-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>
          {forgotError && <div className="auth-error">{forgotError}</div>}
          {forgotMsg && <div className="auth-success">{forgotMsg}</div>}
          <button type="submit" className="auth-btn compact-btn" disabled={submitting}>{submitting ? 'Sending...' : 'Send Reset Link'}</button>
        </form>
        <style>{`
          .compact-auth {
            max-width: 380px;
            margin: 0 auto;
            padding: 2rem;
            border-radius: 16px;
            background: #ffffff;
            box-shadow: 0 8px 32px rgba(34,197,94,0.15);
            border: 1px solid #e5e7eb;
          }
          .compact-auth h2 {
            color: #16a34a;
            font-size: 1.5rem;
            font-weight: 700;
            margin: 0 0 1.5rem 0;
            text-align: center;
            letter-spacing: -0.025em;
          }
          .compact-auth-form label {
            display: block;
            color: #374151;
            font-size: 0.9rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
          }
          .compact-auth-form input {
            width: 100%;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            border: 1.5px solid #d1d5db;
            font-size: 1rem;
            margin-bottom: 1rem;
            transition: all 0.2s ease;
            box-sizing: border-box;
          }
          .compact-auth-form input:focus {
            outline: none;
            border-color: #16a34a;
            box-shadow: 0 0 0 3px rgba(22,163,74,0.1);
          }
          .compact-btn {
            width: 100%;
            padding: 0.875rem 1.5rem;
            font-size: 1rem;
            font-weight: 600;
            border-radius: 8px;
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: #ffffff;
            border: none;
            margin-top: 0.5rem;
            margin-bottom: 1rem;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 14px rgba(34,197,94,0.3);
          }
          .compact-btn:hover:not(:disabled) {
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(34,197,94,0.4);
          }
          .compact-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
          }
          .auth-error {
            color: #dc2626;
            font-size: 0.9rem;
            margin: 0.5rem 0;
            padding: 0.75rem 1rem;
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .auth-error::before {
            content: "⚠";
            font-size: 1rem;
          }
          .auth-success {
            color: #16a34a;
            font-size: 0.9rem;
            margin: 0.5rem 0;
            padding: 0.75rem 1rem;
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .auth-success::before {
            content: "✓";
            font-size: 1rem;
            font-weight: bold;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ForgotPassword; 