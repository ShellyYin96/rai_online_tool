import React, { useState, useEffect } from 'react';
import './TopBar.css';
import { useAuth } from './auth/AuthContext';
import AuthModal from './auth/AuthModal';
import { useNavigate } from 'react-router-dom';

// Move ProfileModal outside of TopBar
const ProfileModal = ({ user, open, onClose, form, setForm, onSave }) => {
  const [success, setSuccess] = useState('');
  
  if (!open) return null;
  
  const handleChange = e => {
    const { name, value } = e.target;
    // Prevent email changes since it's the account identifier
    if (name === 'email') {
      return;
    }
    setForm(f => ({ ...f, [name]: value }));
  };
  
  const handleSave = async (e) => {
    e.preventDefault();
    console.log('Save button clicked');
    try {
      console.log('Calling onSave...');
      await onSave();
      console.log('onSave completed successfully');
      setSuccess('Profile updated successfully!');
      console.log('Success message set');
      setTimeout(() => {
        console.log('Timeout triggered, closing modal');
        setSuccess('');
    onClose();
      }, 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSuccess('Error: ' + error.message);
    }
  };

  const avatars = [
    { id: 'default', name: 'Default', icon: '👤' },
    { id: 'student', name: 'Student', icon: '🎓' },
    { id: 'teacher', name: 'Teacher', icon: '👨‍🏫' },
    { id: 'researcher', name: 'Researcher', icon: '🔬' },
    { id: 'developer', name: 'Developer', icon: '💻' },
    { id: 'designer', name: 'Designer', icon: '🎨' },
    { id: 'administrator', name: 'School Administrator', icon: '🏫' },
    { id: 'policymaker', name: 'Policy Maker', icon: '📋' },
    { id: 'consultant', name: 'Consultant', icon: '💼' }
  ];

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.25)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', borderRadius: 20, padding: '2.5rem', minWidth: 320, maxWidth: '95vw', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 28, color: '#888', cursor: 'pointer' }}>&times;</button>
        
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ color: '#059669', marginBottom: 8, fontSize: '1.75rem', fontWeight: 700 }}>Update Profile</h2>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>Help us understand our community better</p>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 320 }}>
          
          {/* Required Fields */}
          <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 20 }}>
            <h3 style={{ color: '#374151', fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Required Information</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: 6, fontSize: '0.9rem' }}>
                Name *
              </label>
              <input 
                name="username" 
                value={form.username} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 12, border: '2px solid #e5e7eb', background: '#ffffff', color: '#374151', fontSize: '1rem', transition: 'all 0.2s ease', boxSizing: 'border-box' }}
                placeholder="Enter your name"
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: 6, fontSize: '0.9rem' }}>
                Email *
              </label>
              <input 
                name="email" 
                value={form.email} 
                readOnly
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 12, border: '2px solid #e5e7eb', background: '#f9fafb', color: '#6b7280', fontSize: '1rem', boxSizing: 'border-box', cursor: 'not-allowed' }}
                placeholder="Enter your email"
              />
              <small style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: 4, display: 'block' }}>
                Email cannot be changed as it's your account identifier
              </small>
            </div>
          </div>

          {/* Optional Demographics */}
          <div>
            <h3 style={{ color: '#374151', fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Optional Demographics</h3>
            <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: 20, lineHeight: 1.5 }}>
              These optional fields help us understand the diversity of perspectives in our community. 
              This information is used only for research analysis and will never be shared publicly.
            </p>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: 6, fontSize: '0.9rem' }}>
                School/Institution
          </label>
              <input 
                name="school" 
                value={form.school} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 12, border: '2px solid #e5e7eb', background: '#ffffff', color: '#374151', fontSize: '1rem', transition: 'all 0.2s ease', boxSizing: 'border-box' }}
                placeholder="e.g., University of Wisconsin-Madison"
              />
            </div>
            
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: 6, fontSize: '0.9rem' }}>
                  Country
          </label>
                <input 
                  name="country" 
                  value={form.country} 
                  onChange={handleChange} 
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 12, border: '2px solid #e5e7eb', background: '#ffffff', color: '#374151', fontSize: '1rem', transition: 'all 0.2s ease', boxSizing: 'border-box' }}
                  placeholder="e.g., United States"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: 6, fontSize: '0.9rem' }}>
                  City
          </label>
                <input 
                  name="city" 
                  value={form.city} 
                  onChange={handleChange} 
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 12, border: '2px solid #e5e7eb', background: '#ffffff', color: '#374151', fontSize: '1rem', transition: 'all 0.2s ease', boxSizing: 'border-box' }}
                  placeholder="e.g., Madison"
                />
              </div>
            </div>
          </div>

          {/* Profile Avatar */}
          <div>
            <h3 style={{ color: '#374151', fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Profile Avatar</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {avatars.map(avatar => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, avatar: avatar.id }))}
                  style={{
                    padding: '1rem',
                    border: form.avatar === avatar.id ? '3px solid #059669' : '2px solid #e5e7eb',
                    borderRadius: 12,
                    background: form.avatar === avatar.id ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    minHeight: 80
                  }}
                >
                  <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{avatar.icon}</span>
                  <span style={{ fontSize: '0.75rem', color: '#374151', fontWeight: 500, textAlign: 'center' }}>{avatar.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Notice */}
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: '1.2rem' }}>🔒</span>
              <h4 style={{ color: '#059669', fontSize: '1rem', fontWeight: 600, margin: 0 }}>Privacy & Data Usage</h4>
            </div>
            <p style={{ color: '#374151', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
              We collect optional demographic information to ensure diverse perspectives are represented in our research. 
              This data is anonymized and used only for analysis. Your privacy is protected and no personal information will be shared publicly.
            </p>
          </div>

          <button
            type="submit"
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 12,
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(5, 150, 105, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.3)';
            }}
          >
            Save Profile
          </button>
        </form>
      </div>
      
      {/* Floating Success Popup */}
      {success && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          color: '#ffffff',
          padding: '2rem 3rem',
          borderRadius: 20,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          zIndex: 3000,
          textAlign: 'center',
          minWidth: 300,
          border: '2px solid #ffffff'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.5rem' }}>Success!</div>
          <div style={{ fontSize: '1rem', opacity: 0.9 }}>{success}</div>
        </div>
      )}
    </div>
  );
};

