import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from './auth/AuthContext';
import './CaseStudies.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import CaseContributionForm from './CaseContributionForm';
import { useNavigate } from 'react-router-dom';
import AuthModal from './auth/AuthModal';
import API_BASE_URL from '../config.js';

const caseStudies = [
  {
    id: 'generative-ai',
    category: 'Generative AI',
    title: 'AI-Powered Content Generation',
    description: 'A case study exploring how AI can assist in content creation while maintaining human oversight and quality control.',
    content: 'This case study examines the implementation of AI-powered content generation tools in a media company, focusing on maintaining editorial standards while improving productivity.',
    relevantPrinciples: ['User Autonomy', 'Transparency', 'Accountability']
  },
  {
    id: 'healthcare-ai',
    category: 'Healthcare AI',
    title: 'Diagnostic Assistant Implementation',
    description: 'Real-world implementation of AI diagnostic tools in healthcare settings, balancing accuracy with human expertise.',
    content: 'This study explores the deployment of AI diagnostic assistants in clinical settings, examining how AI can support medical professionals without replacing their judgment.',
    relevantPrinciples: ['Safety', 'Privacy', 'Accountability', 'Transparency']
  },
  {
    id: 'education-ai',
    category: 'Education AI',
    title: 'Personalized Learning Platforms',
    description: 'How AI is transforming education through personalized learning experiences while ensuring student privacy and data protection.',
    content: 'This case study examines the development and deployment of AI-powered personalized learning platforms in K-12 education, focusing on student engagement and privacy protection.',
    relevantPrinciples: ['Privacy', 'Inclusivity', 'Fairness', 'User Autonomy']
  },
  {
    id: 'finance-ai',
    category: 'Financial AI',
    title: 'AI in Credit Scoring',
    description: 'Exploring the use of AI in financial decision-making while addressing bias and ensuring fair treatment of all applicants.',
    content: 'This study investigates the implementation of AI-powered credit scoring systems, examining how to prevent bias while improving accuracy and efficiency.',
    relevantPrinciples: ['Fairness', 'Transparency', 'Accountability', 'Privacy']
  }
];

const fetchUserSubmissions = async (username) => {
  // TODO: Replace with real backend call
  // Simulate fetching user's submissions
  const res = await fetch(`/api/case-studies?user=${encodeURIComponent(username)}`);
  if (!res.ok) return [];
  return await res.json();
};

