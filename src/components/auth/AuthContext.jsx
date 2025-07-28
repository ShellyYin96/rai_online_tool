import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { username, email, ... }

  // Real backend login
  const login = async ({ usernameOrEmail, password }) => {
    const res = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail, password })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Login failed');
    }
    const data = await res.json();
    
    // Fetch full profile data
    try {
      const profileRes = await fetch(`http://localhost:3001/api/auth/profile/${data.email}`);
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUser({
          username: profileData.user.username,
          email: profileData.user.email,
          role: profileData.user.role,
          school: profileData.user.school,
          country: profileData.user.country,
          city: profileData.user.city,
          avatar: profileData.user.avatar
        });
      } else {
        // Fallback to basic user data if profile fetch fails
        setUser({ username: data.username, email: data.email, role: data.role });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to basic user data
      setUser({ username: data.username, email: data.email, role: data.role });
    }
    
    return true;
  };

  // Real backend register
  const register = async ({ username, email, password }) => {
    const res = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Registration failed');
    }
    return true;
  };

  // Simulated email verification (not implemented)
  const verify = async (email) => {
    if (email) {
      return 'Verification email sent!';
    }
    throw new Error('Verification failed');
  };

  // Real backend forgot password
  const forgotPassword = async (email) => {
    const res = await fetch('http://localhost:3001/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to send reset link');
    }
    const data = await res.json();
    return data.message;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, register, verify, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  );
}; 