import React, { useState } from 'react';

const EmailVerification = ({ onVerify, onShowLogin }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    // Call onVerify with email
    onVerify(email).then(msg => setMessage(msg)).catch(err => setError(err.message));
  };

  return (
    <div className="auth-container">
      <h2>Email Verification</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </label>
        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}
        <button type="submit" className="auth-btn">Send Verification Email</button>
      </form>
      <div className="auth-links">
        <button onClick={onShowLogin} className="auth-link">Back to Login</button>
      </div>
    </div>
  );
};

export default EmailVerification; 