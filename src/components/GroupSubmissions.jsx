import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import API_BASE_URL from '../config.js';



const GroupSubmissions = () => {
  const { groupName } = useParams();
  const { user } = useAuth();
  const [groupSubs, setGroupSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [isMember, setIsMember] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [editData, setEditData] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  // Accordion state for expanded submission
  const [expandedIdx, setExpandedIdx] = useState(null);
  // Facilitator comments state
  const [facilitatorComments, setFacilitatorComments] = useState([]);
  const [commentTexts, setCommentTexts] = useState({});
  const [savingComment, setSavingComment] = useState(false);
  // Case editing state
  const [editingCase, setEditingCase] = useState(null);
  const [editCaseData, setEditCaseData] = useState({});
  const [savingCase, setSavingCase] = useState(false);
  // AI Application Card editing state
  const [editingConceptCard, setEditingConceptCard] = useState(null);
  const [editConceptCardData, setEditConceptCardData] = useState({});
  const [savingConceptCard, setSavingConceptCard] = useState(false);
  // Values and tensions editing state
  const [editingValues, setEditingValues] = useState(null);
  const [editingTensions, setEditingTensions] = useState(null);
  const [addingValue, setAddingValue] = useState(null);
  const [addingTension, setAddingTension] = useState(null);
  const [newValueData, setNewValueData] = useState({ name: '', definition: '' });
  const [newTensionData, setNewTensionData] = useState({ name: '', definition: '' });
  const [editingValueData, setEditingValueData] = useState({});
  const [editingTensionData, setEditingTensionData] = useState({});
  // Facilitator comment for edits
  const [editComment, setEditComment] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');



  // Helper function to get the correct submission ID
  const getSubmissionId = (sub) => {
    return sub.originalSubmissionId || `${sub.username}|${sub.email}|${sub.submittedAt}`;
  };

  // Helper function to show error modal
  const showError = (message) => {
    setErrorMessage(message);
    setShowErrorModal(true);
  };



    const fetchSubs = async () => {
      setLoading(true);
      setError('');
      try {
        console.log('Fetching group submissions for group:', groupName);
        const res = await fetch(`${API_BASE_URL}/api/group-submissions?group=${encodeURIComponent(groupName)}`);
        if (!res.ok) throw new Error('Failed to fetch group submissions');
        const data = await res.json();
        console.log('API Response:', data);
        console.log('Group submissions data:', data.data);
        setGroupSubs(data.data || []);
        // Check if user is a member (has submitted to this group)
        if (user) {
          setIsMember((data.data || []).some(
            sub =>
              sub.username === user.username ||
              sub.email === user.email
          ));
        }
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError(err.message);
      }
      setLoading(false);
    };
  
  // Facilitator comments are now stored directly in the main data, so we don't need a separate fetch
  const fetchFacilitatorComments = async () => {
    // This function is now a no-op since comments are in the main data
  };

  useEffect(() => {
    fetchSubs();
    fetchFacilitatorComments();
  }, [groupName, user]);

  const handleExpand = (sub) => {
    setExpandedId(expandedId === sub.id ? null : sub.id);
    setEditData(sub);
    setEditError('');
    setEditSuccess('');
  };

  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditData(d => ({ ...d, [name]: value }));
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');
            const res = await fetch(`${API_BASE_URL}/api/case-studies/${editData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData)
    });
    if (res.ok) {
      setGroupSubs(subs => subs.map(s => s.id === editData.id ? { ...s, ...editData } : s));
      setEditSuccess('Saved!');
      setTimeout(() => {
        setExpandedId(null);
        setEditSuccess('');
      }, 900);
    } else {
      const data = await res.json().catch(() => ({}));
      setEditError(data.error || 'Failed to update submission');
    }
    setEditLoading(false);
  };

  const handleSaveFacilitatorComment = async (submissionId) => {
    if (!user || user.role !== 'facilitator') return;
    
    setSavingComment(true);
    try {
      const comment = commentTexts[submissionId] || '';
      
      // Find the current submission
      const currentSubmission = groupSubs.find(sub => getSubmissionId(sub) === submissionId);
      if (!currentSubmission) {
        console.error('Submission not found');
        return;
      }
      
      // Create a minimal edit that only updates the facilitator comment
      const editedData = {
        ...currentSubmission,
        facilitatorComment: comment,
        facilitatorCommentTimestamp: new Date().toISOString(),
        facilitatorCommentBy: `${user.username} (${user.email})`
      };
      
      const result = await saveEditedSubmissionToServer(submissionId, editedData, comment);
      if (result.success) {
        // Clear the comment text
        setCommentTexts(prev => ({
          ...prev,
          [submissionId]: ''
        }));
      } else {
        showError(`Failed to save comment: ${result.message}`);
      }
    } catch (err) {
      console.error('Failed to save facilitator comment:', err);
      showError('Failed to save comment. Please try again.');
    }
    setSavingComment(false);
  };

  const handleEditCase = (submissionId, caseIndex, caseData) => {
    setEditingCase(`${submissionId}-${caseIndex}`);
    setEditCaseData({ ...caseData });
  };

  const handleCancelEdit = () => {
    setEditingCase(null);
    setEditCaseData({});
    setEditComment('');
  };

  const handleSaveCase = async (submissionId, caseIndex) => {
    setSavingCase(true);
    try {
      // Find the submission and update the specific case
      const updatedGroupSubs = groupSubs.map(sub => {
        const subId = `${sub.username}|${sub.email}|${sub.submittedAt}`;
        if (subId === submissionId) {
          // Ensure cases is an array
          const cases = Array.isArray(sub.cases) ? sub.cases : [];
          const updatedCases = [...cases];
          if (updatedCases[caseIndex]) {
            updatedCases[caseIndex] = { ...updatedCases[caseIndex], ...editCaseData };
          }
          return { ...sub, cases: updatedCases };
        }
        return sub;
      });
      
      // Save to server
      const submission = groupSubs.find(sub => `${sub.username}|${sub.email}|${sub.submittedAt}` === submissionId);
      if (submission) {
        const updatedSubmission = updatedGroupSubs.find(sub => `${sub.username}|${sub.email}|${sub.submittedAt}` === submissionId);
        const editedData = {
          ...submission,
          cases: updatedSubmission ? updatedSubmission.cases : []
        };
        
        const result = await saveEditedSubmissionToServer(submissionId, editedData, editComment);
        if (result.success) {
          setGroupSubs(updatedGroupSubs);
          setEditingCase(null);
          setEditCaseData({});
          setEditComment('');
        } else {
          showError(`Failed to save: ${result.message}`);
        }
      }
    } catch (err) {
      console.error('Failed to save case:', err);
      showError('Failed to save case. Please try again.');
    }
    setSavingCase(false);
  };

  const canEditCase = (submissionUsername, submissionEmail) => {
    if (!user) return false;
    return user.role === 'facilitator' || 
           (user.username === submissionUsername && user.email === submissionEmail);
  };

  const handleEditConceptCard = (submissionId, conceptCardData) => {
    setEditingConceptCard(submissionId);
    setEditConceptCardData({ ...conceptCardData });
  };

  const handleCancelConceptCardEdit = () => {
    setEditingConceptCard(null);
    setEditConceptCardData({});
    setEditComment('');
  };

  const handleSaveConceptCard = async (submissionId) => {
    setSavingConceptCard(true);
    try {
      // Find the submission and update the concept card
      const updatedGroupSubs = groupSubs.map(sub => {
        const subId = `${sub.username}|${sub.email}|${sub.submittedAt}`;
        if (subId === submissionId) {
          return { ...sub, conceptCard: { ...sub.conceptCard, ...editConceptCardData } };
        }
        return sub;
      });
      
      // Save to server
      const submission = groupSubs.find(sub => `${sub.username}|${sub.email}|${sub.submittedAt}` === submissionId);
      if (submission) {
        const editedData = {
          ...submission,
          conceptCard: { ...submission.conceptCard, ...editConceptCardData }
        };
        
        const result = await saveEditedSubmissionToServer(submissionId, editedData, editComment);
        if (result.success) {
          setGroupSubs(updatedGroupSubs);
          setEditingConceptCard(null);
          setEditConceptCardData({});
          setEditComment('');
        } else {
          showError(`Failed to save: ${result.message}`);
        }
      }
    } catch (err) {
      console.error('Failed to save concept card:', err);
      showError('Failed to save concept card. Please try again.');
    }
    setSavingConceptCard(false);
  };

  // Values and tensions functions
  const handleAddValue = (submissionId, caseIndex) => {
    setAddingValue(`${submissionId}-${caseIndex}`);
    setNewValueData({ name: '', definition: '' });
  };

  const handleEditValues = (submissionId, caseIndex, values) => {
    setEditingValues(`${submissionId}-${caseIndex}`);
    setEditingValueData(values.reduce((acc, v, idx) => {
      acc[idx] = { value: v.value, definition: v.definition || '' };
      return acc;
    }, {}));
  };

  const handleAddTension = (submissionId, caseIndex) => {
    setAddingTension(`${submissionId}-${caseIndex}`);
    setNewTensionData({ name: '', definition: '' });
  };

  const handleEditTensions = (submissionId, caseIndex, tensions) => {
    setEditingTensions(`${submissionId}-${caseIndex}`);
    setEditingTensionData(tensions.reduce((acc, t, idx) => {
      acc[idx] = { value: t.value, definition: t.definition || '' };
      return acc;
    }, {}));
  };

  const handleSaveValue = async (submissionId, caseIndex) => {
    try {
      const updatedGroupSubs = groupSubs.map(sub => {
        const subId = `${sub.username}|${sub.email}|${sub.submittedAt}`;
        if (subId === submissionId) {
          // Ensure cases is an array
          const cases = Array.isArray(sub.cases) ? sub.cases : [];
          const updatedCases = [...cases];
          if (updatedCases[caseIndex]) {
            // Ensure values is an array
            const values = Array.isArray(updatedCases[caseIndex].values) ? updatedCases[caseIndex].values : [];
            const newValue = { value: newValueData.name, definition: newValueData.definition };
            updatedCases[caseIndex] = {
              ...updatedCases[caseIndex],
              values: [...values, newValue]
            };
          }
          return { ...sub, cases: updatedCases };
        }
        return sub;
      });
      
      // Save to server
      const submission = groupSubs.find(sub => `${sub.username}|${sub.email}|${sub.submittedAt}` === submissionId);
      if (submission) {
        const updatedSubmission = updatedGroupSubs.find(sub => `${sub.username}|${sub.email}|${sub.submittedAt}` === submissionId);
        const editedData = {
          ...submission,
          cases: updatedSubmission ? updatedSubmission.cases : []
        };
        
        const result = await saveEditedSubmissionToServer(submissionId, editedData, editComment);
        if (result.success) {
          setGroupSubs(updatedGroupSubs);
          setAddingValue(null);
          setNewValueData({ name: '', definition: '' });
          setEditComment('');
        } else {
          showError(`Failed to save: ${result.message}`);
        }
      }
    } catch (err) {
      console.error('Failed to save value:', err);
      showError('Failed to save value. Please try again.');
    }
  };

  const handleSaveTension = async (submissionId, caseIndex) => {
    try {
      const updatedGroupSubs = groupSubs.map(sub => {
        const subId = `${sub.username}|${sub.email}|${sub.submittedAt}`;
        if (subId === submissionId) {
          // Ensure cases is an array
          const cases = Array.isArray(sub.cases) ? sub.cases : [];
          const updatedCases = [...cases];
          if (updatedCases[caseIndex]) {
            // Ensure tensions is an array
            const tensions = Array.isArray(updatedCases[caseIndex].tensions) ? updatedCases[caseIndex].tensions : [];
            const newTension = { value: newTensionData.name, definition: newTensionData.definition };
            updatedCases[caseIndex] = {
              ...updatedCases[caseIndex],
              tensions: [...tensions, newTension]
            };
          }
          return { ...sub, cases: updatedCases };
        }
        return sub;
      });
      
      // Save to server
      const submission = groupSubs.find(sub => `${sub.username}|${sub.email}|${sub.submittedAt}` === submissionId);
      if (submission) {
        const updatedSubmission = updatedGroupSubs.find(sub => `${sub.username}|${sub.email}|${sub.submittedAt}` === submissionId);
        const editedData = {
          ...submission,
          cases: updatedSubmission ? updatedSubmission.cases : []
        };
        
        const result = await saveEditedSubmissionToServer(submissionId, editedData, editComment);
        if (result.success) {
          setGroupSubs(updatedGroupSubs);
          setAddingTension(null);
          setNewTensionData({ name: '', definition: '' });
          setEditComment('');
        } else {
          showError(`Failed to save: ${result.message}`);
        }
      }
    } catch (err) {
      console.error('Failed to save tension:', err);
      showError('Failed to save tension. Please try again.');
    }
  };

  const handleSaveEditedValues = async (submissionId, caseIndex) => {
    try {
      const updatedGroupSubs = groupSubs.map(sub => {
        const subId = `${sub.username}|${sub.email}|${sub.submittedAt}`;
        if (subId === submissionId) {
          // Ensure cases is an array
          const cases = Array.isArray(sub.cases) ? sub.cases : [];
          const updatedCases = [...cases];
          if (updatedCases[caseIndex]) {
            const updatedValues = Object.values(editingValueData).map(v => ({
              value: v.value,
              definition: v.definition
            }));
            updatedCases[caseIndex] = {
              ...updatedCases[caseIndex],
              values: updatedValues
            };
          }
          return { ...sub, cases: updatedCases };
        }
        return sub;
      });
      
      // Save to server
      const submission = groupSubs.find(sub => `${sub.username}|${sub.email}|${sub.submittedAt}` === submissionId);
      if (submission) {
        const updatedSubmission = updatedGroupSubs.find(sub => `${sub.username}|${sub.email}|${sub.submittedAt}` === submissionId);
        const editedData = {
          ...submission,
          cases: updatedSubmission ? updatedSubmission.cases : []
        };
        
        const result = await saveEditedSubmissionToServer(submissionId, editedData, editComment);
        if (result.success) {
          setGroupSubs(updatedGroupSubs);
          setEditingValues(null);
          setEditingValueData({});
          setEditComment('');
        } else {
          showError(`Failed to save: ${result.message}`);
        }
      }
    } catch (err) {
      console.error('Failed to save edited values:', err);
      showError('Failed to save edited values. Please try again.');
    }
  };

  const handleSaveEditedTensions = async (submissionId, caseIndex) => {
    try {
      const updatedGroupSubs = groupSubs.map(sub => {
        const subId = `${sub.username}|${sub.email}|${sub.submittedAt}`;
        if (subId === submissionId) {
          // Ensure cases is an array
          const cases = Array.isArray(sub.cases) ? sub.cases : [];
          const updatedCases = [...cases];
          if (updatedCases[caseIndex]) {
            const updatedTensions = Object.values(editingTensionData).map(t => ({
              value: t.value,
              definition: t.definition
            }));
            updatedCases[caseIndex] = {
              ...updatedCases[caseIndex],
              tensions: updatedTensions
            };
          }
          return { ...sub, cases: updatedCases };
        }
        return sub;
      });
      
      // Save to server
      const submission = groupSubs.find(sub => `${sub.username}|${sub.email}|${sub.submittedAt}` === submissionId);
      if (submission) {
        const updatedSubmission = updatedGroupSubs.find(sub => `${sub.username}|${sub.email}|${sub.submittedAt}` === submissionId);
        const editedData = {
          ...submission,
          cases: updatedSubmission ? updatedSubmission.cases : []
        };
        
        const result = await saveEditedSubmissionToServer(submissionId, editedData, editComment);
        if (result.success) {
          setGroupSubs(updatedGroupSubs);
          setEditingTensions(null);
          setEditingTensionData({});
          setEditComment('');
        } else {
          showError(`Failed to save: ${result.message}`);
        }
      }
    } catch (err) {
      console.error('Failed to save edited tensions:', err);
      showError('Failed to save edited tensions. Please try again.');
    }
  };

  const handleCancelValueEdit = () => {
    setAddingValue(null);
    setEditingValues(null);
    setNewValueData({ name: '', definition: '' });
    setEditingValueData({});
    setEditComment('');
  };

  const handleCancelTensionEdit = () => {
    setAddingTension(null);
    setEditingTensions(null);
    setNewTensionData({ name: '', definition: '' });
    setEditingTensionData({});
    setEditComment('');
  };

  // Function to save edited submission to server
  const saveEditedSubmissionToServer = async (submissionId, editedData, facilitatorComment = '') => {
    try {
              const response = await fetch(`${API_BASE_URL}/api/save-edited-submission`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalSubmissionId: submissionId,
          editedData: editedData,
          facilitatorComment: facilitatorComment,
          editedBy: user ? `${user.username} (${user.email})` : 'unknown'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Clear any edit states to prevent rendering issues
        setEditingCase(null);
        setEditingConceptCard(null);
        setEditingValues(null);
        setEditingTensions(null);
        setAddingValue(null);
        setAddingTension(null);
        setExpandedIdx(null);
        
        // Refresh the data to show the new edited submission
        await fetchSubs();
        
        // Show success message
        setSaveSuccess(result.message);
        setTimeout(() => setSaveSuccess(''), 3000); // Clear after 3 seconds
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message || 'Failed to save edited submission' };
      }
    } catch (error) {
      console.error('Error saving edited submission:', error);
      return { success: false, message: 'Network error while saving' };
    }
  };

  if (loading) return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  if (error) return <div style={{ color: '#ef4444', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{error}</div>;
  if (!isMember) {
    return (
      <div style={{ 
        padding: '2rem', 
        maxWidth: '1200px', 
        margin: '0 auto', 
        width: '100%',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '60vh'
      }}>
        <div style={{ 
          border: '2.5px solid #f59e42', 
          borderRadius: 22, 
          background: '#fef3c7', 
          padding: '2.8rem 2.5rem', 
          maxWidth: 600, 
          width: '100%', 
          boxShadow: '0 8px 32px rgba(245,158,66,0.10)', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#f59e42', marginBottom: 16, fontSize: '2rem', fontWeight: 700 }}>Access Denied</h2>
          <div style={{ color: '#888', fontSize: '1.1rem', marginBottom: 24 }}>You must have submitted a case to this group to view group submissions.</div>
          <button className="green-btn polished-btn" onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  // The backend now returns submissions with cases intact, so we can use them directly
  const groupedSubs = groupSubs;
  console.log('groupedSubs:', groupedSubs);
  console.log('groupedSubs length:', groupedSubs.length);
  
  // Debug each submission's cases
  groupedSubs.forEach((sub, index) => {
    console.log(`Submission ${index}:`, {
      username: sub.username,
      casesLength: sub.cases ? sub.cases.length : 'undefined',
      cases: sub.cases
    });
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div className="user-submissions-section" style={{ border: '2.5px solid #16a34a', borderRadius: 22, background: '#e6faed', padding: '2.8rem 2.5rem', marginTop: 0, maxWidth: 1100, width: '100%', boxShadow: '0 8px 32px rgba(34,197,94,0.10)', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: 24, left: 24, background: 'none', border: 'none', color: '#16a34a', fontWeight: 700, fontSize: '1.13rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}>
          <i className="fas fa-arrow-left" style={{ fontSize: 18 }}></i> Back
        </button>
        <h2 style={{ color: '#16a34a', textAlign: 'center', marginBottom: 32, fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-1px' }}>Group Submissions: {groupName}</h2>
        
        {/* Success Message */}
        {saveSuccess && (
          <div style={{
            background: '#d1fae5',
            border: '2px solid #10b981',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 20,
            color: '#065f46',
            fontSize: '1rem',
            fontWeight: 600,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}>
            <i className="fas fa-check-circle" style={{ fontSize: '1.1rem' }}></i>
            {saveSuccess}
          </div>
        )}
        {groupedSubs.length === 0 ? (
          <div style={{ fontSize: '1.15rem', color: '#666' }}>No submissions found for this group.</div>
        ) : (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {groupedSubs.map((sub, idx) => {
              const isExpanded = expandedIdx === idx;
              return (
                <div key={`${sub.originalSubmissionId || `${sub.username}|${sub.email}|${sub.submittedAt}`}-${idx}`} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(34,197,94,0.07)', marginBottom: 0, overflow: 'hidden', border: isExpanded ? '2.5px solid #16a34a' : '1.5px solid #bbf7d0', transition: 'border 0.18s' }}>
                  <div
                    style={{ cursor: 'pointer', background: isExpanded ? '#e6faed' : '#bbf7d0', padding: '1.2rem 2.2rem', fontWeight: 700, color: '#16a34a', fontSize: '1.18rem', borderBottom: isExpanded ? '2px solid #bbf7d0' : 'none', userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '1.18rem', fontWeight: 700 }}>{sub.conceptCard?.title || '[No Title]'}</span>
                        {sub.isEditedVersion && (
                          <span style={{ 
                            background: '#fbbf24', 
                            color: '#92400e', 
                            fontSize: '0.7rem', 
                            fontWeight: 700, 
                            padding: '2px 6px', 
                            borderRadius: 4,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Edited
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.95rem', fontWeight: 500, color: '#388e5c' }}>
                        <span>{(sub.cases || []).length} case{(sub.cases || []).length !== 1 ? 's' : ''}</span>
                        <span>by {sub.username}</span>
                        {sub.editedBy && (
                          <span style={{ color: '#f59e0b', fontSize: '0.85rem' }}>
                            (edited by {sub.editedBy})
                          </span>
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize: 18, marginLeft: 12 }}>{isExpanded ? '\u25B2' : '\u25BC'}</span>
                  </div>
                  {isExpanded && (
                    <div style={{ padding: '2rem 2.2rem' }}>
                      <div style={{ marginBottom: 18, borderBottom: '2px solid #bbf7d0', paddingBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div style={{ fontWeight: 700, color: '#16a34a', fontSize: '1.25rem' }}>AI Application Card</div>
                          {canEditCase(sub.username, sub.email) && (
                            <button
                              onClick={() => handleEditConceptCard(sub.originalSubmissionId || `${sub.username}|${sub.email}|${sub.submittedAt}`, sub.conceptCard)}
                              style={{
                                background: '#16a34a',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                padding: '6px 16px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                            >
                              <i className="fas fa-edit" style={{ fontSize: '0.75rem' }}></i>
                              Edit Card
                            </button>
                          )}
                        </div>
                        {editingConceptCard === (sub.originalSubmissionId || `${sub.username}|${sub.email}|${sub.submittedAt}`) ? (
                          /* Edit Mode for AI Application Card */
                          <div>
                            <div style={{ marginBottom: 12 }}>
                              <label style={{ fontWeight: 600, color: '#16a34a', fontSize: '0.9rem', marginBottom: 4, display: 'block' }}>Title:</label>
                              <input
                                type="text"
                                value={editConceptCardData.title || ''}
                                onChange={(e) => setEditConceptCardData(prev => ({ ...prev, title: e.target.value }))}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: 6,
                                  border: '1px solid #d1d5db',
                                  fontSize: '0.9rem',
                                  marginBottom: 8
                                }}
                              />
                            </div>
                            
                            <div style={{ marginBottom: 12 }}>
                              <label style={{ fontWeight: 600, color: '#16a34a', fontSize: '0.9rem', marginBottom: 4, display: 'block' }}>Description:</label>
                              <textarea
                                value={editConceptCardData.description || ''}
                                onChange={(e) => setEditConceptCardData(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: 6,
                                  border: '1px solid #d1d5db',
                                  fontSize: '0.9rem',
                                  resize: 'vertical',
                                  marginBottom: 8
                                }}
                              />
                            </div>
                            
                            <div style={{ fontWeight: 700, color: '#388e5c', fontSize: '1.13rem', margin: '18px 0 6px 0' }}>What the system does</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                              <div>
                                <label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem', marginBottom: 4, display: 'block' }}>Do/Act:</label>
                                <textarea
                                  value={editConceptCardData.doAct || ''}
                                  onChange={(e) => setEditConceptCardData(prev => ({ ...prev, doAct: e.target.value }))}
                                  rows={2}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: 6,
                                    border: '1px solid #d1d5db',
                                    fontSize: '0.9rem',
                                    resize: 'vertical'
                                  }}
                                />
                              </div>
                              <div>
                                <label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem', marginBottom: 4, display: 'block' }}>Infer/Reason:</label>
                                <textarea
                                  value={editConceptCardData.inferReason || ''}
                                  onChange={(e) => setEditConceptCardData(prev => ({ ...prev, inferReason: e.target.value }))}
                                  rows={2}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: 6,
                                    border: '1px solid #d1d5db',
                                    fontSize: '0.9rem',
                                    resize: 'vertical'
                                  }}
                                />
                              </div>
                            </div>
                            
                            <div style={{ fontWeight: 700, color: '#388e5c', fontSize: '1.13rem', margin: '18px 0 6px 0' }}>What data will be used</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                              <div>
                                <label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem', marginBottom: 4, display: 'block' }}>Data 1:</label>
                                <textarea
                                  value={editConceptCardData.data1 || ''}
                                  onChange={(e) => setEditConceptCardData(prev => ({ ...prev, data1: e.target.value }))}
                                  rows={2}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: 6,
                                    border: '1px solid #d1d5db',
                                    fontSize: '0.9rem',
                                    resize: 'vertical'
                                  }}
                                />
                              </div>
                              <div>
                                <label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem', marginBottom: 4, display: 'block' }}>Data 2:</label>
                                <textarea
                                  value={editConceptCardData.data2 || ''}
                                  onChange={(e) => setEditConceptCardData(prev => ({ ...prev, data2: e.target.value }))}
                                  rows={2}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: 6,
                                    border: '1px solid #d1d5db',
                                    fontSize: '0.9rem',
                                    resize: 'vertical'
                                  }}
                                />
                              </div>
                              <div>
                                <label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem', marginBottom: 4, display: 'block' }}>Data 3:</label>
                                <textarea
                                  value={editConceptCardData.data3 || ''}
                                  onChange={(e) => setEditConceptCardData(prev => ({ ...prev, data3: e.target.value }))}
                                  rows={2}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: 6,
                                    border: '1px solid #d1d5db',
                                    fontSize: '0.9rem',
                                    resize: 'vertical'
                                  }}
                                />
                              </div>
                              <div>
                                <label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem', marginBottom: 4, display: 'block' }}>Data 4:</label>
                                <textarea
                                  value={editConceptCardData.data4 || ''}
                                  onChange={(e) => setEditConceptCardData(prev => ({ ...prev, data4: e.target.value }))}
                                  rows={2}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: 6,
                                    border: '1px solid #d1d5db',
                                    fontSize: '0.9rem',
                                    resize: 'vertical'
                                  }}
                                />
                              </div>
                            </div>
                            
                            <div style={{ fontWeight: 700, color: '#388e5c', fontSize: '1.13rem', margin: '18px 0 6px 0' }}>Stakeholders</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                              <div>
                                <label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem', marginBottom: 4, display: 'block' }}>Funder/Customer:</label>
                                <textarea
                                  value={editConceptCardData.payer || ''}
                                  onChange={(e) => setEditConceptCardData(prev => ({ ...prev, payer: e.target.value }))}
                                  rows={2}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: 6,
                                    border: '1px solid #d1d5db',
                                    fontSize: '0.9rem',
                                    resize: 'vertical'
                                  }}
                                />
                              </div>
                              <div>
                                <label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem', marginBottom: 4, display: 'block' }}>Servicing Party:</label>
                                <textarea
                                  value={editConceptCardData.servicingParty || ''}
                                  onChange={(e) => setEditConceptCardData(prev => ({ ...prev, servicingParty: e.target.value }))}
                                  rows={2}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: 6,
                                    border: '1px solid #d1d5db',
                                    fontSize: '0.9rem',
                                    resize: 'vertical'
                                  }}
                                />
                              </div>
                              <div>
                                <label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem', marginBottom: 4, display: 'block' }}>End User:</label>
                                <textarea
                                  value={editConceptCardData.endUser || ''}
                                  onChange={(e) => setEditConceptCardData(prev => ({ ...prev, endUser: e.target.value }))}
                                  rows={2}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: 6,
                                    border: '1px solid #d1d5db',
                                    fontSize: '0.9rem',
                                    resize: 'vertical'
                                  }}
                                />
                              </div>
                              <div>
                                <label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem', marginBottom: 4, display: 'block' }}>Impacted Individuals:</label>
                                <textarea
                                  value={editConceptCardData.impactedIndividuals || ''}
                                  onChange={(e) => setEditConceptCardData(prev => ({ ...prev, impactedIndividuals: e.target.value }))}
                                  rows={2}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: 6,
                                    border: '1px solid #d1d5db',
                                    fontSize: '0.9rem',
                                    resize: 'vertical'
                                  }}
                                />
                              </div>
                            </div>
                            

                            
                            {/* Edit buttons */}
                            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                                                          <button
                              onClick={() => handleSaveConceptCard(getSubmissionId(sub))}
                                disabled={savingConceptCard}
                                style={{
                                  background: '#16a34a',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: 6,
                                  padding: '8px 20px',
                                  fontSize: '0.9rem',
                                  fontWeight: 600,
                                  cursor: savingConceptCard ? 'not-allowed' : 'pointer',
                                  opacity: savingConceptCard ? 0.6 : 1
                                }}
                              >
                                {savingConceptCard ? 'Saving...' : 'Save Card'}
                              </button>
                              <button
                                onClick={handleCancelConceptCardEdit}
                                style={{
                                  background: '#fff',
                                  color: '#6b7280',
                                  border: '1px solid #d1d5db',
                                  borderRadius: 6,
                                  padding: '8px 20px',
                                  fontSize: '0.9rem',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* View Mode for AI Application Card */
                          <div>
                        <div style={{ color: '#444', fontWeight: 600, fontSize: '1.08rem', marginBottom: 6 }}>{sub.conceptCard?.title}</div>
                        <div style={{ color: '#666', fontSize: '1.01rem', marginBottom: 8 }}>{sub.conceptCard?.description}</div>
                        {/* What the system does */}
                        <div style={{ fontWeight: 700, color: '#388e5c', fontSize: '1.13rem', margin: '18px 0 6px 0' }}>What the system does</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginBottom: 6 }}>
                          <div><b>Do/Act:</b> {sub.conceptCard?.doAct}</div>
                          <div><b>Infer/Reason:</b> {sub.conceptCard?.inferReason}</div>
                        </div>
                        {/* What data will be used */}
                        <div style={{ fontWeight: 700, color: '#388e5c', fontSize: '1.13rem', margin: '18px 0 6px 0' }}>What data will be used</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginBottom: 6 }}>
                          <div><b>Data 1:</b> {sub.conceptCard?.data1}</div>
                          <div><b>Data 2:</b> {sub.conceptCard?.data2}</div>
                          <div><b>Data 3:</b> {sub.conceptCard?.data3}</div>
                          <div><b>Data 4:</b> {sub.conceptCard?.data4}</div>
                        </div>
                        {/* Stakeholders */}
                        <div style={{ fontWeight: 700, color: '#388e5c', fontSize: '1.13rem', margin: '18px 0 6px 0' }}>Stakeholders</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginBottom: 6 }}>
                          <div><b>Funder/Customer:</b> {sub.conceptCard?.payer}</div>
                          <div><b>Servicing Party:</b> {sub.conceptCard?.servicingParty}</div>
                          <div><b>End User:</b> {sub.conceptCard?.endUser}</div>
                          <div><b>Impacted Individuals:</b> {sub.conceptCard?.impactedIndividuals}</div>
                        </div>
                          </div>
                        )}
                        <div style={{ color: '#888', fontSize: '0.98rem', marginTop: 6 }}>
                          <b>Submitted by:</b> {sub.username} ({sub.email}) &nbsp; | &nbsp; <b>At:</b> {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : ''}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: '#388e5c', fontSize: '1.13rem', marginBottom: 10 }}>The Collection of Cases</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        {(sub.cases || []).map((c, i) => (
                          <div key={i} style={{ background: '#f8fafc', borderRadius: 12, border: '1.5px solid #bbf7d0', padding: '1.2rem 1.2rem', marginBottom: 0 }}>
                            {/* Summary - Main heading with edit button */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderBottom: '1px solid #e5e7eb', paddingBottom: 6 }}>
                              <div style={{ fontWeight: 700, color: '#16a34a', fontSize: '1.1rem' }}>
                                {c.summary}
                            </div>
                              {canEditCase(sub.username, sub.email) && (
                                                            <button
                              onClick={() => handleEditCase(getSubmissionId(sub), i, c)}
                                  style={{
                                    background: '#16a34a',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 6,
                                    padding: '4px 12px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4
                                  }}
                                >
                                  <i className="fas fa-edit" style={{ fontSize: '0.75rem' }}></i>
                                  Edit
                                </button>
                              )}
                            </div>
                            
                            {/* Case details */}
                                                          {editingCase === `${getSubmissionId(sub)}-${i}` ? (
                              /* Edit Mode */
                              <div style={{ marginBottom: 12 }}>
                                <div style={{ marginBottom: 12 }}>
                                  <label style={{ fontWeight: 600, color: '#16a34a', fontSize: '0.9rem', marginBottom: 4, display: 'block' }}>Summary:</label>
                                  <input
                                    type="text"
                                    value={editCaseData.summary || ''}
                                    onChange={(e) => setEditCaseData(prev => ({ ...prev, summary: e.target.value }))}
                                    style={{
                                      width: '100%',
                                      padding: '8px 12px',
                                      borderRadius: 6,
                                      border: '1px solid #d1d5db',
                                      fontSize: '0.9rem',
                                      marginBottom: 8
                                    }}
                                  />
                                </div>
                                
                                <div style={{ marginBottom: 12 }}>
                                  <label style={{ fontWeight: 600, color: '#16a34a', fontSize: '0.9rem', marginBottom: 4, display: 'block' }}>Case:</label>
                                  <textarea
                                    value={editCaseData.caseText || ''}
                                    onChange={(e) => setEditCaseData(prev => ({ ...prev, caseText: e.target.value }))}
                                    rows={4}
                                    style={{
                                      width: '100%',
                                      padding: '8px 12px',
                                      borderRadius: 6,
                                      border: '1px solid #d1d5db',
                                      fontSize: '0.9rem',
                                      resize: 'vertical',
                                      marginBottom: 8
                                    }}
                                  />
                                </div>
                                
                                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                                  <div style={{ flex: 1 }}>
                                    <label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem', marginBottom: 4, display: 'block' }}>Subject:</label>
                                    <input
                                      type="text"
                                      value={editCaseData.subject || ''}
                                      onChange={(e) => setEditCaseData(prev => ({ ...prev, subject: e.target.value }))}
                                      style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        borderRadius: 6,
                                        border: '1px solid #d1d5db',
                                        fontSize: '0.9rem'
                                      }}
                                    />
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem', marginBottom: 4, display: 'block' }}>Grade:</label>
                                    <input
                                      type="text"
                                      value={editCaseData.grade || ''}
                                      onChange={(e) => setEditCaseData(prev => ({ ...prev, grade: e.target.value }))}
                                      style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        borderRadius: 6,
                                        border: '1px solid #d1d5db',
                                        fontSize: '0.9rem'
                                      }}
                                    />
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <label style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem', marginBottom: 4, display: 'block' }}>Date:</label>
                                    <input
                                      type="text"
                                      value={editCaseData.date || ''}
                                      onChange={(e) => setEditCaseData(prev => ({ ...prev, date: e.target.value }))}
                                      style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        borderRadius: 6,
                                        border: '1px solid #d1d5db',
                                        fontSize: '0.9rem'
                                      }}
                                    />
                                  </div>
                                </div>
                                
                                
                                 
                                 {/* Edit buttons */}
                                 <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                                   <button
                                     onClick={() => handleSaveCase(getSubmissionId(sub), i)}
                                     disabled={savingCase}
                                     style={{
                                       background: '#16a34a',
                                       color: '#fff',
                                       border: 'none',
                                       borderRadius: 6,
                                       padding: '6px 16px',
                                       fontSize: '0.85rem',
                                       fontWeight: 600,
                                       cursor: savingCase ? 'not-allowed' : 'pointer',
                                       opacity: savingCase ? 0.6 : 1
                                     }}
                                   >
                                     {savingCase ? 'Saving...' : 'Save'}
                                   </button>
                                   <button
                                     onClick={handleCancelEdit}
                                     style={{
                                       background: '#fff',
                                       color: '#6b7280',
                                       border: '1px solid #d1d5db',
                                       borderRadius: 6,
                                       padding: '6px 16px',
                                       fontSize: '0.85rem',
                                       fontWeight: 600,
                                       cursor: 'pointer'
                                     }}
                                   >
                                     Cancel
                                   </button>
                                 </div>
                              </div>
                            ) : (
                              /* View Mode */
                              <div style={{ marginBottom: 12 }}>
                                <div style={{ color: '#374151', fontSize: '1rem', marginBottom: 6, lineHeight: 1.5 }}>
                                  <span style={{ fontWeight: 600, color: '#16a34a' }}>Case:</span> {c.caseText}
                                </div>
                                <div style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: 8 }}>
                                  <span style={{ fontWeight: 600, color: '#374151' }}>Subject:</span> {c.subject || '-'} &nbsp; 
                                  <span style={{ fontWeight: 600, color: '#374151' }}>Grade:</span> {c.grade || '-'} &nbsp; 
                                  <span style={{ fontWeight: 600, color: '#374151' }}>Date:</span> {c.date || '-'}
                                </div>
                              </div>
                            )}
                            
                            {/* Values and Tensions */}
                            <div style={{ display: 'flex', gap: 24, marginBottom: 12, flexWrap: 'wrap' }}>
                              {/* Values Section */}
                              <div style={{ flex: 1, minWidth: 200 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                  <div style={{ fontWeight: 600, color: '#16a34a', fontSize: '0.95rem' }}>Values:</div>
                                  {canEditCase(sub.username, sub.email) && (
                                    <div style={{ display: 'flex', gap: 4 }}>
                                      <button
                                        onClick={() => handleAddValue(getSubmissionId(sub), i)}
                                        style={{
                                          background: '#16a34a',
                                          color: '#fff',
                                          border: 'none',
                                          borderRadius: 4,
                                          padding: '2px 8px',
                                          fontSize: '0.7rem',
                                          fontWeight: 600,
                                          cursor: 'pointer'
                                        }}
                                      >
                                        Add
                                      </button>
                                      {c.values && c.values.length > 0 && (
                                        <button
                                          onClick={() => handleEditValues(getSubmissionId(sub), i, c.values)}
                                          style={{
                                            background: '#fff',
                                            color: '#16a34a',
                                            border: '1px solid #16a34a',
                                            borderRadius: 4,
                                            padding: '2px 8px',
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                          }}
                                        >
                                          Edit
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                                
                                {addingValue === `${getSubmissionId(sub)}-${i}` ? (
                                  /* Add Value Mode */
                                  <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '12px 16px', border: '1px solid #bbf7d0', marginBottom: 8 }}>
                                    <div style={{ marginBottom: 8 }}>
                                      <label style={{ fontWeight: 600, color: '#16a34a', fontSize: '0.8rem', marginBottom: 2, display: 'block' }}>Value Name:</label>
                                      <input
                                        type="text"
                                        value={newValueData.name}
                                        onChange={(e) => setNewValueData(prev => ({ ...prev, name: e.target.value }))}
                                        style={{
                                          width: '100%',
                                          padding: '4px 8px',
                                          borderRadius: 4,
                                          border: '1px solid #d1d5db',
                                          fontSize: '0.8rem'
                                        }}
                                      />
                                    </div>
                                    <div style={{ marginBottom: 8 }}>
                                      <label style={{ fontWeight: 600, color: '#16a34a', fontSize: '0.8rem', marginBottom: 2, display: 'block' }}>Definition:</label>
                                      <textarea
                                        value={newValueData.definition}
                                        onChange={(e) => setNewValueData(prev => ({ ...prev, definition: e.target.value }))}
                                        rows={2}
                                        style={{
                                          width: '100%',
                                          padding: '4px 8px',
                                          borderRadius: 4,
                                          border: '1px solid #d1d5db',
                                          fontSize: '0.8rem',
                                          resize: 'vertical'
                                        }}
                                      />
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: 4 }}>
                                      <button
                                        onClick={() => handleSaveValue(getSubmissionId(sub), i)}
                                        style={{
                                          background: '#16a34a',
                                          color: '#fff',
                                          border: 'none',
                                          borderRadius: 4,
                                          padding: '4px 8px',
                                          fontSize: '0.7rem',
                                          fontWeight: 600,
                                          cursor: 'pointer'
                                        }}
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={handleCancelValueEdit}
                                        style={{
                                          background: '#fff',
                                          color: '#6b7280',
                                          border: '1px solid #d1d5db',
                                          borderRadius: 4,
                                          padding: '4px 8px',
                                          fontSize: '0.7rem',
                                          fontWeight: 600,
                                          cursor: 'pointer'
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : editingValues === `${getSubmissionId(sub)}-${i}` ? (
                                  /* Edit Values Mode */
                                  <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '12px 16px', border: '1px solid #bbf7d0', marginBottom: 8 }}>
                                    {Object.entries(editingValueData).map(([idx, valueData]) => (
                                      <div key={idx} style={{ marginBottom: 12, padding: '8px', background: '#fff', borderRadius: 4, border: '1px solid #bbf7d0' }}>
                                        <div style={{ marginBottom: 4 }}>
                                          <label style={{ fontWeight: 600, color: '#16a34a', fontSize: '0.8rem', marginBottom: 2, display: 'block' }}>Value Name:</label>
                                          <input
                                            type="text"
                                            value={valueData.value}
                                            onChange={(e) => setEditingValueData(prev => ({
                                              ...prev,
                                              [idx]: { ...prev[idx], value: e.target.value }
                                            }))}
                                            style={{
                                              width: '100%',
                                              padding: '4px 8px',
                                              borderRadius: 4,
                                              border: '1px solid #d1d5db',
                                              fontSize: '0.8rem'
                                            }}
                                          />
                                        </div>
                                        <div style={{ marginBottom: 4 }}>
                                          <label style={{ fontWeight: 600, color: '#16a34a', fontSize: '0.8rem', marginBottom: 2, display: 'block' }}>Definition:</label>
                                          <textarea
                                            value={valueData.definition}
                                            onChange={(e) => setEditingValueData(prev => ({
                                              ...prev,
                                              [idx]: { ...prev[idx], definition: e.target.value }
                                            }))}
                                            rows={2}
                                            style={{
                                              width: '100%',
                                              padding: '4px 8px',
                                              borderRadius: 4,
                                              border: '1px solid #d1d5db',
                                              fontSize: '0.8rem',
                                              resize: 'vertical'
                                            }}
                                          />
                                        </div>
                          </div>
                        ))}
                                    
                                    <div style={{ display: 'flex', gap: 4 }}>
                                      <button
                                        onClick={() => handleSaveEditedValues(getSubmissionId(sub), i)}
                                        style={{
                                          background: '#16a34a',
                                          color: '#fff',
                                          border: 'none',
                                          borderRadius: 4,
                                          padding: '4px 8px',
                                          fontSize: '0.7rem',
                                          fontWeight: 600,
                                          cursor: 'pointer'
                                        }}
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={handleCancelValueEdit}
                                        style={{
                                          background: '#fff',
                                          color: '#6b7280',
                                          border: '1px solid #d1d5db',
                                          borderRadius: 4,
                                          padding: '4px 8px',
                                          fontSize: '0.7rem',
                                          fontWeight: 600,
                                          cursor: 'pointer'
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  /* View Values Mode */
                                  <div style={{ color: '#374151', fontSize: '0.9rem' }}>
                                    {c.values && c.values.length > 0 ? c.values.map(v => v.value).join(', ') : '-'}
                                  </div>
                                )}
                              </div>
                              
                              {/* Tensions Section */}
                              <div style={{ flex: 1, minWidth: 200 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                  <div style={{ fontWeight: 600, color: '#f59e0b', fontSize: '0.95rem' }}>Tensions:</div>
                                  {canEditCase(sub.username, sub.email) && (
                                    <div style={{ display: 'flex', gap: 4 }}>
                                      <button
                                        onClick={() => handleAddTension(getSubmissionId(sub), i)}
                                        style={{
                                          background: '#f59e0b',
                                          color: '#fff',
                                          border: 'none',
                                          borderRadius: 4,
                                          padding: '2px 8px',
                                          fontSize: '0.7rem',
                                          fontWeight: 600,
                                          cursor: 'pointer'
                                        }}
                                      >
                                        Add
                                      </button>
                                      {c.tensions && c.tensions.length > 0 && (
                                        <button
                                          onClick={() => handleEditTensions(getSubmissionId(sub), i, c.tensions)}
                                          style={{
                                            background: '#fff',
                                            color: '#f59e0b',
                                            border: '1px solid #f59e0b',
                                            borderRadius: 4,
                                            padding: '2px 8px',
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                          }}
                                        >
                                          Edit
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                                
                                {addingTension === `${getSubmissionId(sub)}-${i}` ? (
                                  /* Add Tension Mode */
                                  <div style={{ background: '#fffbeb', borderRadius: 8, padding: '12px 16px', border: '1px solid #fef3c7', marginBottom: 8 }}>
                                    <div style={{ marginBottom: 8 }}>
                                      <label style={{ fontWeight: 600, color: '#f59e0b', fontSize: '0.8rem', marginBottom: 2, display: 'block' }}>Tension Name:</label>
                                      <input
                                        type="text"
                                        value={newTensionData.name}
                                        onChange={(e) => setNewTensionData(prev => ({ ...prev, name: e.target.value }))}
                                        style={{
                                          width: '100%',
                                          padding: '4px 8px',
                                          borderRadius: 4,
                                          border: '1px solid #d1d5db',
                                          fontSize: '0.8rem'
                                        }}
                                      />
                                    </div>
                                    <div style={{ marginBottom: 8 }}>
                                      <label style={{ fontWeight: 600, color: '#f59e0b', fontSize: '0.8rem', marginBottom: 2, display: 'block' }}>Definition:</label>
                                      <textarea
                                        value={newTensionData.definition}
                                        onChange={(e) => setNewTensionData(prev => ({ ...prev, definition: e.target.value }))}
                                        rows={2}
                                        style={{
                                          width: '100%',
                                          padding: '4px 8px',
                                          borderRadius: 4,
                                          border: '1px solid #d1d5db',
                                          fontSize: '0.8rem',
                                          resize: 'vertical'
                                        }}
                                      />
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: 4 }}>
                                      <button
                                        onClick={() => handleSaveTension(getSubmissionId(sub), i)}
                                        style={{
                                          background: '#f59e0b',
                                          color: '#fff',
                                          border: 'none',
                                          borderRadius: 4,
                                          padding: '4px 8px',
                                          fontSize: '0.7rem',
                                          fontWeight: 600,
                                          cursor: 'pointer'
                                        }}
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={handleCancelTensionEdit}
                                        style={{
                                          background: '#fff',
                                          color: '#6b7280',
                                          border: '1px solid #d1d5db',
                                          borderRadius: 4,
                                          padding: '4px 8px',
                                          fontSize: '0.7rem',
                                          fontWeight: 600,
                                          cursor: 'pointer'
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : editingTensions === `${getSubmissionId(sub)}-${i}` ? (
                                  /* Edit Tensions Mode */
                                  <div style={{ background: '#fffbeb', borderRadius: 8, padding: '12px 16px', border: '1px solid #fef3c7', marginBottom: 8 }}>
                                    {Object.entries(editingTensionData).map(([idx, tensionData]) => (
                                      <div key={idx} style={{ marginBottom: 12, padding: '8px', background: '#fff', borderRadius: 4, border: '1px solid #fef3c7' }}>
                                        <div style={{ marginBottom: 4 }}>
                                          <label style={{ fontWeight: 600, color: '#f59e0b', fontSize: '0.8rem', marginBottom: 2, display: 'block' }}>Tension Name:</label>
                                          <input
                                            type="text"
                                            value={tensionData.value}
                                            onChange={(e) => setEditingTensionData(prev => ({
                                              ...prev,
                                              [idx]: { ...prev[idx], value: e.target.value }
                                            }))}
                                            style={{
                                              width: '100%',
                                              padding: '4px 8px',
                                              borderRadius: 4,
                                              border: '1px solid #d1d5db',
                                              fontSize: '0.8rem'
                                            }}
                                          />
                                        </div>
                                        <div style={{ marginBottom: 4 }}>
                                          <label style={{ fontWeight: 600, color: '#f59e0b', fontSize: '0.8rem', marginBottom: 2, display: 'block' }}>Definition:</label>
                                          <textarea
                                            value={tensionData.definition}
                                            onChange={(e) => setEditingTensionData(prev => ({
                                              ...prev,
                                              [idx]: { ...prev[idx], definition: e.target.value }
                                            }))}
                                            rows={2}
                                            style={{
                                              width: '100%',
                                              padding: '4px 8px',
                                              borderRadius: 4,
                                              border: '1px solid #d1d5db',
                                              fontSize: '0.8rem',
                                              resize: 'vertical'
                                            }}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                    
                                    <div style={{ display: 'flex', gap: 4 }}>
                                      <button
                                        onClick={() => handleSaveEditedTensions(getSubmissionId(sub), i)}
                                        style={{
                                          background: '#f59e0b',
                                          color: '#fff',
                                          border: 'none',
                                          borderRadius: 4,
                                          padding: '4px 8px',
                                          fontSize: '0.7rem',
                                          fontWeight: 600,
                                          cursor: 'pointer'
                                        }}
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={handleCancelTensionEdit}
                                        style={{
                                          background: '#fff',
                                          color: '#6b7280',
                                          border: '1px solid #d1d5db',
                                          borderRadius: 4,
                                          padding: '4px 8px',
                                          fontSize: '0.7rem',
                                          fontWeight: 600,
                                          cursor: 'pointer'
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  /* View Tensions Mode */
                                  <div style={{ color: '#374151', fontSize: '0.9rem' }}>
                                    {c.tensions && c.tensions.length > 0 ? c.tensions.map(t => t.value).join(', ') : '-'}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Value Definitions */}
                            {c.values && c.values.some(v => v.definition) && (
                              <div style={{ marginBottom: 12, background: '#f0fdf4', borderRadius: 8, padding: '12px 16px', border: '1px solid #bbf7d0' }}>
                                <div style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.95rem', marginBottom: 8 }}>Value Definitions</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  {c.values.map((v, idx) => v.definition && (
                                    <div key={idx} style={{ fontSize: '0.9rem', lineHeight: 1.4 }}>
                                      <span style={{ fontWeight: 600, color: '#16a34a' }}>{v.value}:</span>
                                      <span style={{ color: '#374151', marginLeft: 4 }}>{v.definition}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Tension Definitions */}
                            {c.tensions && c.tensions.some(t => t.definition) && (
                              <div style={{ marginBottom: 12, background: '#fffbeb', borderRadius: 8, padding: '12px 16px', border: '1px solid #fef3c7' }}>
                                <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.95rem', marginBottom: 8 }}>Tension Definitions</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  {c.tensions.map((t, idx) => t.definition && (
                                    <div key={idx} style={{ fontSize: '0.9rem', lineHeight: 1.4 }}>
                                      <span style={{ fontWeight: 600, color: '#f59e0b' }}>{t.value}:</span>
                                      <span style={{ color: '#374151', marginLeft: 4 }}>{t.definition}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Status */}
                            <div style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: 500, borderTop: '1px solid #e5e7eb', paddingTop: 8, marginTop: 8 }}>
                              Status: <span style={{ color: '#16a34a', fontWeight: 600 }}>{c.status}</span>
                            </div>
                            
                            {/* Facilitator Comments Section - Only visible to facilitators */}
                            {user && user.role === 'facilitator' && (
                              <div style={{ marginTop: 16, borderTop: '2px solid #e5e7eb', paddingTop: 12 }}>
                                <div style={{ fontWeight: 700, color: '#7c3aed', fontSize: '0.95rem', marginBottom: 8 }}>
                                  Facilitator Comments
                                </div>
                                
                                {/* Display existing comment */}
                                {sub.facilitatorComment && (
                                  <div style={{ 
                                    background: '#f3f4f6', 
                                    borderRadius: 8, 
                                    padding: '12px 16px', 
                                    marginBottom: 12,
                                    border: '1px solid #d1d5db'
                                  }}>
                                    <div style={{ color: '#374151', fontSize: '0.9rem', lineHeight: 1.4 }}>
                                      {sub.facilitatorComment}
                                    </div>
                                    <div style={{ 
                                      color: '#6b7280', 
                                      fontSize: '0.8rem', 
                                      marginTop: 6,
                                      fontStyle: 'italic'
                                    }}>
                                      By {sub.facilitatorCommentBy} • {new Date(sub.facilitatorCommentTimestamp).toLocaleString()}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Comment input */}
                                <div style={{ marginBottom: 8 }}>
                                  <textarea
                                    placeholder="Add your facilitator comment..."
                                    value={commentTexts[getSubmissionId(sub)] || ''}
                                    onChange={(e) => setCommentTexts(prev => ({
                                      ...prev,
                                                                              [getSubmissionId(sub)]: e.target.value
                                    }))}
                                    rows={5}
                                    style={{
                                      width: '100%',
                                      padding: '12px 16px',
                                      borderRadius: 6,
                                      border: '1px solid #d1d5db',
                                      fontSize: '0.9rem',
                                      resize: 'vertical',
                                      fontFamily: 'inherit',
                                      minHeight: '120px'
                                    }}
                                  />
                                </div>
                                
                                {/* Save button */}
                                <button
                                  onClick={() => handleSaveFacilitatorComment(getSubmissionId(sub))}
                                  disabled={savingComment}
                                  style={{
                                    background: '#7c3aed',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 6,
                                    padding: '6px 12px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    cursor: savingComment ? 'not-allowed' : 'pointer',
                                    opacity: savingComment ? 0.6 : 1
                                  }}
                                >
                                  {savingComment ? 'Saving...' : 'Save Comment'}
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>



      {/* Custom Error Modal */}
      {showErrorModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: '1.5rem',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <div style={{
                background: '#dc2626',
                color: 'white',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.75rem',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}>
                !
              </div>
              <h3 style={{ 
                color: '#dc2626', 
                fontWeight: 700, 
                fontSize: '1.1rem', 
                margin: 0 
              }}>
                Error
              </h3>
            </div>
            
            <div style={{
              color: '#374151',
              fontSize: '0.95rem',
              lineHeight: 1.5,
              marginBottom: '1rem',
              whiteSpace: 'pre-line'
            }}>
              {errorMessage}
            </div>
      
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setShowErrorModal(false)}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.6rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#b91c1c'}
                onMouseLeave={(e) => e.target.style.background = '#dc2626'}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupSubmissions; 