import React, { useEffect, useState } from 'react';
import { useAuth } from './auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import './CaseStudies.css';

const fetchUserSubmissions = async (username) => {
  const res = await fetch(`/api/case-studies?user=${encodeURIComponent(username)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
};

const updateSubmission = async (id, data) => {
  const res = await fetch(`/api/case-studies/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.ok;
};

const MySubmissions = () => {
  const { user } = useAuth();
  const [userSubs, setUserSubs] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchUserSubmissions(user.username || user.email).then(subs => {
        setUserSubs(subs);
        setLoading(false);
      });
    }
  }, [user]);

  const handleExpand = (sub) => {
    setExpandedId(expandedId === sub.id ? null : sub.id);
    setEditData(sub);
    setError('');
    setSuccess('');
  };

  const handleEditChange = (e, section = 'conceptCard', caseIndex = null) => {
    const { name, value } = e.target;
    setEditData(d => {
      const newData = { ...d };
      if (section === 'conceptCard') {
        newData.conceptCard = { ...newData.conceptCard, [name]: value };
      } else if (section === 'case' && caseIndex !== null) {
        newData.cases = [...newData.cases];
        newData.cases[caseIndex] = { ...newData.cases[caseIndex], [name]: value };
      }
      return newData;
    });
  };

  const handleEditSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate concept card
    if (!editData.conceptCard?.title || editData.conceptCard.title.trim() === '') {
      setError('Title is required for the AI Application Card.');
      setLoading(false);
      return;
    }
    if (!editData.conceptCard?.description || editData.conceptCard.description.trim() === '') {
      setError('Description is required for the AI Application Card.');
      setLoading(false);
      return;
    }

    // Validate cases
    let hasError = false;
    editData.cases?.forEach((card, idx) => {
      if (!card.summary || card.summary.trim() === '') {
        setError(`Case ${idx + 1}: Case Theme is required.`);
        hasError = true;
      }
      if (!card.caseText || card.caseText.trim() === '') {
        setError(`Case ${idx + 1}: Case Narrative is required.`);
        hasError = true;
      }
    });

    if (hasError) {
      setLoading(false);
      return;
    }

    const res = await fetch(`/api/case-studies/${editData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData)
    });
    if (res.ok) {
      setUserSubs(subs => subs.map(s => s.id === editData.id ? { ...s, ...editData } : s));
      setSuccess('Saved!');
      setTimeout(() => {
        setExpandedId(null);
        setSuccess('');
      }, 900);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Failed to update submission');
    }
    setLoading(false);
  };

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%'
    }}>
      <div className="user-submissions-section" style={{
        border: '2.5px solid #16a34a',
        borderRadius: 22,
        background: '#e6faed',
        padding: '2.8rem 2.5rem',
        marginTop: 0,
        maxWidth: 1100,
        width: '100%',
        boxShadow: '0 8px 32px rgba(34,197,94,0.10)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative'
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            position: 'absolute',
            top: 24,
            left: 24,
            background: 'none',
            border: 'none',
            color: '#16a34a',
            fontWeight: 700,
            fontSize: '1.13rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: 0
          }}
        >
          <i className="fas fa-arrow-left" style={{ fontSize: 18 }}></i> Back to Main Page
        </button>
        <h2 style={{ color: '#16a34a', textAlign: 'center', marginBottom: 32, fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-1px' }}>My Submissions</h2>
        {loading && <div style={{ fontSize: '1.2rem', color: '#444' }}>Loading...</div>}
        {!loading && userSubs.length === 0 && <div style={{ fontSize: '1.15rem', color: '#666' }}>No submissions found.</div>}
        {!loading && userSubs.length > 0 && (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 32, background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(34,197,94,0.07)' }}>
              <thead>
                <tr style={{ background: '#bbf7d0' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '1.08rem' }}>AI Application</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '1.08rem' }}>Cases</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '1.08rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '1.08rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {userSubs.map(sub => (
                  <React.Fragment key={sub.id}>
                    <tr
                      style={{
                        background: expandedId === sub.id ? '#bbf7d0' : '#fff',
                        cursor: 'pointer',
                        transition: 'background 0.18s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#e6faed'}
                      onMouseLeave={e => e.currentTarget.style.background = expandedId === sub.id ? '#bbf7d0' : '#fff'}
                    >
                      <td style={{ padding: '0.7rem', fontWeight: 600 }}>{sub.conceptCard?.title || sub.title}</td>
                      <td style={{ padding: '0.7rem' }}>{sub.cases?.length || 0} case{sub.cases?.length !== 1 ? 's' : ''}</td>
                      <td style={{ padding: '0.7rem', color: sub.status === 'approved' ? '#16a34a' : '#f59e42', fontWeight: 600 }}>{sub.status ? sub.status.charAt(0).toUpperCase() + sub.status.slice(1) : 'Pending'}</td>
                      <td style={{ padding: '0.7rem' }}>
                        <button
                          className="green-btn polished-btn"
                          style={{ fontSize: '0.98em', padding: '0.4rem 1.1rem', borderRadius: 8, background: expandedId === sub.id ? '#16a34a' : '#fff', color: expandedId === sub.id ? '#fff' : '#16a34a', border: '1.5px solid #16a34a', fontWeight: 700, transition: 'all 0.18s' }}
                          onClick={() => handleExpand(sub)}
                        >
                          {expandedId === sub.id ? 'Collapse' : 'Expand'}
                        </button>
                      </td>
                    </tr>
                    {expandedId === sub.id && (
                      <tr>
                        <td colSpan={4} style={{ background: '#f3f4f6', padding: '1.5rem 2rem', transition: 'all 0.3s' }}>
                          <form onSubmit={e => { e.preventDefault(); if (sub.status === 'pending') handleEditSave(); }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 800, transition: 'all 0.3s' }}>
                              
                              {/* AI Application Card Section */}
                              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 12, border: '1px solid #e5e7eb' }}>
                                <h3 style={{ color: '#16a34a', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 700 }}>AI Application Card</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                  <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                      Title *
                                      <input 
                                        name="title" 
                                        value={editData.conceptCard?.title || ''} 
                                        onChange={(e) => handleEditChange(e, 'conceptCard')} 
                                        disabled={sub.status !== 'pending'} 
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 4 }} 
                                      />
                                    </label>
                                  </div>
                                  <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                      Description *
                                      <textarea 
                                        name="description" 
                                        value={editData.conceptCard?.description || ''} 
                                        onChange={(e) => handleEditChange(e, 'conceptCard')} 
                                        disabled={sub.status !== 'pending'} 
                                        rows={3}
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 4 }} 
                                      />
                                    </label>
                                  </div>
                                  <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                      Do Act
                                      <input 
                                        name="doAct" 
                                        value={editData.conceptCard?.doAct || ''} 
                                        onChange={(e) => handleEditChange(e, 'conceptCard')} 
                                        disabled={sub.status !== 'pending'} 
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 4 }} 
                                      />
                                    </label>
                                  </div>
                                  <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                      Infer Reason
                                      <input 
                                        name="inferReason" 
                                        value={editData.conceptCard?.inferReason || ''} 
                                        onChange={(e) => handleEditChange(e, 'conceptCard')} 
                                        disabled={sub.status !== 'pending'} 
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 4 }} 
                                      />
                                    </label>
                                  </div>
                                </div>
                              </div>

                              {/* Cases Section */}
                              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 12, border: '1px solid #e5e7eb' }}>
                                <h3 style={{ color: '#16a34a', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 700 }}>Cases</h3>
                                {editData.cases?.map((caseItem, caseIndex) => (
                                  <div key={caseIndex} style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: 8 }}>
                                    <h4 style={{ color: '#374151', marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Case {caseIndex + 1}</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                      <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                          Case Theme *
                                          <input 
                                            name="summary" 
                                            value={caseItem.summary || ''} 
                                            onChange={(e) => handleEditChange(e, 'case', caseIndex)} 
                                            disabled={sub.status !== 'pending'} 
                                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 4 }} 
                                          />
                                        </label>
                                      </div>
                                      <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                          Subject
                                          <input 
                                            name="subject" 
                                            value={caseItem.subject || ''} 
                                            onChange={(e) => handleEditChange(e, 'case', caseIndex)} 
                                            disabled={sub.status !== 'pending'} 
                                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 4 }} 
                                          />
                                        </label>
                                      </div>
                                      <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                          Grade Level
                                          <input 
                                            name="gradeLevel" 
                                            value={caseItem.gradeLevel || ''} 
                                            onChange={(e) => handleEditChange(e, 'case', caseIndex)} 
                                            disabled={sub.status !== 'pending'} 
                                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 4 }} 
                                          />
                                        </label>
                                      </div>
                                      <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                          Date
                                          <input 
                                            name="date" 
                                            value={caseItem.date || ''} 
                                            onChange={(e) => handleEditChange(e, 'case', caseIndex)} 
                                            disabled={sub.status !== 'pending'} 
                                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 4 }} 
                                          />
                                        </label>
                                      </div>
                                      <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                          Case Narrative *
                                          <textarea 
                                            name="caseText" 
                                            value={caseItem.caseText || ''} 
                                            onChange={(e) => handleEditChange(e, 'case', caseIndex)} 
                                            disabled={sub.status !== 'pending'} 
                                            rows={4}
                                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 4 }} 
                                          />
                                        </label>
                                      </div>
                                    </div>
                                    
                                    {/* Values and Tensions Display */}
                                    <div style={{ marginTop: '1rem' }}>
                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                          <h5 style={{ color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Values ({caseItem.values?.length || 0})</h5>
                                          {caseItem.values?.map((value, idx) => (
                                            <div key={idx} style={{ background: '#f9fafb', padding: '0.5rem', borderRadius: 4, marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                              <strong>{value.value}</strong>: {value.definition}
                                            </div>
                                          ))}
                                        </div>
                                        <div>
                                          <h5 style={{ color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Tensions ({caseItem.tensions?.length || 0})</h5>
                                          {caseItem.tensions?.map((tension, idx) => (
                                            <div key={idx} style={{ background: '#f9fafb', padding: '0.5rem', borderRadius: 4, marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                              <strong>{tension.value}</strong>: {tension.definition}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {error && <div style={{ color: '#ef4444', marginTop: 4 }}>{error}</div>}
                              {success && (
                                <div style={{ color: '#16a34a', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <i className="fas fa-check-circle" style={{ fontSize: 18 }}></i> {success}
                                </div>
                              )}
                              {sub.status === 'pending' && (
                                <button type="submit" className="green-btn polished-btn" style={{ marginTop: 10, width: 160 }}>Save</button>
                              )}
                            </div>
                          </form>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <style>{`
          .user-submissions-section table tr:hover:not(.expanded) { background: #e6faed; }
          .user-submissions-section table {
            border-radius: 16px;
            overflow: hidden;
          }
          .user-submissions-section th, .user-submissions-section td {
            border-bottom: 1.5px solid #bbf7d0;
          }
        `}</style>
      </div>
    </div>
  );
};

export default MySubmissions; 