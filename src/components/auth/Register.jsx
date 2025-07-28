import React, { useState } from 'react';

const Register = ({ onRegister, onShowLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginOption, setShowLoginOption] = useState(false);
  const [showForgotOption, setShowForgotOption] = useState(false);

  const passwordRules = [
    'At least 8 characters long',
    'Contains at least one letter',
    'Contains at least one number'
  ];

  const validatePassword = (pw) => {
    return pw.length >= 8 && /[A-Za-z]/.test(pw) && /[0-9]/.test(pw);
  };

  const getPasswordStrength = (pw) => {
    if (!pw) return { strength: 0, color: '#6b7280' };
    if (pw.length < 8) return { strength: 1, color: '#ef4444' };
    if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return { strength: 2, color: '#f59e0b' };
    return { strength: 3, color: '#10b981' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setShowLoginOption(false);
    setShowForgotOption(false);
    
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields to create your account.');
      setIsLoading(false);
      return;
    }
    
    if (!validatePassword(password)) {
      setError('Your password must be at least 8 characters long and contain both letters and numbers.');
      setIsLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please make sure both passwords are identical.');
      setIsLoading(false);
      return;
    }
    
    try {
      await onRegister({ username, email, password });
    } catch (err) {
      if (err.message && err.message.includes('Account already exists')) {
        setError('An account with this email already exists. Please sign in or reset your password.');
        setShowLoginOption(true);
        setShowForgotOption(true);
      } else {
        setError('Unable to create your account. Please try again or contact support if the problem persists.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h2>Create Account</h2>
        <p>Join us to start collaborating on AI applications</p>
      </div>
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoComplete="username"
            placeholder="Choose a username"
            className="auth-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="Enter your email"
            className="auth-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">
            Password
            <span className="password-requirements-toggle" title="Password requirements">
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </span>
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="Create a strong password"
            className="auth-input"
          />
          
          {/* Password strength indicator */}
          {password && (
            <div className="password-strength">
              <div className="strength-bar">
                <div 
                  className="strength-fill" 
                  style={{ 
                    width: `${(passwordStrength.strength / 3) * 100}%`,
                    backgroundColor: passwordStrength.color 
                  }}
                />
              </div>
              <span className="strength-text" style={{ color: passwordStrength.color }}>
                {passwordStrength.strength === 0 && 'Enter a password'}
                {passwordStrength.strength === 1 && 'Too short'}
                {passwordStrength.strength === 2 && 'Add letters and numbers'}
                {passwordStrength.strength === 3 && 'Strong password'}
              </span>
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="Confirm your password"
            className="auth-input"
          />
          {confirmPassword && password !== confirmPassword && (
            <div className="password-mismatch">
              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Passwords don't match
            </div>
          )}
        </div>
        
        {error && (
          <div className="auth-error">
            <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        
        <button 
          type="submit" 
          className={`auth-btn primary-btn ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="spinner" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                  <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                  <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                </circle>
              </svg>
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>
      
      <div className="auth-links">
        <button onClick={onShowLogin} className="auth-link">
          Already have an account? <span>Sign in</span>
        </button>
        {showLoginOption && (
          <button onClick={onShowLogin} className="auth-link">
            <span>Sign in to existing account</span>
          </button>
        )}
        {showForgotOption && (
          <button onClick={() => window.dispatchEvent(new CustomEvent('showForgotPassword'))} className="auth-link">
            <span>Reset your password</span>
          </button>
        )}
      </div>
      
      <style>{`
        .auth-container {
          max-width: 420px;
          margin: 0 auto;
          padding: 2rem;
          border-radius: 16px;
          background: #ffffff;
          box-shadow: 0 8px 32px rgba(34,197,94,0.15);
          border: 1px solid #e5e7eb;
        }
        
        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .auth-header h2 {
          color: #16a34a;
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.025em;
        }
        
        .auth-header p {
          color: #6b7280;
          font-size: 0.95rem;
          margin: 0;
        }
        
        .auth-form {
          margin-bottom: 1.5rem;
        }
        
        .form-group {
          margin-bottom: 1.25rem;
        }
        
        .form-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #374151;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .password-requirements-toggle {
          color: #6b7280;
          cursor: help;
          transition: color 0.2s ease;
        }
        
        .password-requirements-toggle:hover {
          color: #16a34a;
        }
        
        .auth-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: 1.5px solid #d1d5db;
          background: #ffffff;
          color: #374151;
          font-size: 1rem;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        
        .auth-input::placeholder {
          color: #9ca3af;
        }
        
        .auth-input:focus {
          outline: none;
          border-color: #16a34a;
          box-shadow: 0 0 0 3px rgba(22,163,74,0.1);
        }
        
        .password-strength {
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .strength-bar {
          flex: 1;
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
          overflow: hidden;
        }
        
        .strength-fill {
          height: 100%;
          transition: all 0.3s ease;
        }
        
        .strength-text {
          font-size: 0.8rem;
          font-weight: 500;
          min-width: 80px;
        }
        
        .password-mismatch {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #dc2626;
          font-size: 0.8rem;
          margin-top: 0.5rem;
        }
        
        .auth-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #dc2626;
          font-size: 0.9rem;
          margin: 1rem 0;
          padding: 0.75rem 1rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
        }
        
        .error-icon {
          width: 1rem;
          height: 1rem;
          flex-shrink: 0;
        }
        
        .auth-btn {
          width: 100%;
          padding: 0.875rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .primary-btn {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(34,197,94,0.3);
        }
        
        .primary-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(34,197,94,0.4);
        }
        
        .primary-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        
        .spinner {
          width: 1.25rem;
          height: 1.25rem;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .auth-links {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          text-align: center;
        }
        
        .auth-link {
          background: none;
          border: none;
          color: #6b7280;
          font-size: 0.9rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        
        .auth-link:hover {
          color: #374151;
          background: #f9fafb;
        }
        
        .auth-link span {
          color: #16a34a;
          font-weight: 600;
        }
        
        .auth-link:hover span {
          color: #15803d;
        }
      `}</style>
    </div>
  );
};

export default Register; 