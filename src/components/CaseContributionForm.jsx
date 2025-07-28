import React, { useState, useEffect } from 'react';
import { useAuth } from './auth/AuthContext';
import ValueCard from './ValueCard';
import { predefinedValues, predefinedTensions } from '../data/valuesAndTensions';
import API_BASE_URL from '../config.js';

// Add Tooltip component for instant, smooth tooltips
const Tooltip = ({ text, children }) => (
  <span style={{ position: 'relative', display: 'inline-block' }}>
    <span
      style={{ cursor: 'pointer', color: '#388e5c', fontSize: '1.1rem', borderRadius: '50%', border: '1.5px solid #388e5c', width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#e6faed', marginLeft: 4 }}
      tabIndex={0}
      className="custom-tooltip-trigger"
    >{children}</span>
    <span
      style={{
        visibility: 'hidden',
        opacity: 0,
        width: 260,
        background: '#222',
        color: '#fff',
        textAlign: 'left',
        borderRadius: 8,
        padding: '0.7em 1em',
        position: 'absolute',
        zIndex: 10,
        bottom: '120%',
        left: '50%',
        transform: 'translateX(-50%)',
        transition: 'opacity 0.18s',
        fontSize: '1rem',
        fontFamily: 'inherit',
        fontWeight: 400,
        fontStyle: 'normal',
        pointerEvents: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.13)'
      }}
      className="custom-tooltip"
    >
      {text}
    </span>
    <style>
      {`
        .custom-tooltip-trigger:hover + .custom-tooltip,
        .custom-tooltip-trigger:focus + .custom-tooltip {
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
        }
        .custom-tooltip {
          font-size: 1rem !important;
          font-family: inherit !important;
          font-weight: 400 !important;
          font-style: normal !important;
        }
      `}
    </style>
  </span>
);

const SCENARIOS = [
  { 
    key: 'classroom', 
    label: 'Classroom Management', 
    template: {
      title: "AI for Classroom Management: Using AI to assist with classroom management, such as monitoring student engagement, automating attendance, or flagging disruptions.",
      description: "This AI-powered tool helps teachers manage classrooms more efficiently, including real-time engagement tracking, automated attendance, and early warning for disruptions. The goal is to support teachers while ensuring student privacy and fairness.",
      payer: "School District or Educational Institution funding the AI system for classroom management and teacher support.",
      endUser: "Teachers and classroom staff who interact with the AI system daily to monitor and manage students.",
      servicingParty: "EdTech company or IT department responsible for deploying, maintaining, and updating the AI system.",
      impactedIndividuals: "Students whose engagement, attendance, and behavior are monitored by the AI system, and their parents/guardians.",
      doAct: "Automatically record attendance, flag disengaged students, and alert teachers to possible disruptions in real time.",
      inferReason: "Analyze engagement data to infer which students may need additional support or intervention.",
      data1: "Student engagement metrics (e.g., eye contact, participation, device usage).",
      data2: "Attendance records and historical classroom behavior data.",
      data3: "Teacher notes and feedback on student participation and classroom climate.",
      data4: "Demographic information and learning profiles for each student."
    }
  },
  { 
    key: 'assessment', 
    label: 'Assessment', 
    template: {
      title: "AI for Student Assessment: Leveraging AI for student assessment, including automated grading, personalized feedback, or detecting academic dishonesty.",
      description: "This AI system evaluates student work, provides detailed feedback, and identifies potential academic integrity issues. The system aims to reduce teacher workload while maintaining assessment quality and fairness across diverse student populations.",
      payer: "Educational institutions and school districts seeking to streamline assessment processes and reduce grading workload for educators.",
      endUser: "Teachers and educational administrators who use the AI system to grade assignments, review feedback, and monitor academic integrity.",
      servicingParty: "Assessment technology company or educational software provider responsible for AI model training, system maintenance, and continuous improvement.",
      impactedIndividuals: "Students whose work is evaluated by AI systems, including those from diverse backgrounds who may be disproportionately affected by algorithmic bias.",
      doAct: "Automatically grade assignments, generate personalized feedback, and flag potential instances of academic dishonesty for human review.",
      inferReason: "Analyze writing patterns, answer similarity, and performance trends to infer learning gaps and potential cheating behaviors.",
      data1: "Student submissions including essays, problem sets, and exam responses with metadata.",
      data2: "Historical grading data and teacher feedback patterns across different subjects and student demographics.",
      data3: "Plagiarism detection databases and academic integrity violation records.",
      data4: "Student learning profiles, previous performance data, and demographic information for bias analysis."
    }
  },
  { 
    key: 'learning', 
    label: 'Learning', 
    template: {
      title: "AI for Personalized Learning: AI-powered personalized learning, adaptive content delivery, or intelligent tutoring systems to support student learning.",
      description: "This tool adapts educational content and pacing to individual student needs, providing personalized learning pathways and intelligent tutoring support. The goal is to optimize learning outcomes while ensuring equitable access and preventing algorithmic bias.",
      payer: "Educational institutions, school districts, and online learning platforms investing in personalized education technology.",
      endUser: "Students who interact with the AI system for learning, and teachers who monitor and guide the personalized learning process.",
      servicingParty: "Educational technology company or AI learning platform provider responsible for content creation, algorithm development, and system optimization.",
      impactedIndividuals: "Students from diverse backgrounds whose learning paths are determined by AI algorithms, including those with learning disabilities or different learning styles.",
      doAct: "Dynamically adjust content difficulty, provide real-time feedback, and recommend personalized learning activities based on individual progress.",
      inferReason: "Analyze learning patterns, knowledge gaps, and engagement levels to infer optimal content sequencing and intervention strategies.",
      data1: "Student interaction data including time spent on topics, correct/incorrect responses, and learning pathway choices.",
      data2: "Educational content metadata, difficulty ratings, and prerequisite relationships between concepts.",
      data3: "Student learning profiles, cognitive assessments, and historical performance across different subjects.",
      data4: "Demographic information, learning preferences, and accessibility requirements for equitable algorithm design."
    }
  },
  { key: 'custom', label: 'Create Your Own', template: null },
];

const initialConceptCard = {
  title: '', description: '', doAct: '', inferReason: '', data1: '', data2: '', data3: '', data4: '',
  payer: '', servicingParty: '', endUser: '', impactedIndividuals: ''
};

const initialCaseCard = {
  summary: '', subject: '', grade: '', date: '', caseText: '', values: [], tensions: [], impactedPopulations: ''
};

function TensionCard({ value, definition, onDelete, onSave, onClick }) {
  const [showDef, setShowDef] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customValue, setCustomValue] = useState(value || '');
  const [customDef, setCustomDef] = useState(definition || '');

  if (isEditing) {
    return (
      <div className="value-card user-edit-card" tabIndex={0} style={{ minWidth: 140, minHeight: 90, background: '#fff', border: '1.5px solid #bbf7d0', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
        <input
          type="text"
          placeholder="Tension name"
          value={customValue}
          onChange={e => setCustomValue(e.target.value)}
          style={{ fontWeight: 700, fontSize: '0.9rem', border: '1px solid #e5e7eb', borderRadius: 4, padding: '0.3em 0.5em', marginBottom: 2 }}
        />
        <textarea
          placeholder="Definition"
          value={customDef}
          onChange={e => setCustomDef(e.target.value)}
          style={{ border: '1px solid #e5e7eb', borderRadius: 4, padding: '0.3em 0.5em', fontSize: '0.8rem', minHeight: 30 }}
          rows={2}
        />
        <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
          <button className="green-btn" style={{ flex: 1, borderRadius: 4, fontWeight: 600, fontSize: '0.7rem', padding: '0.2em 0.4em' }} onClick={e => { e.stopPropagation(); if (onSave) onSave({ value: customValue, definition: customDef }); setIsEditing(false); }}>Save</button>
          <button className="green-btn" style={{ flex: 1, borderRadius: 4, background: '#fff', color: '#16a34a', border: '1.5px solid #bbf7d0', fontSize: '0.7rem', padding: '0.2em 0.4em' }} onClick={e => { e.stopPropagation(); setCustomValue(value); setCustomDef(definition); setIsEditing(false); }}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="value-card compact-card"
      style={{
        minWidth: 120,
        minHeight: 60,
        background: '#fff',
        border: '1.5px solid #e5e7eb',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(34,197,94,0.07)',
        padding: '0.7em 0.9em 0.5em 0.9em',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={() => setShowDef(true)}
      onMouseLeave={() => setShowDef(false)}
      onClick={onClick}
      tabIndex={0}
    >
      {/* Trash and Edit icons at top right */}
      <div style={{ position: 'absolute', top: 5, right: 5, display: 'flex', gap: 3, zIndex: 2 }}>
        {onDelete && (
          <button
            className="icon-btn delete-btn"
            style={{ width: 16, height: 16, background: 'none', border: 'none', color: '#bbb', fontSize: 12, cursor: 'pointer', borderRadius: '50%' }}
            title="Delete"
            onClick={e => { e.stopPropagation(); onDelete(); }}
          >
            <i className="fas fa-trash"></i>
          </button>
        )}
        <button
          className="icon-btn edit-btn"
          style={{ width: 16, height: 16, background: 'none', border: 'none', color: '#bbb', fontSize: 12, cursor: 'pointer', borderRadius: '50%' }}
          title="Edit"
          onClick={e => { e.stopPropagation(); setCustomValue(value); setCustomDef(definition); setIsEditing(true); }}
        >
          <i className="fas fa-pen"></i>
        </button>
      </div>
      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#16a34a', marginBottom: 2, width: '100%', textAlign: 'left', wordBreak: 'break-word' }}>{value}</div>
      {showDef && definition && (
        <div style={{ fontSize: '0.8rem', color: '#222', marginTop: 2, wordBreak: 'break-word', background: '#f8fafc', borderRadius: 4, padding: '0.3em 0.5em', width: '100%', textAlign: 'left' }}>{definition}</div>
      )}
    </div>
  );
}

const CaseContributionForm = () => {
  // All useState hooks at the top!
  const { user } = useAuth();
  const [selectedScenario, setSelectedScenario] = useState('classroom');
  const [customData, setCustomData] = useState({
    title: '',
    description: '',
    doAct: '',
    inferReason: '',
    data1: '',
    data2: '',
    data3: '',
    data4: '',
    payer: '',
    servicingParty: '',
    endUser: '',
    impactedIndividuals: ''
  });
  const [templateData, setTemplateData] = useState(initialConceptCard);
  const [caseCards, setCaseCards] = useState([initialCaseCard]);
  const [expandedCases, setExpandedCases] = useState([true]);
  const [valueCards, setValueCards] = useState([]);
  const [tensionCards, setTensionCards] = useState([]);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showValueModal, setShowValueModal] = useState(false);
  const [showTensionModal, setShowTensionModal] = useState(false);
  const [showCreateValueModal, setShowCreateValueModal] = useState(false);
  const [userValueHistory, setUserValueHistory] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [selectedTensions, setSelectedTensions] = useState([]);
  const [newValue, setNewValue] = useState({ value: '', definition: '' });
  const [newTension, setNewTension] = useState({ value: '', definition: '' });
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [editingValueIndex, setEditingValueIndex] = useState(-1);
  const [editingTensionIndex, setEditingTensionIndex] = useState(-1);
  const [deletingValueIndex, setDeletingValueIndex] = useState(-1);
  const [deletingTensionIndex, setDeletingTensionIndex] = useState(-1);
  const [showQA, setShowQA] = useState(false);
  const [showCreateTensionModal, setShowCreateTensionModal] = useState(false);
  const [userTensionHistory, setUserTensionHistory] = useState([]);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showCaseSelectionModal, setShowCaseSelectionModal] = useState(false);
  const [pendingAssignment, setPendingAssignment] = useState(null); // { type: 'value'|'tension', item: {...} }
  const [editingSelectedValueIndex, setEditingSelectedValueIndex] = useState(-1);
  const [editingSelectedTensionIndex, setEditingSelectedTensionIndex] = useState(-1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Initialize template data when component mounts
  useEffect(() => {
    const scenario = SCENARIOS.find(s => s.key === selectedScenario);
    if (scenario && scenario.template) {
      setTemplateData({ ...scenario.template });
    }
  }, []); // Empty dependency array means this runs once on mount

  // Fetch user value and tension history when component mounts or user changes
  useEffect(() => {
    if (user && user.email) {
      fetchUserValueHistory();
      fetchUserTensionHistory();
    }
  }, [user]);

  // Handle scenario selection
  const handleScenarioChange = (key) => {
    setSelectedScenario(key);
    const scenario = SCENARIOS.find(s => s.key === key);
    
    if (key === 'custom') {
      // When switching to "Create Your Own", use custom data
      // If custom data is empty, initialize with empty fields
      if (customData.title === '' && customData.description === '') {
        setCustomData({ ...initialConceptCard });
      }
    } else {
      // When switching to predefined scenarios, load the template
      setTemplateData(scenario && scenario.template ? { ...scenario.template } : { ...initialConceptCard });
    }
  };

  // Handle concept card field change
  const handleConceptChange = (e) => {
    const { name, value } = e.target;
    if (selectedScenario === 'custom') {
      setCustomData(card => ({ ...card, [name]: value }));
    }
  };

  // Add, edit, delete, fold/unfold case cards (scaffolded, details to be filled in next steps)
  const handleAddCase = () => {
    // Validate that all existing cases have required fields
    const missingFields = [];
    
    caseCards.forEach((card, idx) => {
      if (!card.summary || card.summary.trim() === '') {
        missingFields.push(`Case ${idx + 1}: Case Theme is required.`);
      }
      if (!card.caseText || card.caseText.trim() === '') {
        missingFields.push(`Case ${idx + 1}: Case Narrative is required.`);
      }
      if (!card.values || card.values.length === 0) {
        missingFields.push(`Case ${idx + 1}: At least one Value is required.`);
      }
    });
    
    if (missingFields.length > 0) {
      setErrorMessage(missingFields.join('\n'));
      setShowValidationModal(true);
      return;
    }
    
    const newCase = { ...initialCaseCard };
    setCaseCards(prev => [...prev, newCase]);
    // Fold all existing cases and expand only the new one
    const newIndex = caseCards.length;
    setExpandedCases(prev => {
      const newExpanded = new Array(newIndex + 1).fill(false);
      newExpanded[newIndex] = true; // Only expand the new case
      return newExpanded;
    });
  };
  const handleRemoveCase = (idx) => {
    setCaseCards(cards => cards.filter((_, i) => i !== idx));
    setExpandedCases(expanded => expanded.filter((_, i) => i !== idx));
  };

  const handleRemoveValue = (caseIdx, valueIdx) => {
    setCaseCards(cards => cards.map((card, i) => 
      i === caseIdx 
        ? { ...card, values: card.values.filter((_, j) => j !== valueIdx) }
        : card
    ));
  };

  const handleRemoveTension = (caseIdx, tensionIdx) => {
    setCaseCards(cards => cards.map((card, i) => 
      i === caseIdx 
        ? { ...card, tensions: card.tensions.filter((_, j) => j !== tensionIdx) }
        : card
    ));
  };
  const handleCaseChange = (idx, name, value) => {
    setCaseCards(cards => cards.map((c, i) => i === idx ? { ...c, [name]: value } : c));
  };
  const handleExpandCase = (idx) => {
    setExpandedCases(expanded => expanded.map((v, i) => i === idx ? !v : v));
  };

  // Validate individual case
  const validateCase = (caseIdx) => {
    const card = caseCards[caseIdx];
    const missingFields = [];
    
    if (!card.summary || card.summary.trim() === '') {
      missingFields.push('Case Theme is required.');
    }
    if (!card.caseText || card.caseText.trim() === '') {
      missingFields.push('Case Narrative is required.');
    }
    if (!card.values || card.values.length === 0) {
      missingFields.push('At least one Value is required.');
    }
    
    return missingFields;
  };

  // Save/fold individual case
  const handleSaveCase = (caseIdx) => {
    const missingFields = validateCase(caseIdx);
    
    if (missingFields.length > 0) {
      setErrorMessage(missingFields.join('\n'));
      setShowValidationModal(true);
      return;
    }
    
    // Fold the case (mark as completed)
    setExpandedCases(expanded => expanded.map((v, i) => i === caseIdx ? false : v));
  };

  // Get open cases (expanded cases)
  const getOpenCases = () => {
    return caseCards.map((card, idx) => ({ card, idx })).filter(({ idx }) => expandedCases[idx]);
  };

  // Handle direct assignment of value/tension to case
  const handleDirectAssignment = (type, item) => {
    const openCases = getOpenCases();
    
    if (openCases.length === 0) {
      setErrorMessage('No case is currently open. Please expand a case first to assign values or tensions.');
      setShowValidationModal(true);
      return;
    }
    
    if (openCases.length === 1) {
      // Direct assignment to the only open case
      const caseIdx = openCases[0].idx;
      if (type === 'value') {
        addValueToCase(item, caseIdx);
      } else {
        addTensionToCase(item, caseIdx);
      }
      // Remove from selected items
      if (type === 'value') {
        setSelectedValues(prev => prev.filter(v => !(v.value === item.value && v.definition === item.definition)));
      } else {
        setSelectedTensions(prev => prev.filter(t => !(t.value === item.value && t.definition === item.definition)));
      }
    } else {
      // Multiple cases open - show selection modal
      setPendingAssignment({ type, item });
      setShowCaseSelectionModal(true);
    }
  };

  // Handle case selection for assignment
  const handleCaseSelection = (caseIdx) => {
    if (!pendingAssignment) return;
    
    const { type, item } = pendingAssignment;
    if (type === 'value') {
      addValueToCase(item, caseIdx);
      setSelectedValues(prev => prev.filter(v => !(v.value === item.value && v.definition === item.definition)));
    } else {
      addTensionToCase(item, caseIdx);
      setSelectedTensions(prev => prev.filter(t => !(t.value === item.value && t.definition === item.definition)));
    }
    
    setPendingAssignment(null);
    setShowCaseSelectionModal(false);
  };

  // Save All (scaffolded, backend integration to be added)
  const handleSaveAll = async () => {
    setShowConfirmModal(true);
  };

  // Add new function to handle actual save after confirmation:
  const handleConfirmSave = async () => {
    setShowConfirmModal(false);
    setSaveError(''); 
    setSaveSuccess(false);
    
    // Validate user
    if (!user) { 
      setSaveError('You must be logged in to submit.'); 
      return; 
    }
    
    // Validate concept card
    const currentData = selectedScenario === 'custom' ? customData : templateData;
    if (!currentData.title || currentData.title.trim() === '') {
      setSaveError('Title is required for the AI Application Card.');
      return;
    }
    if (!currentData.description || currentData.description.trim() === '') {
      setSaveError('Description is required for the AI Application Card.');
      return;
    }
    
    // Validate case cards
    let hasError = false;
    caseCards.forEach((card, idx) => {
      if (!card.summary || card.summary.trim() === '') {
        setSaveError(`Case ${idx + 1}: Case Theme is required.`);
        hasError = true;
      }
      if (!card.caseText || card.caseText.trim() === '') {
        setSaveError(`Case ${idx + 1}: Case Narrative is required.`);
        hasError = true;
      }
    });
    
    if (hasError) return;
    
    // Prepare submission data
    const submission = {
      title: currentData.title,
      author: user.username,
      email: user.email,
      conceptCard: currentData,
      cases: caseCards.map(card => ({
        summary: card.summary,
        caseText: card.caseText,
        subject: card.subject,
        gradeLevel: card.gradeLevel,
        date: card.date,
        values: card.values,
        tensions: card.tensions,
        impactedPopulations: card.impactedPopulations
      })),
      submittedAt: new Date().toISOString()
    };
    
    try {
      const res = await fetch('/api/case-studies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission)
      });
      
      if (res.ok) {
        setSaveSuccess(true);
        setSaveError('');
        // Reset form after successful save
        setCustomData({
          title: '',
          description: '',
          doAct: '',
          inferReason: '',
          data1: '',
          data2: '',
          data3: '',
          data4: '',
          payer: '',
          servicingParty: '',
          endUser: '',
          impactedIndividuals: ''
        });
        setCaseCards([initialCaseCard]);
        setExpandedCases([true]);
      } else {
        setSaveError('Failed to save. Please try again.');
      }
    } catch (err) {
      setSaveError('Failed to save. Please try again.');
    }
  };

  const handleClickValueCard = (card) => {
    // Find the first expanded case
    const expandedIndex = expandedCases.findIndex(expanded => expanded);
    
    if (expandedIndex >= 0) {
      // Check if this value already exists in the case
      const currentCase = caseCards[expandedIndex];
      const existingValues = currentCase.values || [];
      const valueExists = existingValues.some(existingValue => 
        existingValue.value.toLowerCase() === card.value.toLowerCase()
      );
      
      if (valueExists) {
        showError(`Cannot add "${card.value}" to Case ${expandedIndex + 1}.\n\nThis value is already added to this case. Each case can only have one instance of each value name, even if the definitions are different.\n\nTo add a different definition of "${card.value}", please remove the existing one first.`);
        return;
      }
      
      // Add to the expanded case
      setCaseCards(cards => cards.map((caseCard, idx) => 
        idx === expandedIndex
          ? { 
              ...caseCard, 
              values: [...(caseCard.values || []), card]
            }
          : caseCard
      ));
      
      // Show success message
      console.log(`✅ Added "${card.value}" to Case ${expandedIndex + 1}`);
    } else {
      // No case is expanded, show error popup
      showError('Please expand a case first before adding values.\n\nTo expand a case:\n1. Click on a case title (e.g., "Case 1", "Case 2")\n2. The case will expand and show its content\n3. Then you can click values to add them to that case');
    }
  };

  const handleClickTensionCard = (card) => {
    // For now, we'll add to the first case card
    // In a more advanced version, we could track which case is currently active
    setCaseCards(cards => cards.map((caseCard, idx) => 
      idx === 0 // Add to first case for now
        ? { 
            ...caseCard, 
            tensions: [...(caseCard.tensions || []), card.value]
          }
        : caseCard
    ));
  };

  const handleAddPredefinedValue = (value) => {
    // Find the first expanded case
    const expandedIndex = expandedCases.findIndex(expanded => expanded);
    
    if (expandedIndex >= 0) {
      // Check if this value already exists in the case
      const currentCase = caseCards[expandedIndex];
      const existingValues = currentCase.values || [];
      const valueExists = existingValues.some(existingValue => 
        existingValue.value.toLowerCase() === value.value.toLowerCase()
      );
      
      if (valueExists) {
        showError(`Cannot add "${value.value}" to Case ${expandedIndex + 1}.\n\nThis value is already added to this case. Each case can only have one instance of each value name, even if the definitions are different.\n\nTo add a different definition of "${value.value}", please remove the existing one first.`);
        return;
      }
      
      // Add to the expanded case
      setCaseCards(cards => cards.map((caseCard, idx) => 
        idx === expandedIndex
          ? { 
              ...caseCard, 
              values: [...(caseCard.values || []), value]
            }
          : caseCard
      ));
      
      // Show success message
      console.log(`✅ Added "${value.value}" to Case ${expandedIndex + 1}`);
    } else {
      // No case is expanded, show error popup
      showError('Please expand a case first before adding values.\n\nTo expand a case:\n1. Click on a case title (e.g., "Case 1", "Case 2")\n2. The case will expand and show its content\n3. Then you can click values to add them to that case');
    }
  };

  const handleAddPredefinedTension = (tension) => {
    // Add to the first case card (or you could add logic to determine which case is active)
    setCaseCards(cards => cards.map((caseCard, idx) => 
      idx === 0 ? {
        ...caseCard,
        tensions: [...(caseCard.tensions || []), tension]
      } : caseCard
    ));
  };

  // Fetch user's value history
  const fetchUserValueHistory = async () => {
    if (!user || !user.email) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/user-value-history/${encodeURIComponent(user.email)}`);
      const result = await response.json();
      
      if (result.success) {
        setUserValueHistory(result.data);
      }
    } catch (error) {
      console.error('Error fetching user value history:', error);
    }
  };

  // Fetch user's tension history
  const fetchUserTensionHistory = async () => {
    if (!user || !user.email) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/user-tension-history/${encodeURIComponent(user.email)}`);
      const result = await response.json();
      
      if (result.success) {
        setUserTensionHistory(result.data);
      }
    } catch (error) {
      console.error('Error fetching user tension history:', error);
    }
  };

  // Check if a value is also predefined
  const isValueAlsoPredefined = (value) => {
    return predefinedValues.some(predefined => 
      predefined.value.toLowerCase() === value.value.toLowerCase() && 
      predefined.definition === value.definition
    );
  };

  // Check if a tension is also predefined
  const isTensionAlsoPredefined = (tension) => {
    return predefinedTensions.some(predefined => 
      predefined.value.toLowerCase() === tension.value.toLowerCase() && 
      predefined.definition === tension.definition
    );
  };

  // Handle value selection
  const handleValueSelection = (value) => {
    setSelectedValues(prev => {
      // Check if this exact value (name + definition) is already selected
      const isSelected = prev.some(v => v.value === value.value && v.definition === value.definition);
      if (isSelected) {
        return prev.filter(v => !(v.value === value.value && v.definition === value.definition));
      } else {
        return [...prev, value];
      }
    });
  };

  // Handle tension selection
  const handleTensionSelection = (tension) => {
    setSelectedTensions(prev => {
      // Check if this exact tension (name + definition) is already selected
      const isSelected = prev.some(t => t.value === tension.value && t.definition === tension.definition);
      if (isSelected) {
        return prev.filter(t => !(t.value === tension.value && t.definition === tension.definition));
      } else {
        return [...prev, tension];
      }
    });
  };

  // Handle create new value
  const handleCreateValue = () => {
    console.log('handleCreateValue called');
    console.log('editingSelectedValueIndex:', editingSelectedValueIndex);
    console.log('editingValueIndex:', editingValueIndex);
    console.log('newValue:', newValue);
    
    if (newValue.value.trim() && newValue.definition.trim()) {
      const updatedValue = {
        value: newValue.value.trim(),
        definition: newValue.definition.trim()
      };
      if (editingSelectedValueIndex >= 0) {
        console.log('Editing selected value at index:', editingSelectedValueIndex);
        // Editing a value in selectedValues
        setSelectedValues(prev => prev.map((v, idx) => idx === editingSelectedValueIndex ? updatedValue : v));
        setEditingSelectedValueIndex(-1);
      } else if (editingValueIndex >= 0) {
        // Editing an existing value in the pool
        // Check for duplicate names (excluding the current value being edited)
        const otherValueNames = valueCards
          .filter((_, idx) => idx !== editingValueIndex)
          .map(card => card.value.toLowerCase());
        
        if (otherValueNames.includes(updatedValue.value.toLowerCase())) {
          showError(`A value named "${updatedValue.value}" already exists.\n\nPlease choose a different name for your value.`);
          return;
        }
        
        // Update the existing value in the pool
        setValueCards(prev => prev.map((card, idx) => 
          idx === editingValueIndex ? updatedValue : card
        ));
        
        // Reset editing state
        setEditingValueIndex(-1);
      } else {
        // Creating a new value
        // Check for duplicate value names in both value pool and selected values
        const existingValueNames = valueCards.map(card => card.value.toLowerCase());
        const selectedValueNames = selectedValues.map(value => value.value.toLowerCase());
        const allExistingNames = [...existingValueNames, ...selectedValueNames];
        
        if (allExistingNames.includes(updatedValue.value.toLowerCase())) {
          showError(`A value named "${updatedValue.value}" already exists.\n\nPlease choose a different name for your value.`);
          return;
        }
        
        // Add to selected values
        setSelectedValues(prev => [...prev, updatedValue]);
      }
      
      // Reset form
      setNewValue({ value: '', definition: '' });
      setShowCreateValueModal(false);
      setEditingValueIndex(-1);
      setEditingSelectedValueIndex(-1);
    }
  };

  // Handle create new tension
  const handleCreateTension = () => {
    console.log('handleCreateTension called');
    console.log('editingSelectedTensionIndex:', editingSelectedTensionIndex);
    console.log('editingTensionIndex:', editingTensionIndex);
    console.log('newTension:', newTension);
    
    if (newTension.value.trim() && newTension.definition.trim()) {
      const updatedTension = {
        value: newTension.value.trim(),
        definition: newTension.definition.trim()
      };
      if (editingSelectedTensionIndex >= 0) {
        console.log('Editing selected tension at index:', editingSelectedTensionIndex);
        // Editing a tension in selectedTensions
        setSelectedTensions(prev => prev.map((t, idx) => idx === editingSelectedTensionIndex ? updatedTension : t));
        setEditingSelectedTensionIndex(-1);
      } else if (editingTensionIndex >= 0) {
        // Editing an existing tension in the pool
        // Check for duplicate names (excluding the current tension being edited)
        const otherTensionNames = tensionCards
          .filter((_, idx) => idx !== editingTensionIndex)
          .map(card => card.value.toLowerCase());
        
        if (otherTensionNames.includes(updatedTension.value.toLowerCase())) {
          showError(`A tension named "${updatedTension.value}" already exists.\n\nPlease choose a different name for your tension.`);
          return;
        }
        
        // Update the existing tension in the pool
        setTensionCards(prev => prev.map((card, idx) => 
          idx === editingTensionIndex ? updatedTension : card
        ));
        
        // Reset editing state
        setEditingTensionIndex(-1);
      } else {
        // Creating a new tension
        // Check for duplicate tension names in both tension pool and selected tensions
        const existingTensionNames = tensionCards.map(card => card.value.toLowerCase());
        const selectedTensionNames = selectedTensions.map(tension => tension.value.toLowerCase());
        const allExistingNames = [...existingTensionNames, ...selectedTensionNames];
        
        if (allExistingNames.includes(updatedTension.value.toLowerCase())) {
          showError(`A tension named "${updatedTension.value}" already exists.\n\nPlease choose a different name for your tension.`);
          return;
        }
        
        // Add to selected tensions
        setSelectedTensions(prev => [...prev, updatedTension]);
      }
      
      // Reset form
      setNewTension({ value: '', definition: '' });
      setShowCreateTensionModal(false);
      setEditingTensionIndex(-1);
      setEditingSelectedTensionIndex(-1);
    }
  };

  // Close search modals and keep selected items
  const closeValueModal = () => {
    setShowValueModal(false);
  };

  const closeTensionModal = () => {
    setShowTensionModal(false);
  };

  // Add value from pool to specific case
  const addValueToCase = (value, caseIdx) => {
    setCaseCards(prev => prev.map((card, i) => {
      if (i !== caseIdx) return card;
      // Check for duplicate name or definition in the case
      const hasDuplicate = (card.values || []).some(existingValue =>
        existingValue.value.trim().toLowerCase() === value.value.trim().toLowerCase() ||
        existingValue.definition.trim() === value.definition.trim()
      );
      if (hasDuplicate) {
        showError('This case already contains a value with the same name or definition.');
        return card;
      }
      return { ...card, values: [...(card.values || []), value] };
    }));
  };

  const addTensionToCase = (tension, caseIdx) => {
    setCaseCards(prev => prev.map((card, i) => {
      if (i !== caseIdx) return card;
      // Check for duplicate name or definition in the case
      const hasDuplicate = (card.tensions || []).some(existingTension =>
        existingTension.value.trim().toLowerCase() === tension.value.trim().toLowerCase() ||
        existingTension.definition.trim() === tension.definition.trim()
      );
      if (hasDuplicate) {
        showError('This case already contains a tension with the same name or definition.');
        return card;
      }
      return { ...card, tensions: [...(card.tensions || []), tension] };
    }));
  };

  // Get the currently active case index
  const getActiveCaseIndex = () => {
    return expandedCases.findIndex(expanded => expanded);
  };

  // Get the active case display text
  const getActiveCaseText = () => {
    const activeIndex = getActiveCaseIndex();
    return activeIndex >= 0 ? `Case ${activeIndex + 1}` : 'an expanded case';
  };

  // Show custom error message
  const showError = (message) => {
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  // Handle edit value
  const handleEditValue = (idx) => {
    const valueToEdit = valueCards[idx];
    setNewValue({ value: valueToEdit.value, definition: valueToEdit.definition });
    setShowCreateValueModal(true);
    // Store the index of the value being edited
    setEditingValueIndex(idx);
  };

  // Handle delete value
  const handleDeleteValue = (idx) => {
    const valueToDelete = valueCards[idx];
    setErrorMessage(`Are you sure you want to delete "${valueToDelete.value}"?\n\nThis action cannot be undone.`);
    setShowErrorModal(true);
    // Store the index to delete when user confirms
    setDeletingValueIndex(idx);
  };

  // Handle edit tension
  const handleEditTension = (idx) => {
    const tensionToEdit = tensionCards[idx];
    setNewTension({ value: tensionToEdit.value, definition: tensionToEdit.definition });
    setShowCreateTensionModal(true);
    // Store the index of the tension being edited
    setEditingTensionIndex(idx);
  };

  // Handle delete tension
  const handleDeleteTension = (idx) => {
    const tensionToDelete = tensionCards[idx];
    setErrorMessage(`Are you sure you want to delete "${tensionToDelete.value}"?\n\nThis action cannot be undone.`);
    setShowErrorModal(true);
    // Store the index to delete when user confirms
    setDeletingTensionIndex(idx);
  };

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1400px', 
      margin: '0 auto', 
      background: '#f8fafc', 
      minHeight: '100vh' 
    }}>
      <div style={{ paddingTop: '80px', paddingBottom: '40px' }}>
        <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', padding: '0 20px' }}>
          {/* Page Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ color: '#16a34a', fontWeight: 800, fontSize: '2.5rem', marginBottom: '16px' }}>
              Contribute a Case
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              Share your AI case study to help build a comprehensive collection of human-centered AI applications in education.
            </p>
          </div>

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* AI Application Card Section */}
            <div className="concept-card-section" style={{ 
              background: '#f8fafc', 
              borderRadius: 18, 
              border: '1.5px solid #e5e7eb', 
              boxShadow: '0 4px 32px rgba(0,0,0,0.06)', 
              padding: '2.2rem', 
              width: '100%' 
            }}>
              <div style={{ 
                fontWeight: 700, 
                color: '#16a34a', 
                fontSize: '1.4rem', 
                marginBottom: 18, 
                textAlign: 'center', 
                letterSpacing: '-0.5px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 8 
              }}>
                AI Application Card
                <Tooltip text="Use this card to clearly describe how your AI system works in an educational setting. Even similar tools may differ in purpose, data, or stakeholders. This structured format ensures everyone has shared context, please fill it out as thoroughly as possible.">?</Tooltip>
              </div>

        {/* Scenario Selection */}
              <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <label style={{ color: '#374151', fontWeight: 600, marginBottom: 8, fontSize: '1rem', display: 'block' }}>
            Choose an AI application scenario:
          </label>
          <select
            value={selectedScenario}
            onChange={e => handleScenarioChange(e.target.value)}
            style={{
                    fontSize: '1rem', 
              padding: '0.7rem 2.2rem',
                    borderRadius: 12, 
              border: '2px solid #16a34a',
              background: '#fff',
              color: '#222',
                    fontWeight: 600, 
                    boxShadow: '0 2px 8px rgba(34,197,94,0.10)', 
                    outline: 'none', 
                    minWidth: 220, 
                    cursor: 'pointer', 
                    transition: 'border 0.2s' 
                  }}
                >
                  {SCENARIOS.map(scenario => (
                    <option key={scenario.key} value={scenario.key}>{scenario.label}</option>
            ))}
          </select>
        </div>

              {/* Concept Card */}
        <div style={{
          background: '#fff',
          borderRadius: 18,
          border: '1.5px solid #e5e7eb',
                boxShadow: '0 4px 32px rgba(0,0,0,0.06)', 
          padding: '2rem',
                width: '100%' 
              }}>
                {/* Title and Description */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ color: '#444', fontWeight: 600, fontSize: '1rem', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    Title
                    <Tooltip text="Please share the name of the application or a short descriptive title for the system.">?</Tooltip>
                  </div>
                  <textarea 
                    name="title"
                    value={selectedScenario === 'custom' ? customData.title : templateData.title} 
                    onChange={handleConceptChange}
                    rows={3} 
                    readOnly={selectedScenario !== 'custom'}
                    style={{ 
            width: '100%',
                      background: selectedScenario !== 'custom' ? '#f5f5f5' : '#fff', 
                      color: '#222', 
                      fontWeight: 600, 
                      border: '1.5px solid #bbf7d0', 
                      borderRadius: 8, 
                      padding: '0.6em 1em', 
                      margin: 0, 
                      fontSize: '0.95rem', 
                      boxSizing: 'border-box', 
                      resize: 'none', 
                      overflowY: 'auto', 
                      marginBottom: 8 
                    }} 
                  />
                  <div style={{ color: '#444', fontWeight: 600, fontSize: '1rem', marginBottom: 6, textAlign: 'left' }}>
                    Description
                  </div>
                  <textarea 
                    name="description"
                    value={selectedScenario === 'custom' ? customData.description : templateData.description} 
                    onChange={handleConceptChange}
                    rows={4} 
                    readOnly={selectedScenario !== 'custom'}
                    style={{ 
                      width: '100%', 
                      background: selectedScenario !== 'custom' ? '#f5f5f5' : '#fff', 
                      color: '#222', 
                      fontWeight: 500, 
                      border: '1.5px solid #bbf7d0', 
                      borderRadius: 8, 
                      padding: '0.6em 1em', 
                      margin: 0, 
                      fontSize: '0.92rem', 
                      boxSizing: 'border-box', 
                      resize: 'none', 
                      overflowY: 'auto', 
                      marginBottom: 8 
                    }} 
                  />
                </div>

                {/* What the system does */}
                <div style={{ fontWeight: 700, color: '#388e5c', fontSize: '1.05rem', margin: '18px 0 6px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  What the system does
                  <Tooltip text="Please explain the system's direct actions or outputs (e.g., sends alerts, generates reports, automates a task).">?</Tooltip>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 12 }}>
                  <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <b>Do/Act:</b>
                      <Tooltip text="Please explain the system's direct actions or outputs (e.g., sends alerts, generates reports, automates a task).">?</Tooltip>
                    </span>
                    <textarea 
                      name="doAct"
                      value={selectedScenario === 'custom' ? customData.doAct : templateData.doAct} 
                      onChange={handleConceptChange}
                      rows={5} 
                      readOnly={selectedScenario !== 'custom'}
                      style={{ 
                        width: '100%', 
                        background: selectedScenario !== 'custom' ? '#f5f5f5' : '#fff', 
                        color: '#222', 
                        border: '1.5px solid #bbf7d0', 
                        borderRadius: 8, 
                        padding: '0.6em 1em', 
                        fontSize: '0.9rem', 
                        boxSizing: 'border-box', 
                        resize: 'none', 
                        overflowY: 'auto' 
                      }} 
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <b>Infer/Reason:</b>
                      <Tooltip text="Please describe what the system is analyzing or trying to figure out (e.g., detecting disengagement, predicting student needs).">?</Tooltip>
                    </span>
                    <textarea 
                      name="inferReason"
                      value={selectedScenario === 'custom' ? customData.inferReason : templateData.inferReason} 
                      onChange={handleConceptChange}
                      rows={5} 
                      readOnly={selectedScenario !== 'custom'}
                      style={{ 
                        width: '100%', 
                        background: selectedScenario !== 'custom' ? '#f5f5f5' : '#fff', 
                        color: '#222', 
                        border: '1.5px solid #bbf7d0', 
                        borderRadius: 8, 
                        padding: '0.6em 1em', 
                        fontSize: '0.9rem', 
                        boxSizing: 'border-box', 
                        resize: 'none', 
                        overflowY: 'auto' 
                      }} 
                    />
                  </div>
                </div>

                {/* What data will be used */}
                <div style={{ fontWeight: 700, color: '#388e5c', fontSize: '1.05rem', margin: '18px 0 6px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  What data will be used
                  <Tooltip text="Please list the data your system uses (e.g., engagement, attendance). If unsure, just write what you know, no need to fill every box.">?</Tooltip>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: '100%' }}><b style={{ textAlign: 'left', display: 'block' }}>Data 1:</b> <textarea 
                    name="data1"
                    value={selectedScenario === 'custom' ? customData.data1 : templateData.data1} 
                    onChange={handleConceptChange}
                    rows={3} 
                    readOnly={selectedScenario !== 'custom'}
                    style={{ 
                      width: '100%', 
                      background: selectedScenario !== 'custom' ? '#f5f5f5' : '#fff', 
                      color: '#222', 
                      border: '1.5px solid #bbf7d0', 
                      borderRadius: 8, 
                      padding: '0.6em 1em', 
                      fontSize: '0.9rem', 
                      boxSizing: 'border-box', 
                      resize: 'none', 
                      overflowY: 'auto' 
                    }} 
                  /></div>
                  <div style={{ width: '100%' }}><b style={{ textAlign: 'left', display: 'block' }}>Data 2:</b> <textarea 
                    name="data2"
                    value={selectedScenario === 'custom' ? customData.data2 : templateData.data2} 
                    onChange={handleConceptChange}
                    rows={3} 
                    readOnly={selectedScenario !== 'custom'}
                    style={{ 
                      width: '100%', 
                      background: selectedScenario !== 'custom' ? '#f5f5f5' : '#fff', 
                      color: '#222', 
                      border: '1.5px solid #bbf7d0', 
                      borderRadius: 8, 
                      padding: '0.6em 1em', 
                      fontSize: '0.9rem', 
                      boxSizing: 'border-box', 
                      resize: 'none', 
                      overflowY: 'auto' 
                    }} 
                  /></div>
                  <div style={{ width: '100%' }}><b style={{ textAlign: 'left', display: 'block' }}>Data 3:</b> <textarea 
                    name="data3"
                    value={selectedScenario === 'custom' ? customData.data3 : templateData.data3} 
                    onChange={handleConceptChange}
                    rows={3} 
                    readOnly={selectedScenario !== 'custom'}
                    style={{ 
                      width: '100%', 
                      background: selectedScenario !== 'custom' ? '#f5f5f5' : '#fff', 
                      color: '#222', 
                      border: '1.5px solid #bbf7d0', 
                      borderRadius: 8, 
                      padding: '0.6em 1em', 
                      fontSize: '0.9rem', 
                      boxSizing: 'border-box', 
                      resize: 'none', 
                      overflowY: 'auto' 
                    }} 
                  /></div>
                  <div style={{ width: '100%' }}><b style={{ textAlign: 'left', display: 'block' }}>Data 4:</b> <textarea 
                    name="data4"
                    value={selectedScenario === 'custom' ? customData.data4 : templateData.data4} 
                    onChange={handleConceptChange}
                    rows={3} 
                    readOnly={selectedScenario !== 'custom'}
                    style={{ 
                      width: '100%', 
                      background: selectedScenario !== 'custom' ? '#f5f5f5' : '#fff', 
                      color: '#222', 
                      border: '1.5px solid #bbf7d0', 
                      borderRadius: 8, 
                      padding: '0.6em 1em', 
                      fontSize: '0.9rem', 
                      boxSizing: 'border-box', 
                      resize: 'none', 
                      overflowY: 'auto' 
                    }} 
                  /></div>
                </div>

                {/* Stakeholders */}
                <div style={{ fontWeight: 700, color: '#388e5c', fontSize: '1.05rem', margin: '18px 0 6px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Stakeholders
                  <Tooltip text="List key groups involved with or affected by the system. If you're unsure about some roles, just fill in what you know.">?</Tooltip>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: '100%' }}>
                    <b style={{ textAlign: 'left', display: 'block' }}>Funder/Customer:</b> 
                    <textarea 
                      name="payer"
                      value={selectedScenario === 'custom' ? customData.payer : templateData.payer} 
                      onChange={handleConceptChange}
                      rows={3} 
                      readOnly={selectedScenario !== 'custom'}
                      style={{ 
                        width: '100%', 
                        background: selectedScenario !== 'custom' ? '#f5f5f5' : '#fff', 
                        color: '#222', 
                        border: '1.5px solid #bbf7d0', 
                        borderRadius: 8, 
                        padding: '0.6em 1em', 
                        fontSize: '0.9rem', 
                        boxSizing: 'border-box', 
                        resize: 'none', 
                        overflowY: 'auto' 
                      }} 
                    />
                  </div>
                  <div style={{ width: '100%' }}>
                    <b style={{ textAlign: 'left', display: 'block' }}>Servicing Party:</b> 
                    <textarea 
                      name="servicingParty"
                      value={selectedScenario === 'custom' ? customData.servicingParty : templateData.servicingParty} 
                      onChange={handleConceptChange}
                      rows={3} 
                      readOnly={selectedScenario !== 'custom'}
                      style={{ 
                        width: '100%', 
                        background: selectedScenario !== 'custom' ? '#f5f5f5' : '#fff', 
                        color: '#222', 
                        border: '1.5px solid #bbf7d0', 
                        borderRadius: 8, 
                        padding: '0.6em 1em', 
                        fontSize: '0.9rem', 
                        boxSizing: 'border-box', 
                        resize: 'none', 
                        overflowY: 'auto' 
                      }} 
                    />
                  </div>
                  <div style={{ width: '100%' }}>
                    <b style={{ textAlign: 'left', display: 'block' }}>End User:</b> 
                    <textarea 
                      name="endUser"
                      value={selectedScenario === 'custom' ? customData.endUser : templateData.endUser} 
                      onChange={handleConceptChange}
                      rows={3} 
                      readOnly={selectedScenario !== 'custom'}
                      style={{ 
                        width: '100%', 
                        background: selectedScenario !== 'custom' ? '#f5f5f5' : '#fff', 
                        color: '#222', 
                        border: '1.5px solid #bbf7d0', 
                        borderRadius: 8, 
                        padding: '0.6em 1em', 
                        fontSize: '0.9rem', 
                        boxSizing: 'border-box', 
                        resize: 'none', 
                        overflowY: 'auto' 
                      }} 
                    />
                  </div>
                  <div style={{ width: '100%' }}>
                    <b style={{ textAlign: 'left', display: 'block' }}>Impacted Individuals:</b> 
                    <textarea 
                      name="impactedIndividuals"
                      value={selectedScenario === 'custom' ? customData.impactedIndividuals : templateData.impactedIndividuals} 
                      onChange={handleConceptChange}
                      rows={3} 
                      readOnly={selectedScenario !== 'custom'}
                      style={{ 
                        width: '100%', 
                        background: selectedScenario !== 'custom' ? '#f5f5f5' : '#fff', 
                        color: '#222', 
                        border: '1.5px solid #bbf7d0', 
                        borderRadius: 8, 
                        padding: '0.6em 1em', 
                        fontSize: '0.9rem', 
                        boxSizing: 'border-box', 
                        resize: 'none', 
                        overflowY: 'auto' 
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Case Cards Section */}
            <div style={{ marginBottom: '40px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginBottom: '20px',
                padding: '16px 20px',
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                borderRadius: '12px',
                border: '1px solid #bae6fd'
              }}>
                <h3 style={{ 
                  margin: 0, 
                  color: '#0c4a6e', 
                  fontSize: '1.4rem', 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  The Collection of Cases
                  <Tooltip text="The Collection of Cases is designed to capture real or hypothetical classroom situations where the same AI application (as defined above) is used. All cases added to this collection should relate to that same system.">?</Tooltip>
                </h3>
        </div>
              
          {caseCards.map((card, idx) => (
            <div key={idx} style={{
              background: '#fff',
                border: '1.5px solid #e5e7eb',
              borderRadius: 12,
              padding: '1.5rem',
              marginBottom: '1rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                position: 'relative'
            }}>
              {/* Case Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '16px' 
              }}>
                <h3 
                  style={{ 
                    color: '#16a34a', 
                    fontWeight: 700, 
                    fontSize: '1.2rem', 
                    margin: 0,
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                    onClick={() => handleExpandCase(idx)}
                  >
                  Case {idx + 1} {expandedCases[idx] ? '▼' : '▶'}
                </h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {expandedCases[idx] && (
                    <button
                      onClick={() => handleSaveCase(idx)}
                      style={{
                        background: '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#15803d'}
                      onMouseLeave={(e) => e.target.style.background = '#16a34a'}
                    >
                      Save Case
                    </button>
                  )}
                  {caseCards.length > 1 && (
                    <button
                      onClick={() => handleRemoveCase(idx)}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.1)';
                        e.target.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.3)';
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Case Content - Only show when expanded */}
              {expandedCases[idx] && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Case Theme */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                      <div style={{ color: '#374151', fontWeight: 600, fontSize: '0.95rem', textAlign: 'left' }}>
                        Case Theme
                      </div>
                      <Tooltip text="Briefly describe the main theme of this case. For example: Ethical concern about student engagement monitoring.">?</Tooltip>
                    </div>
                    <textarea
                    value={card.summary}
                      onChange={(e) => handleCaseChange(idx, 'summary', e.target.value)}
                      rows={2}
                      style={{
                        width: '100%',
                        background: '#fff',
                        color: '#222',
                        border: '1.5px solid #bbf7d0',
                        borderRadius: 8,
                        padding: '0.6em 1em',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box',
                        resize: 'none',
                        overflowY: 'auto'
                      }}
                    />
                  </div>
                  
                  {/* Case Narrative */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                      <div style={{ color: '#374151', fontWeight: 600, fontSize: '0.95rem', textAlign: 'left' }}>
                        Case Narrative
                      </div>
                      <Tooltip text="Provide a detailed account of the case. Include context, actions taken, people involved (e.g., teachers, students), and how the AI system was used or affected the situation.">?</Tooltip>
                    </div>
                  <textarea
                    value={card.caseText}
                      onChange={(e) => handleCaseChange(idx, 'caseText', e.target.value)}
                      rows={6}
                      style={{
                        width: '100%',
                        background: '#fff',
                        color: '#222',
                        border: '1.5px solid #bbf7d0',
                        borderRadius: 8,
                        padding: '0.6em 1em',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box',
                        resize: 'none',
                        overflowY: 'auto'
                      }}
                    />
                  </div>
                  
                  {/* Subject */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                      <div style={{ color: '#374151', fontWeight: 600, fontSize: '0.95rem', textAlign: 'left' }}>
                        Subject (optional)
                      </div>
                      <Tooltip text="Indicate the academic subject(s) relevant to this case, if applicable.">?</Tooltip>
                    </div>
                    <input
                      type="text"
                      value={card.subject}
                      onChange={(e) => handleCaseChange(idx, 'subject', e.target.value)}
                      style={{
                        width: '100%',
                        background: '#fff',
                        color: '#222',
                        border: '1.5px solid #bbf7d0',
                        borderRadius: 8,
                        padding: '0.6em 1em',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  
                  {/* Grade and Date row */}
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                        <div style={{ color: '#374151', fontWeight: 600, fontSize: '0.95rem', textAlign: 'left' }}>
                          Grade (optional)
                        </div>
                        <Tooltip text="Specify the student grade level(s) involved in the case, if applicable.">?</Tooltip>
                      </div>
                    <input
                        type="text"
                        value={card.gradeLevel}
                        onChange={(e) => handleCaseChange(idx, 'gradeLevel', e.target.value)}
                        style={{
                          width: '100%',
                          background: '#fff',
                          color: '#222',
                          border: '1.5px solid #bbf7d0',
                          borderRadius: 8,
                          padding: '0.6em 1em',
                          fontSize: '0.9rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                        <div style={{ color: '#374151', fontWeight: 600, fontSize: '0.95rem', textAlign: 'left' }}>
                          Date of Event (optional)
                        </div>
                        <Tooltip text="When did this incident happen, if applicable.">?</Tooltip>
                      </div>
                    <input
                      type="date"
                      value={card.date}
                        onChange={(e) => handleCaseChange(idx, 'date', e.target.value)}
                        style={{
                          width: '100%',
                          background: '#fff',
                          color: '#222',
                          border: '1.5px solid #bbf7d0',
                          borderRadius: 8,
                          padding: '0.6em 1em',
                          fontSize: '0.9rem',
                          boxSizing: 'border-box'
                        }}
                    />
                  </div>
                  </div>
                  
                  {/* Impacted Populations */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                      <div style={{ color: '#374151', fontWeight: 600, fontSize: '0.95rem', textAlign: 'left' }}>
                        Impacted Population(s)
                      </div>
                      <Tooltip text="Describe the groups of people who were directly or indirectly affected by this case. For example: Students, teachers, parents, administrators, or specific demographic groups.">?</Tooltip>
                    </div>
                  <textarea
                      value={card.impactedPopulations}
                      onChange={(e) => handleCaseChange(idx, 'impactedPopulations', e.target.value)}
                      rows={3}
                      style={{
                        width: '100%',
                        background: '#fff',
                        color: '#222',
                        border: '1.5px solid #bbf7d0',
                        borderRadius: 8,
                        padding: '0.6em 1em',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box',
                        resize: 'none',
                        overflowY: 'auto'
                      }}
                    />
                      </div>
                  
                  {/* Values Section */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                      <div style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.95rem', textAlign: 'left' }}>
                        Values
                    </div>
                      <Tooltip text="Select the ethical values that are most relevant to this case. These represent principles that should guide AI development and use.">?</Tooltip>
                      </div>
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '8px', 
                      minHeight: '40px',
                      padding: '8px',
                      border: '1.5px solid #bbf7d0',
                      borderRadius: 8,
                      background: '#f0fdf4'
                    }}>
                      {card.values && card.values.length > 0 ? (
                        card.values.map((value, valueIdx) => (
                          <div key={valueIdx} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#16a34a',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 500
                          }}>
                            <span>{value.value}</span>
                            <button
                              onClick={() => handleRemoveValue(idx, valueIdx)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '14px',
                                padding: '0',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              ×
                            </button>
                    </div>
                        ))
                      ) : (
                        <div style={{ color: '#6b7280', fontSize: '0.9rem', fontStyle: 'italic' }}>
                          Click on value cards below to add them here
                  </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Value Tensions Section */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                      <div style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.95rem', textAlign: 'left' }}>
                        Value Tension
                      </div>
                      <Tooltip text="Select the value tensions that are most relevant to this case. These represent conflicts between different ethical values that need to be balanced.">?</Tooltip>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '8px', 
                      minHeight: '40px',
                      padding: '8px',
                      border: '1.5px solid #bbf7d0',
                      borderRadius: 8,
                      background: '#f0fdf4'
                    }}>
                      {card.tensions && card.tensions.length > 0 ? (
                        card.tensions.map((tension, tensionIdx) => (
                          <div key={tensionIdx} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#16a34a',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 500
                          }}>
                            <span>{tension.value}</span>
                  <button
                              onClick={() => handleRemoveTension(idx, tensionIdx)}
                    style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '14px',
                                padding: '0',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              ×
                  </button>
                          </div>
                        ))
                      ) : (
                        <div style={{ color: '#6b7280', fontSize: '0.9rem', fontStyle: 'italic' }}>
                          Click on tension cards below to add them here
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
              
          <button
            onClick={handleAddCase}
            style={{
              margin: '0 auto', 
              display: 'block', 
              background: '#16a34a', 
              color: '#fff',
              border: 'none', 
              borderRadius: 12, 
              fontWeight: 700, 
              fontSize: '1rem',
              padding: '0.8rem 2rem', 
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#15803d'}
            onMouseLeave={(e) => e.target.style.background = '#16a34a'}
          >
            + Add Another Case
          </button>
        </div>
        {/* Unified Value Cards and Tension Cards Section */}
            <div style={{ 
              width: '100%', 
              maxWidth: 1100, 
              margin: '0 auto', 
              background: '#fff', 
              borderRadius: 18, 
              border: '1.5px solid #e5e7eb', 
              boxShadow: '0 2px 16px rgba(34,197,94,0.07)', 
              padding: '2.2rem', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center' 
            }}>
              <div style={{ 
                color: '#16a34a', 
                fontWeight: 800, 
                fontSize: '1.35rem', 
                marginBottom: 18, 
                letterSpacing: '-0.5px', 
                textAlign: 'center', 
                width: '100%' 
              }}>
                Value Cards & Tension Cards
              </div>


              {/* Q&A Section */}
              <div style={{
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: 8,
                padding: '1rem',
                marginBottom: '1rem',
                maxWidth: 600,
                width: '100%'
              }}>
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => setShowQA(!showQA)}
                >
                  <div style={{
                    background: '#0ea5e9',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    ?
          </div>
                  <h4 style={{
                    color: '#0c4a6e',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    margin: 0,
                    flex: 1
                  }}>
                    Frequently Asked Questions
                  </h4>
                  <div style={{
                    fontSize: '1rem',
                    color: '#0c4a6e',
                    fontWeight: 'bold',
                    transition: 'transform 0.2s',
                    transform: showQA ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}>
                    ▼
                  </div>
                </div>
                
                {showQA && (
                  <div style={{ fontSize: '0.85rem', lineHeight: 1.5, textAlign: 'left' }}>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontWeight: 600, color: '#0c4a6e', marginBottom: '0.3rem',marginTop: '1rem' }}>
                        Q: What are Responsible AI Values and Value Tensions?
                      </div>
                      <div style={{ color: '#374151' }}>
                        A: Responsible AI values, like fairness, transparency, and safety, guide how AI should be designed and used to benefit people and society. While these are often developed by tech companies and governments, they don't always reflect the realities of the classroom. Through authentic classroom cases, we aim to surface educator-defined values and real-world tensions. For example, being transparent about how AI flags student disengagement might conflict with protecting student privacy. This tool helps you document and share these values and tensions, so AI developers can better understand what matters in your teaching context.
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontWeight: 600, color: '#0c4a6e', marginBottom: '0.3rem' }}>
                        Q: How do I add values or value tensions to my cases?
                      </div>
                      <div style={{ color: '#374151' }}>
                        A: 1) Click "🔍 Search Values" or "🔍 Search Tensions" to browse predefined options or review your history. 2) Select values or value tensions to add to your pool, and ensure the definitions align with your understanding. 3) Open a case by clicking to expand it, then click on the values or tensions in your pool to assign them to that specific case.
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ fontWeight: 600, color: '#0c4a6e', marginBottom: '0.3rem' }}>
                        Q: Can I create my own values?
                      </div>
                      <div style={{ color: '#374151' }}>
                        A: Absolutely! Click "Create Your Own Value/tensions" in the search window to define a custom value name and description tailored to your AI application context.
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Search Buttons */}
              <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => setShowValueModal(true)}
                  style={{
                    background: '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.6rem 1.2rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#15803d'}
                  onMouseLeave={(e) => e.target.style.background = '#16a34a'}
                >
                  🔍 Search Values
                </button>
                <button
                  onClick={() => setShowTensionModal(true)}
                  style={{
                    background: '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.6rem 1.2rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#15803d'}
                  onMouseLeave={(e) => e.target.style.background = '#16a34a'}
                >
                  🔍 Search Tensions
                </button>
              </div>
              


              {/* Selected Values from Search */}
              {selectedValues.length > 0 && (
                <div style={{ 
                  marginTop: '1.5rem',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <div style={{ 
                    padding: '1.5rem',
                    background: '#fff',
                    borderRadius: 12,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    maxWidth: '600px',
                    width: '100%'
                  }}>
                    <div style={{ 
                      color: '#16a34a', 
                      fontWeight: 700, 
                      fontSize: '1.1rem', 
                      marginBottom: '1rem',
                      textAlign: 'center'
                    }}>
                      Selected Values from Search
                    </div>
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '16px',
                      width: '100%',
                      maxWidth: '800px',
                      margin: '0 auto',
                      textAlign: 'left'
                    }}>
                      {selectedValues.map((value, idx) => (
                        <div
                          key={`value-${idx}-${value.value}`}
                          className="value-card"
                          style={{
                            background: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: 8,
                            padding: '1rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            minHeight: '120px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                          }}
                          onClick={() => handleDirectAssignment('value', value)}
                        >
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start',
                            marginBottom: '0.5rem',
                          }}>
                            <div style={{ 
                              color: '#16a34a', 
                              fontWeight: 600, 
                              fontSize: '1rem',
                              textAlign: 'left'
                            }}>
                              {value.value}
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                className="edit-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('Edit value clicked for index:', idx);
                                  console.log('Value to edit:', value);
                                  setNewValue({ value: value.value, definition: value.definition });
                                  setShowCreateValueModal(true);
                                  setEditingSelectedValueIndex(idx); // Use selectedValues index
                                  setEditingValueIndex(-1); // Not editing pool
                                }}
                                style={{
                                  background: '#16a34a',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: 4,
                                  padding: '4px 8px',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                  transition: 'background 0.2s ease'
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedValues(prev => prev.filter((_, i) => i !== idx));
                                }}
                                style={{
                                  background: '#dc2626',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: 4,
                                  padding: '4px 8px',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                  transition: 'background 0.2s ease'
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <div style={{ 
                            color: '#374151', 
                            fontSize: '0.85rem', 
                            lineHeight: 1.4,
                            flex: 1,
                            textShadow: 'none'
                          }}>
                            {value.definition}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Tensions from Search */}
              {selectedTensions.length > 0 && (
                <div style={{ 
                  marginTop: '1.5rem',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <div style={{ 
                    padding: '1.5rem',
                    background: '#fff',
                    borderRadius: 12,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    maxWidth: '600px',
                    width: '100%'
                  }}>
                    <div style={{ 
                      color: '#16a34a', 
                      fontWeight: 700, 
                      fontSize: '1.1rem', 
                      marginBottom: '1rem',
                      textAlign: 'center'
                    }}>
                      Selected Tensions from Search
                    </div>
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '16px',
                      width: '100%',
                      maxWidth: '800px',
                      margin: '0 auto',
                      textAlign: 'left'
                    }}>
                      {selectedTensions.map((tension, idx) => (
                        <div
                          key={`tension-${idx}-${tension.value}`}
                          className="tension-card"
                          style={{
                            background: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: 8,
                            padding: '1rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            minHeight: '120px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                          }}
                          onClick={() => handleDirectAssignment('tension', tension)}
                        >
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start',
                            marginBottom: '0.5rem'
                          }}>
                            <div style={{ 
                              color: '#16a34a', 
                              fontWeight: 600, 
                              fontSize: '1rem' 
                            }}>
                              {tension.value}
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                className="edit-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('Edit tension clicked for index:', idx);
                                  console.log('Tension to edit:', tension);
                                  setNewTension({ value: tension.value, definition: tension.definition });
                                  setShowCreateTensionModal(true);
                                  setEditingSelectedTensionIndex(idx); // Use selectedTensions index
                                  setEditingTensionIndex(-1); // Not editing pool
                                }}
                                style={{
                                  background: '#16a34a',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: 4,
                                  padding: '4px 8px',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                  transition: 'background 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#15803d'}
                                onMouseLeave={(e) => e.target.style.background = '#16a34a'}
                              >
                                Edit
                              </button>
                              <button
                                className="delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTensions(prev => prev.filter((_, i) => i !== idx));
                                }}
                                style={{
                                  background: '#dc2626',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: 4,
                                  padding: '4px 8px',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                  transition: 'background 0.2s ease'
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <div style={{ 
                            color: '#374151', 
                            fontSize: '0.85rem', 
                            lineHeight: 1.4,
                            flex: 1,
                            textShadow: 'none'
                          }}>
                            {tension.definition}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
          </div>


            {/* Save All Section */}
            <div style={{ 
              width: '100%', 
              maxWidth: 1100, 
              margin: '32px auto 0 auto', 
              padding: '2rem 0', 
              textAlign: 'center'
            }}>
              <button
                className="green-btn polished-btn"
                style={{
                  fontSize: '1rem', 
                  padding: '0.8rem 2.5rem', 
                  borderRadius: 12, 
                  fontWeight: 800, 
                  background: '#16a34a', 
                  color: '#fff', 
                  border: 'none', 
                  boxShadow: '0 2px 8px rgba(34,197,94,0.07)',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#15803d'}
                onMouseLeave={(e) => e.target.style.background = '#16a34a'}
                onClick={handleSaveAll}
              >
                Save All
              </button>
            </div>
            {saveError && <div style={{ color: '#dc2626', fontWeight: 600, marginTop: 8, textAlign: 'center' }}>{saveError}</div>}
            {saveSuccess && <div style={{ color: '#16a34a', fontWeight: 700, marginTop: 8, textAlign: 'center' }}>Submission saved successfully!</div>}

            {/* Confirmation Modal */}
            {showConfirmModal && (
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
                zIndex: 10000
              }}>
                <div style={{
                  background: 'white',
                  borderRadius: 12,
                  padding: '2rem',
                  maxWidth: '500px',
                  width: '90%',
                  textAlign: 'center'
                }}>
                  <h3 style={{ color: '#16a34a', fontWeight: 700, fontSize: '1.3rem', margin: '0 0 1rem 0' }}>
                    Confirm Submission
                  </h3>
                  <p style={{ fontSize: '1rem', color: '#374151', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                    Submit {caseCards.length} case{caseCards.length !== 1 ? 's' : ''} under the application of "{selectedScenario === 'custom' ? customData.title : templateData.title}"?
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: '12px'
                  }}>
                    <button
                      onClick={() => setShowConfirmModal(false)}
                      style={{
                        background: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: '0.6rem 1.2rem',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmSave}
                      style={{
                        background: '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: '0.6rem 1.2rem',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#15803d'}
                      onMouseLeave={(e) => e.target.style.background = '#16a34a'}
                    >
                      Confirm Submit
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Enhanced Values Modal */}
      {showValueModal && (
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
            padding: '2rem',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ color: '#16a34a', fontWeight: 700, fontSize: '1.2rem', margin: 0 }}>
                Search and Select Values
              </h3>
              <button
                onClick={() => {
                  setShowValueModal(false);
                  setSelectedValues([]);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>


            {/* Instructions */}
            <div style={{ 
              background: '#f0f9ff', 
              border: '1px solid #bae6fd', 
              borderRadius: 8, 
              padding: '1rem', 
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              color: '#0c4a6e',
              textAlign: 'left'
            }}>
              <strong>Instructions:</strong> Instructions: Select/create one or more values from the sections below. Your selected values will appear in the panel, where you can review and edit their definitions before adding them to your case(s).
            </div>
            

            {/* Selected Values Display */}
            {selectedValues.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#374151', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Selected Values ({selectedValues.length}):
                </h4>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  padding: '12px',
                  background: '#f0fdf4',
                  borderRadius: '8px',
                  border: '1px solid #bbf7d0'
                }}>
                  {selectedValues.map((value, idx) => (
                    <div key={idx} style={{
                      background: '#16a34a',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 500
                    }}>
                      {value.value}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User Value History Section */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#374151', fontWeight: 600, marginBottom: '1rem' }}>
                Values You've Created
              </h4>
              {userValueHistory.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '12px',
                  marginBottom: '1rem'
                }}>
                  {userValueHistory
                    .filter(value => !predefinedValues.some(predefinedValue => 
                      predefinedValue.value.toLowerCase() === value.value.toLowerCase() && 
                      predefinedValue.definition === value.definition
                    ))
                    .map((value, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleValueSelection(value)}
                      style={{
                        border: selectedValues.some(v => v.value === value.value && v.definition === value.definition) 
                          ? '2px solid #16a34a' 
                          : '1.5px solid #bbf7d0',
                        borderRadius: 8,
                        padding: '12px',
                        cursor: 'pointer',
                        background: selectedValues.some(v => v.value === value.value && v.definition === value.definition) 
                          ? '#dcfce7' 
                          : '#f0fdf4',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!selectedValues.some(v => v.value === value.value && v.definition === value.definition)) {
                          e.target.style.background = '#dcfce7';
                          e.target.style.borderColor = '#16a34a';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!selectedValues.some(v => v.value === value.value && v.definition === value.definition)) {
                          e.target.style.background = '#f0fdf4';
                          e.target.style.borderColor = '#bbf7d0';
                        }
                      }}
                    >
                      <div style={{ 
                        fontWeight: 600, 
                        color: selectedValues.some(v => v.value === value.value && v.definition === value.definition) ? '#16a34a' : '#16a34a', 
                        marginBottom: '4px' 
                      }}>
                        {value.value}
                        {selectedValues.some(v => v.value === value.value && v.definition === value.definition) && (
                          <span style={{ marginLeft: '8px', fontSize: '0.8rem' }}>✓</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.4, textAlign: 'left' }}>
                        {value.definition}
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: '1rem',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  textAlign: 'center',
                  color: '#6b7280'
                }}>
                  You haven't submitted any values yet. Create your first value below!
                </div>
              )}
            </div>

            {/* Predefined Values Section */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#374151', fontWeight: 600, marginBottom: '1rem' }}>
                Predefined Values
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '12px',
                marginBottom: '1rem'
              }}>
                {predefinedValues.map((value, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleValueSelection(value)}
                    style={{
                      border: selectedValues.some(v => v.value === value.value && v.definition === value.definition) 
                        ? '2px solid #16a34a' 
                        : '1.5px solid #bbf7d0',
                      borderRadius: 8,
                      padding: '12px',
                      cursor: 'pointer',
                      background: selectedValues.some(v => v.value === value.value && v.definition === value.definition) 
                        ? '#dcfce7' 
                        : '#f0fdf4',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedValues.some(v => v.value === value.value && v.definition === value.definition)) {
                        e.target.style.background = '#dcfce7';
                        e.target.style.borderColor = '#16a34a';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedValues.some(v => v.value === value.value && v.definition === value.definition)) {
                        e.target.style.background = '#f0fdf4';
                        e.target.style.borderColor = '#bbf7d0';
                      }
                    }}
                  >
                    <div style={{ 
                      fontWeight: 600, 
                      color: selectedValues.some(v => v.value === value.value && v.definition === value.definition) ? '#16a34a' : '#16a34a', 
                      marginBottom: '4px' 
                    }}>
                      {value.value}
                      {selectedValues.some(v => v.value === value.value && v.definition === value.definition) && (
                        <span style={{ marginLeft: '8px', fontSize: '0.8rem' }}>✓</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.4, textAlign: 'left' }}>
                      {value.definition}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Create Your Own Value Button */}
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <button
                onClick={() => setShowCreateValueModal(true)}
                style={{
                  background: '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.8rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#15803d'}
                onMouseLeave={(e) => e.target.style.background = '#16a34a'}
              >
                Create Your Own Value
              </button>
            </div>

            {/* Action Buttons */}
            <div style={{ 
                  display: 'flex',
              justifyContent: 'center', 
              gap: '12px',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '1rem'
            }}>
              <button
                onClick={() => {
                  setShowValueModal(false);
                  setSelectedValues([]);
                }}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.6rem 1.2rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              {selectedValues.length > 0 && (
                <button
                  onClick={closeValueModal}
                  style={{
                    background: '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.6rem 1.2rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#15803d'}
                  onMouseLeave={(e) => e.target.style.background = '#16a34a'}
                >
                  Done ({selectedValues.length} selected)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Search Tensions Modal */}
      {showTensionModal && (
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
            padding: '2rem',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ color: '#16a34a', fontWeight: 700, fontSize: '1.2rem', margin: 0 }}>
                Search Tensions
              </h3>
              <button
                onClick={() => {
                  setShowTensionModal(false);
                  setSelectedTensions([]);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            {/* Instructions */}
            <div style={{ 
              background: '#f0f9ff', 
              border: '1px solid #bae6fd', 
              borderRadius: 8, 
              padding: '1rem', 
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              color: '#0c4a6e',
              textAlign: 'left'
            }}>
              <strong>Instructions:</strong> Instructions: Select/create one or more value tensions from the sections below. Your selected value tensions will appear in the panel, where you can review and edit their definitions before adding them to your case(s).
            </div>

            {/* Selected Tensions Display */}
            {selectedTensions.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#374151', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Selected Tensions ({selectedTensions.length}):
                </h4>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  padding: '12px',
                  background: '#f0fdf4',
                  borderRadius: '8px',
                  border: '1px solid #bbf7d0'
                }}>
                  {selectedTensions.map((tension, idx) => (
                    <div key={idx} style={{
                      background: '#16a34a',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 500
                    }}>
                      {tension.value}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Value Tensions You've Created Section */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#374151', fontWeight: 600, marginBottom: '1rem' }}>
                Value Tensions You've Created
              </h4>
              {userTensionHistory.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '12px',
                  marginBottom: '1rem'
                }}>
                  {userTensionHistory
                    .filter(tension => !predefinedTensions.some(predefinedTension => 
                      predefinedTension.value.toLowerCase() === tension.value.toLowerCase() && 
                      predefinedTension.definition === tension.definition
                    ))
                    .map((tension, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleTensionSelection(tension)}
                      style={{
                        border: selectedTensions.some(t => t.value === tension.value && t.definition === tension.definition) 
                          ? '2px solid #16a34a' 
                          : '1.5px solid #bbf7d0',
                        borderRadius: 8,
                        padding: '12px',
                        cursor: 'pointer',
                        background: selectedTensions.some(t => t.value === tension.value && t.definition === tension.definition) 
                          ? '#dcfce7' 
                          : '#f0fdf4',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!selectedTensions.some(t => t.value === tension.value && t.definition === tension.definition)) {
                          e.target.style.background = '#dcfce7';
                          e.target.style.borderColor = '#16a34a';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!selectedTensions.some(t => t.value === tension.value && t.definition === tension.definition)) {
                          e.target.style.background = '#f0fdf4';
                          e.target.style.borderColor = '#bbf7d0';
                        }
                      }}
                    >
                      <div style={{ 
                        fontWeight: 600, 
                        color: selectedTensions.some(t => t.value === tension.value && t.definition === tension.definition) ? '#16a34a' : '#16a34a', 
                        marginBottom: '4px' 
                      }}>
                        {tension.value}
                        {selectedTensions.some(t => t.value === tension.value && t.definition === tension.definition) && (
                          <span style={{ marginLeft: '8px', fontSize: '0.8rem' }}>✓</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.4, textAlign: 'left' }}>
                        {tension.definition}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: '1rem',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  textAlign: 'center',
                  color: '#6b7280'
                }}>
                  You haven't submitted any tensions yet. Create your first tension below!
                </div>
              )}
            </div>

            {/* Predefined Value Tensions Section */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#374151', fontWeight: 600, marginBottom: '1rem' }}>
                Predefined Value Tensions
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '12px',
                marginBottom: '1rem'
              }}>
                {predefinedTensions.map((tension, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleTensionSelection(tension)}
                    style={{
                      border: selectedTensions.some(t => t.value === tension.value && t.definition === tension.definition) 
                        ? '2px solid #16a34a' 
                        : '1.5px solid #bbf7d0',
                      borderRadius: 8,
                      padding: '12px',
                      cursor: 'pointer',
                      background: selectedTensions.some(t => t.value === tension.value && t.definition === tension.definition) 
                        ? '#dcfce7' 
                        : '#f0fdf4',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedTensions.some(t => t.value === tension.value && t.definition === tension.definition)) {
                        e.target.style.background = '#dcfce7';
                        e.target.style.borderColor = '#16a34a';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedTensions.some(t => t.value === tension.value && t.definition === tension.definition)) {
                        e.target.style.background = '#f0fdf4';
                        e.target.style.borderColor = '#bbf7d0';
                      }
                    }}
                  >
                    <div style={{ 
                      fontWeight: 600, 
                      color: selectedTensions.some(t => t.value === tension.value && t.definition === tension.definition) ? '#16a34a' : '#16a34a', 
                      marginBottom: '4px' 
                    }}>
                      {tension.value}
                      {selectedTensions.some(t => t.value === tension.value && t.definition === tension.definition) && (
                        <span style={{ marginLeft: '8px', fontSize: '0.8rem' }}>✓</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.4, textAlign: 'left' }}>
                      {tension.definition}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Create Your Own Value Tension Button */}
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <button
                onClick={() => setShowCreateTensionModal(true)}
                style={{
                  background: '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.8rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#15803d'}
                onMouseLeave={(e) => e.target.style.background = '#16a34a'}
              >
                Create Your Own Value Tension
              </button>
            </div>

            {/* Action Buttons */}
            <div style={{ 
              display: 'flex',
              justifyContent: 'center', 
              gap: '12px',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '1rem'
            }}>
              <button
                onClick={() => {
                  setShowTensionModal(false);
                  setSelectedTensions([]);
                }}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.6rem 1.2rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              {selectedTensions.length > 0 && (
                <button
                  onClick={closeTensionModal}
                  style={{
                    background: '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.6rem 1.2rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#15803d'}
                  onMouseLeave={(e) => e.target.style.background = '#16a34a'}
                >
                  Done ({selectedTensions.length} selected)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Case Selection Modal */}
      {showCaseSelectionModal && (
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
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                background: '#16a34a',
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
                ?
              </div>
              <h3 style={{ 
                color: '#16a34a', 
                fontWeight: 700, 
                fontSize: '1.2rem', 
                margin: 0 
              }}>
                Select Case
              </h3>
              <button
                onClick={() => setShowCaseSelectionModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280',
                  marginLeft: 'auto'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{
              color: '#374151',
              fontSize: '0.95rem',
              lineHeight: 1.5,
              marginBottom: '1.5rem'
            }}>
              Multiple cases are open. Please select which case to assign this {pendingAssignment?.type === 'value' ? 'value' : 'tension'} to:
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '1.5rem'
            }}>
              {getOpenCases().map(({ card, idx }) => (
                <button
                  key={idx}
                  onClick={() => handleCaseSelection(idx)}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#f0fdf4';
                    e.target.style.borderColor = '#16a34a';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#f8fafc';
                    e.target.style.borderColor = '#e5e7eb';
                  }}
                >
                  <div style={{ 
                    color: '#16a34a', 
                    fontWeight: 600, 
                    fontSize: '1rem',
                    marginBottom: '0.5rem'
                  }}>
                    Case {idx + 1}
                  </div>
                  <div style={{ 
                    color: '#374151', 
                    fontSize: '0.9rem',
                    lineHeight: 1.4
                  }}>
                    {card.summary || 'No theme specified'}
                  </div>
                </button>
              ))}
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setShowCaseSelectionModal(false)}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.6rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#4b5563'}
                onMouseLeave={(e) => e.target.style.background = '#6b7280'}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Your Own Value Modal */}
      {showCreateValueModal && (
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
            padding: '2rem',
            maxWidth: '500px',
            width: '90%'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ color: '#16a34a', fontWeight: 700, fontSize: '1.2rem', margin: 0 }}>
                {(editingValueIndex >= 0 || editingSelectedValueIndex >= 0) ? 'Edit Value' : 'Create Your Own Value'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateValueModal(false);
                  setNewValue({ value: '', definition: '' });
                  setEditingValueIndex(-1);
                  setEditingSelectedValueIndex(-1);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                color: '#374151', 
                fontWeight: 600, 
                marginBottom: '0.5rem',
                fontSize: '0.9rem'
              }}>
                Value Name *
              </label>
                <input
                  type="text"
                value={newValue.value}
                onChange={(e) => setNewValue(prev => ({ ...prev, value: e.target.value }))}
                placeholder="e.g., Inclusivity, Privacy, Trust"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                color: '#374151', 
                fontWeight: 600, 
                marginBottom: '0.5rem',
                fontSize: '0.9rem'
              }}>
                Definition *
              </label>
                <textarea
                value={newValue.definition}
                onChange={(e) => setNewValue(prev => ({ ...prev, definition: e.target.value }))}
                placeholder="Describe what this value means in the context of AI systems..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
                onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
                </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '12px'
            }}>
              <button
                onClick={() => {
                  setShowCreateValueModal(false);
                  setNewValue({ value: '', definition: '' });
                  setEditingValueIndex(-1);
                  setEditingSelectedValueIndex(-1);
                }}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.6rem 1.2rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateValue}
                disabled={!newValue.value.trim() || !newValue.definition.trim()}
                style={{
                  background: !newValue.value.trim() || !newValue.definition.trim() ? '#9ca3af' : '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.6rem 1.2rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: !newValue.value.trim() || !newValue.definition.trim() ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (newValue.value.trim() && newValue.definition.trim()) {
                    e.target.style.background = '#15803d';
                  }
                }}
                onMouseLeave={(e) => {
                  if (newValue.value.trim() && newValue.definition.trim()) {
                    e.target.style.background = '#16a34a';
                  }
                }}
              >
                {(editingValueIndex >= 0 || editingSelectedValueIndex >= 0) ? 'Update Value' : 'Create Value'}
              </button>
            </div>
          </div>
        </div>
      )}

            {/* Custom Error/Confirmation Modal */}
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
                background: (deletingValueIndex >= 0 || deletingTensionIndex >= 0) ? '#f59e0b' : '#dc2626',
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
                {(deletingValueIndex >= 0 || deletingTensionIndex >= 0) ? '?' : '!'}
              </div>
              <h3 style={{ 
                color: (deletingValueIndex >= 0 || deletingTensionIndex >= 0) ? '#f59e0b' : '#dc2626', 
                fontWeight: 700, 
                fontSize: '1.1rem', 
                margin: 0 
              }}>
                {(deletingValueIndex >= 0 || deletingTensionIndex >= 0) ? 'Confirm Delete' : 'Error'}
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
              justifyContent: 'center',
              gap: '12px'
            }}>
              {(deletingValueIndex >= 0 || deletingTensionIndex >= 0) && (
                <button
                  onClick={() => {
                    setShowErrorModal(false);
                    setDeletingValueIndex(-1);
                    setDeletingTensionIndex(-1);
                  }}
                  style={{
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.6rem 1.5rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#4b5563'}
                  onMouseLeave={(e) => e.target.style.background = '#6b7280'}
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => {
                  if (deletingValueIndex >= 0) {
                    // Handle value delete confirmation
                    setValueCards(prev => prev.filter((_, i) => i !== deletingValueIndex));
                    setDeletingValueIndex(-1);
                  } else if (deletingTensionIndex >= 0) {
                    // Handle tension delete confirmation
                    setTensionCards(prev => prev.filter((_, i) => i !== deletingTensionIndex));
                    setDeletingTensionIndex(-1);
                  }
                  setShowErrorModal(false);
                }}
                style={{
                  background: (deletingValueIndex >= 0 || deletingTensionIndex >= 0) ? '#dc2626' : '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.6rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = (deletingValueIndex >= 0 || deletingTensionIndex >= 0) ? '#b91c1c' : '#b91c1c'}
                onMouseLeave={(e) => e.target.style.background = (deletingValueIndex >= 0 || deletingTensionIndex >= 0) ? '#dc2626' : '#dc2626'}
              >
                {(deletingValueIndex >= 0 || deletingTensionIndex >= 0) ? 'Delete' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Validation Required Modal */}
      {showValidationModal && (
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
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1.5rem'
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
                ✓
              </div>
              <h3 style={{ 
                color: '#dc2626', 
                fontWeight: 700, 
                fontSize: '1.2rem', 
                margin: 0 
              }}>
                Validation Required
              </h3>
              <button
                onClick={() => setShowValidationModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280',
                  marginLeft: 'auto'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{
              color: '#374151',
              fontSize: '0.95rem',
              lineHeight: 1.5,
              marginBottom: '1.5rem'
            }}>
              Please complete all required fields before creating a new case.
            </div>
            
            <div style={{
              color: '#374151',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
              whiteSpace: 'pre-line',
              background: '#fef2f2',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #fecaca'
            }}>
              {errorMessage}
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setShowValidationModal(false)}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.8rem 2rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#b91c1c'}
                onMouseLeave={(e) => e.target.style.background = '#dc2626'}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Your Own Value Tension Modal */}
      {showCreateTensionModal && (
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
            padding: '2rem',
            maxWidth: '500px',
            width: '90%'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ color: '#16a34a', fontWeight: 700, fontSize: '1.2rem', margin: 0 }}>
                {(editingTensionIndex >= 0 || editingSelectedTensionIndex >= 0) ? 'Edit Tension' : 'Create Your Own Value Tension'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateTensionModal(false);
                  setNewTension({ value: '', definition: '' });
                  setEditingTensionIndex(-1);
                  setEditingSelectedTensionIndex(-1);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                color: '#374151', 
                fontWeight: 600, 
                marginBottom: '0.5rem',
                fontSize: '0.9rem'
              }}>
                Tension Name *
              </label>
              <input
                type="text"
                value={newTension.value}
                onChange={(e) => setNewTension(prev => ({ ...prev, value: e.target.value }))}
                placeholder="e.g., Privacy vs. Transparency, Accuracy vs. Fairness"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                color: '#374151', 
                fontWeight: 600, 
                marginBottom: '0.5rem',
                fontSize: '0.9rem'
              }}>
                Definition *
              </label>
              <textarea
                value={newTension.definition}
                onChange={(e) => setNewTension(prev => ({ ...prev, definition: e.target.value }))}
                placeholder="Describe the trade-off or conflict between different values or goals..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
                onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '12px'
            }}>
              <button
                onClick={() => {
                  setShowCreateTensionModal(false);
                  setNewTension({ value: '', definition: '' });
                  setEditingTensionIndex(-1);
                  setEditingSelectedTensionIndex(-1);
                }}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.6rem 1.2rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTension}
                disabled={!newTension.value.trim() || !newTension.definition.trim()}
                style={{
                  background: !newTension.value.trim() || !newTension.definition.trim() ? '#9ca3af' : '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.6rem 1.2rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: !newTension.value.trim() || !newTension.definition.trim() ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (newTension.value.trim() && newTension.definition.trim()) {
                    e.target.style.background = '#15803d';
                  }
                }}
                onMouseLeave={(e) => {
                  if (newTension.value.trim() && newTension.definition.trim()) {
                    e.target.style.background = '#16a34a';
                  }
                }}
              >
                {(editingTensionIndex >= 0 || editingSelectedTensionIndex >= 0) ? 'Update Tension' : 'Create Tension'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseContributionForm; 