const TopBar = ({ activeSection, onSectionChange }) => {
  const { user, logout, setUser } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    school: user?.school || '',
    country: user?.country || '',
    city: user?.city || '',
    avatar: user?.avatar || 'default'
  });

  const handleProfileClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    // Toggle dropdown menu
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  const handleSubmissionHistory = () => {
    setShowDropdown(false);
    navigate('/my-submissions');
  };

  const handleProfile = () => {
    setShowDropdown(false);
    
    // Initialize form with current user data (email cannot be changed)
    setForm({
      username: user.username || '',
      email: user.email || '', // Always use current email
      school: user.school || '',
      country: user.country || '',
      city: user.city || '',
      avatar: user.avatar || 'default'
    });
    setShowProfileModal(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.top-bar-profile')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleSaveProfile = async () => {
    console.log('handleSaveProfile called with form data:', form);
    try {
      const response = await fetch('http://localhost:3001/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          username: form.username,
          school: form.school,
          country: form.country,
          city: form.city,
          avatar: form.avatar
        }),
      });

      console.log('API response status:', response.status);
      const data = await response.json();
      console.log('API response data:', data);
      
      if (data.success) {
        // Update the user context with new profile data
        setUser({
          ...user,
          username: data.user.username,
          school: data.user.school,
          country: data.user.country,
          city: data.user.city,
          avatar: data.user.avatar
        });
        
        console.log('User context updated successfully');
        return Promise.resolve();
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const sections = [
    'About',
    'Chapters',
    'Hypothetical Applications',
    'Principles',
    'Resources',
  ];

  return (
    <div className="top-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'relative', minHeight: 64 }}>
      <nav className="topbar" style={{ display: 'flex', gap: 36 }}>
        {sections.map((section) => (
          <a 
            href="#" 
            className={`topbar-link${activeSection === section ? ' active' : ''}`} 
            key={section}
            onClick={(e) => {
              e.preventDefault();
              onSectionChange(section);
            }}
            style={{ fontSize: '1.18rem', fontWeight: 500 }}
          >
            {section}
          </a>
        ))}
      </nav>
      <div className="top-bar-profile" style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <button
            className="profile-btn"
            onClick={handleProfileClick}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <i className="fas fa-user-circle" style={{ fontSize: 32, color: '#16a34a' }}></i>
            {user && (
              <span style={{ fontWeight: 600, color: '#9ca3af', fontSize: '1.08em' }}>{user.username || user.email}</span>
            )}
          </button>
          {showDropdown && user && (
            <div className="profile-dropdown" style={{ 
              position: 'absolute', 
              top: 45, 
              right: 0, 
              background: '#ffffff', 
              border: '1px solid #e5e7eb', 
              borderRadius: 12, 
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', 
              minWidth: 220, 
              zIndex: 100, 
              padding: 0
            }}>
              <div style={{ 
                padding: '1rem 1.25rem', 
                borderBottom: '1px solid #f3f4f6', 
                color: '#374151', 
                fontWeight: 600, 
                fontSize: '0.95rem'
              }}>
                Hi, {user.username || user.email}
              </div>
              
              <div style={{ padding: '0.5rem 0' }}>
                <button 
                  onClick={handleSubmissionHistory} 
                  style={{ 
                    width: '100%', 
                    background: 'none', 
                    border: 'none', 
                    color: '#374151', 
                    fontWeight: 500, 
                    fontSize: '0.9rem', 
                    padding: '0.75rem 1.25rem', 
                    cursor: 'pointer', 
                    borderRadius: 0, 
                    transition: 'background 0.15s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  View Submission History
                </button>
                
                <button 
                  onClick={handleProfile} 
                  style={{ 
                    width: '100%', 
                    background: 'none', 
                    border: 'none', 
                    color: '#374151', 
                    fontWeight: 500, 
                    fontSize: '0.9rem', 
                    padding: '0.75rem 1.25rem', 
                    cursor: 'pointer', 
                    borderRadius: 0, 
                    transition: 'background 0.15s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  Update Profile
                </button>
                
                <div style={{ 
                  borderTop: '1px solid #f3f4f6', 
                  margin: '0.25rem 0'
                }}>
                  <button 
                    onClick={handleLogout} 
                    style={{ 
                      width: '100%', 
                      background: 'none', 
                      border: 'none', 
                      color: '#ef4444', 
                      fontWeight: 500, 
                      fontSize: '0.9rem', 
                      padding: '0.75rem 1.25rem', 
                      cursor: 'pointer', 
                      borderRadius: 0, 
                      transition: 'background 0.15s ease',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fef2f2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                    }}
                  >
                    Log out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onAuthSuccess={() => setShowAuthModal(false)} />
        <ProfileModal 
          user={user} 
          open={showProfileModal} 
          onClose={() => setShowProfileModal(false)} 
          form={form} 
          setForm={setForm} 
          onSave={handleSaveProfile} 
        />
      </div>
      <style>{`
        .profile-btn:focus { outline: 2px solid #16a34a; }
        .profile-dropdown button:hover { background: #f9fafb; }
      `}</style>
    </div>
  );
};

export default TopBar; 