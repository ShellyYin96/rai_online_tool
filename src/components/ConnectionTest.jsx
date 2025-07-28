import React, { useState, useEffect } from 'react';
import API_BASE_URL, { makeApiRequest } from '../config.js';

const ConnectionTest = () => {
  const [status, setStatus] = useState('Testing...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        setStatus('Testing connection...');
        console.log('API Base URL:', API_BASE_URL);
        
        // Test a simple GET request
        const response = await makeApiRequest('/api/case-studies');
        const data = await response.json();
        
        setStatus('✅ Connection successful! Backend is responding.');
        console.log('Connection test successful:', data);
      } catch (err) {
        setError(err.message);
        setStatus('❌ Connection failed');
        console.error('Connection test failed:', err);
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>Backend Connection Test</h3>
      <p><strong>API URL:</strong> {API_BASE_URL}</p>
      <p><strong>Status:</strong> {status}</p>
      {error && (
        <p style={{ color: 'red' }}>
          <strong>Error:</strong> {error}
        </p>
      )}
    </div>
  );
};

export default ConnectionTest; 