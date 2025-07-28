import React, { useState } from 'react';

const Login = ({ onLogin, onShowRegister, onShowForgot }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    onLogin({ email, password });
  };

  return (
    <div className="auth-container compact-auth">
      <h2>Login</h2>
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
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="Password"
          />
        </label>
        {error && <div className="auth-error">{error}</div>}
        <button type="submit" className="auth-btn compact-btn">Login</button>
      </form>
      <div className="auth-links compact-links">
        <button onClick={onShowRegister} className="auth-link compact-link">Register</button>
        <button onClick={onShowForgot} className="auth-link compact-link">Forgot password?</button>
      </div>
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
        .compact-btn:hover {
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(34,197,94,0.4);
        }
        .compact-links {
          display: flex;
          justify-content: space-between;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        .compact-link {
          background: none;
          border: none;
          color: #16a34a;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        .compact-link:hover {
          background: #f0fdf4;
          color: #15803d;
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
      `}</style>
    </div>
  );
};

export default Login; 