const updateSubmission = async (id, data) => {
  // TODO: Replace with real backend call
  const res = await fetch(`/api/case-studies/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.ok;
};

const fetchApprovedCases = async () => {
  // Fetch only approved cases from backend
  const res = await fetch(`${API_BASE_URL}/api/case-studies`);
  if (!res.ok) return [];
  return await res.json();
};

const CaseStudies = ({ onShowChat }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [approvedCases, setApprovedCases] = useState([]);
  const [userSubs, setUserSubs] = useState([]);
  const [showUserSubs, setShowUserSubs] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const [focusGroupModalOpen, setFocusGroupModalOpen] = useState(false);
  const [groupInput, setGroupInput] = useState('');
  const [groupInputError, setGroupInputError] = useState('');
  const [showContributionForm, setShowContributionForm] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingGroupName, setPendingGroupName] = useState('');
  const userSubsRef = useRef(null);

  // Minimal test button for debugging
  if (typeof window !== 'undefined') {
    window.testButtonClicked = () => { console.log('Test button clicked!'); };
  }

  // Debug: log if the dashboard element exists in the DOM after every render
  useEffect(() => {
    console.log('DOM .focus-group-dashboard:', document.querySelector('.focus-group-dashboard'));
  });

  useEffect(() => {
    // Fetch approved cases for main page
    fetchApprovedCases().then(setApprovedCases);
  }, []);

  useEffect(() => {
    if (user && showUserSubs) {
      setLoading(true);
      fetchUserSubmissions(user.username).then(subs => {
        setUserSubs(subs);
        setLoading(false);
      });
    }
  }, [user, showUserSubs]);

  // Only one set of edit handlers for both user and group flows
  const handleEdit = (cs) => {
    setEditingId(cs.id);
    setEditData(cs);
  };
  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditData(d => ({ ...d, [name]: value }));
  };
  const handleEditSave = async () => {
    if (showUserSubs) {
      setLoading(true);
      const success = await updateSubmission(editingId, editData);
      if (success) {
        setUserSubs(subs => subs.map(s => s.id === editingId ? { ...s, ...editData } : s));
        setEditingId(null);
      }
      setLoading(false);
    }
  };

  // Mock: check if user has submitted to group
  const hasUserSubmitted = () => {
    if (!user) return false;
    return userSubs.some(cs => cs.author === (user.username || user.email || 'Anonymous'));
  };

  // Handle group join: redirect to /focus-group/:groupName
  const handleJoinGroup = e => {
    e.preventDefault();
    if (!groupInput.trim()) {
      setGroupInputError('Group name or number required.');
      return;
    }
    setGroupInputError('');
    if (!user) {
      setPendingGroupName(groupInput.trim());
      setShowLoginModal(true);
      setFocusGroupModalOpen(false); // Close group modal when opening login modal
      return;
    }
    setFocusGroupModalOpen(false);
    navigate(`/focus-group/${encodeURIComponent(groupInput.trim())}`);
  };

  // Handle group case submit (mock, just add to local state)
  const handleGroupCaseSubmit = (caseData) => {
    const newCase = {
      ...caseData,
      id: Date.now().toString(),
      group: 'Your Group', // Placeholder, will be replaced by actual group name
      author: user.username || user.email || 'Anonymous',
    };
    setUserSubs(prev => [...prev, newCase]);
    // setGroupSubmitted(true); // This line was removed as per the edit hint
  };

  // After successful login, if pendingGroupName is set, navigate to group
  const handleAuthSuccess = () => {
    setShowLoginModal(false);
    if (pendingGroupName) {
      setFocusGroupModalOpen(false);
      navigate(`/focus-group/${encodeURIComponent(pendingGroupName)}`);
      setPendingGroupName('');
    }
  };

  return (
    <div className="case-studies-container">
      {/* Hero Section */}
      <div className="case-studies-hero">
        <h1 className="case-studies-title">Case Studies</h1>
        <p className="case-studies-subtitle">
          Real-world stories and insights from designing AI-driven products using human-centered AI best practices.
        </p>
        <div style={{ margin: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
          {!showContributionForm && (
            <button className="contribute-btn green-btn polished-btn" onClick={() => {
              if (user) {
                setShowContributionForm(true);
              } else {
                setShowLoginModal(true);
              }
            }}>
              <i className="fas fa-plus" style={{ marginRight: 10, fontSize: '1.15em' }}></i>
              Contribute a Case
            </button>
          )}
          {showContributionForm && user && (
            <div>
              <CaseContributionForm
                requireLogin={true}
                mode="individual"
                onSubmitSuccess={() => setShowContributionForm(false)}
                onViewMySubs={() => {
                  setShowContributionForm(false);
                  navigate('/my-submissions');
                }}
              />
              <button
                type="button"
                className="green-btn polished-btn"
                style={{ marginTop: 16, marginLeft: 8 }}
                onClick={() => setShowContributionForm(false)}
              >
                Cancel
              </button>
            </div>
          )}
          <AuthModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onAuthSuccess={handleAuthSuccess} />
          {!showContributionForm && !focusGroupModalOpen && (
            <button
              className="green-btn polished-btn focus-group-btn"
              onClick={() => setFocusGroupModalOpen(true)}
            >
              <i className="fas fa-users" style={{ marginRight: 10, fontSize: '1.1em' }}></i>
              Contribute with Your Team
            </button>
          )}
        </div>
      </div>
      {/* Case Studies Content */}
      {!showContributionForm && (
        <div className="case-studies-content">
          {caseStudies.map(cs => (
            <div key={cs.id} className="case-study-section">
              <div className="case-study-category">{cs.category}</div>
              <div className="case-study-card">
                <div className="case-study-header">
                  <h3 className="case-study-title">{cs.title}</h3>
                  <p className="case-study-description">{cs.description}</p>
                </div>
                <div className="case-study-body">
                  <div className="case-study-content">
                    <p>{cs.content}</p>
                  </div>
                  <div className="case-study-sidebar">
                    <h4 className="relevant-principles-title">RELEVANT PRINCIPLES + PATTERNS</h4>
                    <div className="principles-tags">
                      {cs.relevantPrinciples.map((principle, index) => (
                        <span key={index} className="principle-tag">
                          {principle}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {focusGroupModalOpen && (
        <div className="focus-group-modal-overlay">
          <div className="focus-group-modal">
            <button className="focus-group-modal-close" onClick={() => { console.log('Modal close clicked'); setFocusGroupModalOpen(false); }}>&times;</button>
            <h3>Join a Focus Group</h3>
            <form onSubmit={handleJoinGroup}>
              <label>
                Group Name or Number
                <input type="text" value={groupInput} onChange={e => setGroupInput(e.target.value)} placeholder="Enter group name or number" />
              </label>
              {groupInputError && <div className="focus-group-error">{groupInputError}</div>}
              <button type="submit" className="focus-group-btn">
                Join Group
              </button>
            </form>
          </div>
          <style>{`
            .focus-group-modal-overlay {
              position: fixed;
              top: 0; left: 0; right: 0; bottom: 0;
              background: rgba(0,0,0,0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
            }
            .focus-group-modal {
              background: #fff;
              border-radius: 16px;
              padding: 2rem;
              min-width: 380px;
              max-width: 90vw;
              box-shadow: 0 8px 32px rgba(34,197,94,0.15);
              position: relative;
              border: 1px solid #e5e7eb;
            }
            .focus-group-modal h3 {
              color: #16a34a;
              font-size: 1.5rem;
              font-weight: 700;
              margin: 0 0 1.5rem 0;
              text-align: center;
              letter-spacing: -0.025em;
            }
            .focus-group-modal form {
              display: flex;
              flex-direction: column;
            }
            .focus-group-modal label {
              display: block;
              color: #374151;
              font-size: 0.9rem;
              font-weight: 600;
              margin-bottom: 0.5rem;
            }
            .focus-group-modal input {
              width: 100%;
              padding: 0.75rem 1rem;
              border-radius: 8px;
              border: 1.5px solid #d1d5db;
              font-size: 1rem;
              margin-bottom: 1rem;
              transition: all 0.2s ease;
              box-sizing: border-box;
            }
            .focus-group-modal input:focus {
              outline: none;
              border-color: #16a34a;
              box-shadow: 0 0 0 3px rgba(22,163,74,0.1);
            }
            .focus-group-modal input::placeholder {
              color: #9ca3af;
            }
            .focus-group-error {
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
            .focus-group-error::before {
              content: "⚠";
              font-size: 1rem;
            }
            .focus-group-btn {
              width: 100%;
              padding: 0.875rem 1.5rem;
              font-size: 1rem;
              font-weight: 600;
              border-radius: 8px;
              background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
              color: #ffffff;
              border: none;
              margin-top: 0.5rem;
              cursor: pointer;
              transition: all 0.2s ease;
              box-shadow: 0 4px 14px rgba(34,197,94,0.3);
            }
            .focus-group-btn:hover {
              background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
              transform: translateY(-1px);
              box-shadow: 0 6px 20px rgba(34,197,94,0.4);
            }
            .focus-group-modal-close {
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
            .focus-group-modal-close:hover {
              color: #16a34a;
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default CaseStudies; 