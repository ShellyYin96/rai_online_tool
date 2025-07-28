import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ValueCard from './ValueCard';
import CaseContributionForm from './CaseContributionForm';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import ErrorModal from './ErrorModal';
import { predefinedValues, predefinedTensions } from '../data/valuesAndTensions';

const exampleCases = [
  { id: 'classroom', title: 'Classroom Management', content: 'Scenario: Using AI to assist with classroom management, such as monitoring student engagement, automating attendance, or flagging disruptions.' },
  { id: 'assessment', title: 'Assessment', content: 'Scenario: Leveraging AI for student assessment, including automated grading, personalized feedback, or detecting academic dishonesty.' },
  { id: 'learning', title: 'Learning', content: 'Scenario: AI-powered personalized learning, adaptive content delivery, or intelligent tutoring systems to support student learning.' },
  { id: 'custom', title: 'Create Your Own', content: 'Create your own scenario and will in the concept card fields.' },
];

// Scenario-specific Concept Card templates
const conceptCardTemplates = {
  "Classroom Management": {
    title: "AI for Classroom Management: Using AI to assist with classroom management, such as monitoring student engagement, automating attendance, or flagging disruptions.",
    description: "This case explores the use of AI-powered tools to help teachers manage classrooms more efficiently, including real-time engagement tracking, automated attendance, and early warning for disruptions. The goal is to support teachers while ensuring student privacy and fairness.",
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
  },
  "Assessment": {
    title: "AI for Student Assessment: Leveraging AI for student assessment, including automated grading, personalized feedback, or detecting academic dishonesty.",
    description: "This case examines AI systems that evaluate student work, provide detailed feedback, and identify potential academic integrity issues. The system aims to reduce teacher workload while maintaining assessment quality and fairness across diverse student populations.",
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
  },
  "Learning": {
    title: "AI for Personalized Learning: AI-powered personalized learning, adaptive content delivery, or intelligent tutoring systems to support student learning.",
    description: "This case explores AI systems that adapt educational content and pacing to individual student needs, providing personalized learning pathways and intelligent tutoring support. The goal is to optimize learning outcomes while ensuring equitable access and preventing algorithmic bias.",
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
};

const initialValueCards = [];
const initialTensionCards = [];

const ItemTypes = { VALUE: 'value' };

function DraggableValueCard({ card, onDelete, onEdit, onClick }) {
  const [shaking, setShaking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(card.value);
  const [editDef, setEditDef] = useState(card.definition);

  if (isEditing) {
    return (
      <div
        className={shaking ? 'shake' : ''}
        style={{
          background: '#fff',
          borderRadius: 8,
          border: '1px solid #d1d5db',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '12px',
          minWidth: 0,
          maxWidth: 350,
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          position: 'relative',
        }}
        onClick={onClick}
      >
        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4, zIndex: 2 }}>
          <button
            className="icon-btn save-btn"
            style={{ width: 22, height: 22, background: 'none', border: 'none', color: '#16a34a', fontSize: 15, cursor: 'pointer', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 2 }}
            title="Save"
            onClick={e => { e.stopPropagation(); setIsEditing(false); if (onEdit) onEdit(editValue, editDef); }}
          >
            <i className="fas fa-check"></i>
          </button>
          <button
            className="icon-btn cancel-btn"
            style={{ width: 22, height: 22, background: 'none', border: 'none', color: '#bbb', fontSize: 15, cursor: 'pointer', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Cancel"
            onClick={e => { e.stopPropagation(); setIsEditing(false); setEditValue(card.value); setEditDef(card.definition); }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <input
          type="text"
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          style={{ width: '100%', fontWeight: 600, fontSize: '0.9rem', borderRadius: 8, padding: '0.5rem', marginBottom: 6, border: '1px solid #d1d5db' }}
        />
        <textarea
          value={editDef}
          onChange={e => setEditDef(e.target.value)}
          rows={2}
          style={{ width: '100%', fontSize: '0.85rem', fontWeight: 500, borderRadius: 8, border: '1px solid #d1d5db', lineHeight: 1.4 }}
        />
      </div>
    );
  }

  return (
    <div
      className={shaking ? 'shake' : ''}
      style={{
        cursor: 'pointer',
        background: '#fff',
        borderRadius: 8,
        border: '1px solid #d1d5db',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '12px',
        minWidth: 0,
        maxWidth: 240,
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        position: 'relative',
        transition: 'all 0.2s',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.target.style.background = '#f9fafb';
        e.target.style.borderColor = '#16a34a';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = '#fff';
        e.target.style.borderColor = '#d1d5db';
      }}
    >
      <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.25rem', zIndex: 2 }}>
        <button
          className="icon-btn edit-btn"
          style={{ 
            background: '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            cursor: 'pointer'
          }}
          title="Edit"
          onClick={e => { e.stopPropagation(); setIsEditing(true); }}
        >
          Edit
        </button>
        <button
          className="icon-btn delete-btn"
          style={{ 
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            cursor: 'pointer'
          }}
          title="Delete"
          onClick={e => {
            e.stopPropagation();
            if (onDelete) onDelete();
          }}
          onMouseEnter={() => setShaking(true)}
          onMouseLeave={() => setShaking(false)}
        >
          Delete
        </button>
      </div>
      <div style={{ 
        fontWeight: 600, 
          color: '#16a34a',
        marginBottom: '4px',
        fontSize: '0.9rem'
      }}>
        {card.value}
      </div>
      <div style={{ 
        fontSize: '0.85rem', 
        color: '#374151', 
        lineHeight: 1.4, 
        textAlign: 'left' 
      }}>
        {card.definition}
      </div>
    </div>
  );
}

function DropValueArea({ values, onDrop, onRemove }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.VALUE,
    drop: (item) => onDrop(item),
    collect: monitor => ({ isOver: monitor.isOver() })
  }), [onDrop]);
  return (
    <div ref={drop} style={{ width: '100%', minHeight: 36, background: isOver ? '#d1fae5' : '#f3f4f6', borderRadius: 8, border: '1.5px dashed #bbf7d0', padding: '0.5rem', marginBottom: 6, marginTop: 2 }}>
      <div style={{ color: '#4f46e5', fontWeight: 500, fontSize: '0.98em', marginBottom: 2 }}>Values/Tensions:</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {values.map((v, i) => (
          <span key={i} style={{ background: 'linear-gradient(135deg, #22c55e 0%, #bbf7d0 100%)', color: '#fff', borderRadius: 16, padding: '0.2rem 0.8rem', fontWeight: 600, fontSize: '0.98em', display: 'flex', alignItems: 'center' }}>
            {v.value}
            <button onClick={() => onRemove(i)} style={{ marginLeft: 6, background: 'none', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '1.1em' }} title="Remove">×</button>
          </span>
        ))}
      </div>
      <div style={{ color: '#888', fontSize: '0.97em', marginTop: 4 }}>(Drag value/tension cards here)</div>
    </div>
  );
}

// Add DraggableTensionCard for tension cards
function DraggableTensionCard({ card, onDelete, onEdit, onClick }) {
  const [shaking, setShaking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(card.value);
  const [editDef, setEditDef] = useState(card.definition);

  if (isEditing) {
    return (
      <div
        className={shaking ? 'shake' : ''}
        style={{
          background: '#fff',
          borderRadius: 8,
          border: '1px solid #d1d5db',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '12px',
          minWidth: 0,
          maxWidth: 350,
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          position: 'relative',
        }}
        onClick={onClick}
      >
        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4, zIndex: 2 }}>
          <button
            className="icon-btn save-btn"
            style={{ width: 22, height: 22, background: 'none', border: 'none', color: '#16a34a', fontSize: 15, cursor: 'pointer', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 2 }}
            title="Save"
            onClick={e => { e.stopPropagation(); setIsEditing(false); if (onEdit) onEdit(editValue, editDef); }}
          >
            <i className="fas fa-check"></i>
          </button>
          <button
            className="icon-btn cancel-btn"
            style={{ width: 22, height: 22, background: 'none', border: 'none', color: '#bbb', fontSize: 15, cursor: 'pointer', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Cancel"
            onClick={e => { e.stopPropagation(); setIsEditing(false); setEditValue(card.value); setEditDef(card.definition); }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <input
          type="text"
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          style={{ width: '100%', fontWeight: 600, fontSize: '0.9rem', borderRadius: 8, padding: '0.5rem', marginBottom: 6, border: '1px solid #d1d5db' }}
        />
        <textarea
          value={editDef}
          onChange={e => setEditDef(e.target.value)}
          rows={2}
          style={{ width: '100%', fontSize: '0.85rem', fontWeight: 500, borderRadius: 8, border: '1px solid #d1d5db', lineHeight: 1.4 }}
        />
      </div>
    );
  }

  return (
    <div
      className={shaking ? 'shake' : ''}
      style={{
        cursor: 'pointer',
        background: '#fff',
        borderRadius: 8,
        border: '1px solid #d1d5db',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '12px',
        minWidth: 0,
        maxWidth: 350,
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        position: 'relative',
        transition: 'all 0.2s',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.target.style.background = '#f9fafb';
        e.target.style.borderColor = '#16a34a';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = '#fff';
        e.target.style.borderColor = '#d1d5db';
      }}
    >
      <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.25rem', zIndex: 2 }}>
        <button
          className="icon-btn edit-btn"
          style={{ 
            background: '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            cursor: 'pointer'
          }}
          title="Edit"
          onClick={e => { e.stopPropagation(); setIsEditing(true); }}
        >
          Edit
        </button>
        <button
          className="icon-btn delete-btn"
          style={{ 
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            cursor: 'pointer'
          }}
          title="Delete"
          onClick={e => {
            e.stopPropagation();
            if (onDelete) onDelete();
          }}
          onMouseEnter={() => setShaking(true)}
          onMouseLeave={() => setShaking(false)}
        >
          Delete
        </button>
      </div>
      <div style={{ 
        fontWeight: 600, 
          color: '#16a34a',
        marginBottom: '4px',
        fontSize: '0.9rem'
      }}>
        {card.value}
      </div>
      <div style={{ 
        fontSize: '0.85rem', 
        color: '#374151', 
        lineHeight: 1.4, 
        textAlign: 'left' 
      }}>
        {card.definition}
      </div>
    </div>
  );
}

// Helper for new case card
const createEmptyCaseCard = () => ({
  summary: '',
  subject: '',
  grade: '',
  date: '',
  caseText: '',
  values: [],
  tensions: []
});

function CaseCardValueDropArea({ values, onDrop, onRemove }) {
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.VALUE,
    drop: (item) => onDrop(item),
    collect: monitor => ({ isOver: monitor.isOver() })
  });
  return (
    <div ref={drop} style={{ minHeight: 48, background: '#f1f5f9', border: '1.5px dashed #bbf7d0', borderRadius: 8, padding: '0.5em', marginTop: 2 }}>
      {values.length === 0 && <span style={{ color: '#bbb', fontStyle: 'italic' }}>No values assigned. Click a value card to add.</span>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {values.map((v, vi) => (
          <span key={v.value} style={{ background: 'linear-gradient(135deg, #22c55e 0%, #bbf7d0 100%)', color: '#fff', borderRadius: 16, padding: '0.2rem 0.8rem', fontWeight: 600, fontSize: '0.98em', display: 'flex', alignItems: 'center' }}>
            {v.value}
            <button onClick={() => onRemove(vi)} style={{ marginLeft: 6, background: 'none', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '1.1em' }} title="Remove">×</button>
          </span>
        ))}
      </div>
    </div>
  );
}

function CaseCardTensionDropArea({ tensions, onDrop, onRemove }) {
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.VALUE,
    drop: (item) => onDrop(item),
    collect: monitor => ({ isOver: monitor.isOver() })
  });
  return (
    <div ref={drop} style={{ minHeight: 48, background: '#f1f5f9', border: '1.5px dashed #bbf7d0', borderRadius: 8, padding: '0.5em', marginTop: 2 }}>
      {tensions.length === 0 && <span style={{ color: '#bbb', fontStyle: 'italic' }}>No tensions assigned. Click a tension card to add.</span>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {tensions.map((t, ti) => (
          <span key={t.value} style={{ background: 'linear-gradient(135deg, #f59e42 0%, #fef08a 100%)', color: '#b45309', borderRadius: 16, padding: '0.2rem 0.8rem', fontWeight: 600, fontSize: '0.98em', display: 'flex', alignItems: 'center' }}>
            {t.value}
            <button onClick={() => onRemove(ti)} style={{ marginLeft: 6, background: 'none', border: 'none', color: '#b45309', fontWeight: 700, cursor: 'pointer', fontSize: '1.1em' }} title="Remove">×</button>
          </span>
        ))}
      </div>
    </div>
  );
}

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

const FocusGroupPage = () => {
  const [phase, setPhase] = useState(1); // 1, 2, 3
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const [noteBoards, setNoteBoards] = useState([
    { notes: '', values: [], comments: '' },
    { notes: '', values: [], comments: '' },
    { notes: '', values: [], comments: '' },
  ]);
  const [valueCards, setValueCards] = useState(initialValueCards);
  const [tensionCards, setTensionCards] = useState(initialTensionCards);
  const [showContributionForm, setShowContributionForm] = useState(false);
  const [groupSubs, setGroupSubs] = useState([]);
  const [showGroupSubs, setShowGroupSubs] = useState(false);
  const navigate = useNavigate();
  const { groupName } = useParams();
  const [showCaseCards, setShowCaseCards] = useState(false);
  const [caseCards, setCaseCards] = useState([createEmptyCaseCard()]);
  // Change from array to single index for accordion style
  const [expandedCaseIdx, setExpandedCaseIdx] = useState(0); // Only one case can be expanded at a time
  const [savedCases, setSavedCases] = useState([]); // track which cases have been saved (for visual feedback)
  const [showValueCards, setShowValueCards] = useState(false);
  // Add state for error messages at the top of FocusGroupPage:
  const [caseErrors, setCaseErrors] = useState({});
  // Add state for click-to-add error messages
  const [clickToAddError, setClickToAddError] = useState('');
  // Add state for error modal
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  
  // Helper to get the open case index (or -1 if none)
  const getOpenCaseIdx = () => {
    // Check if there are any cases and if the expanded case index is valid
    if (caseCards.length === 0) {
      console.log('getOpenCaseIdx: No cases available');
      return -1;
    }
    
    const result = (typeof expandedCaseIdx === 'number' && expandedCaseIdx >= 0 && expandedCaseIdx < caseCards.length ? expandedCaseIdx : -1);
    console.log('getOpenCaseIdx:', result, 'expandedCaseIdx:', expandedCaseIdx, 'caseCards.length:', caseCards.length);
    return result;
  };

  // Click handler for value cards
  const handleClickValueCard = (card) => {
    console.log('Value card clicked:', card.value);
    setClickToAddError('');
    const openIdx = getOpenCaseIdx();
    if (openIdx === -1) {
      setErrorModal({ isOpen: true, message: 'Please open a case in "The Collection of Cases" section before assigning a value. Click on a case to expand it, then you can assign values and tensions to that specific case.' });
      return;
    }
    console.log('Assigning value to case index:', openIdx);
    setCaseCards(cards => {
      const updatedCards = cards.map((c, i) => {
        if (i === openIdx) {
          const alreadyHasValue = c.values.some(v => v.value === card.value);
          if (alreadyHasValue) {
            console.log('Value already exists in case, not adding duplicate');
            return c;
          } else {
            console.log('Adding value to case:', card.value);
            return { ...c, values: [...c.values, { value: card.value, definition: card.definition }] };
          }
        }
        return c;
      });
      console.log('Updated case cards:', updatedCards);
      return updatedCards;
    });
  };

  // Click handler for tension cards
  const handleClickTensionCard = (card) => {
    console.log('Tension card clicked:', card.value);
    setClickToAddError('');
    const openIdx = getOpenCaseIdx();
    if (openIdx === -1) {
      setErrorModal({ isOpen: true, message: 'Please open a case in "The Collection of Cases" section before assigning a tension. Click on a case to expand it, then you can assign values and tensions to that specific case.' });
      return;
    }
    console.log('Assigning tension to case index:', openIdx);
    setCaseCards(cards => {
      const updatedCards = cards.map((c, i) => {
        if (i === openIdx) {
          const alreadyHasTension = c.tensions.some(t => t.value === card.value);
          if (alreadyHasTension) {
            console.log('Tension already exists in case, not adding duplicate');
            return c;
          } else {
            console.log('Adding tension to case:', card.value);
            return { ...c, tensions: [...c.tensions, { value: card.value, definition: card.definition }] };
          }
        }
        return c;
      });
      console.log('Updated case cards:', updatedCards);
      return updatedCards;
    });
  };

  // Function to close error modal
  const closeErrorModal = () => {
    setErrorModal({ isOpen: false, message: '' });
  };
  
  // ... at the top of FocusGroupPage component, add:
  const { user } = useAuth();
  const [saveAllError, setSaveAllError] = useState('');
  const [saveAllSuccess, setSaveAllSuccess] = useState(false);
  const [submissionCompleted, setSubmissionCompleted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  // Add state for custom concept card
  const [customConceptCard, setCustomConceptCard] = useState({
    title: '',
    description: '',
    payer: '',
    endUser: '',
    servicingParty: '',
    impactedIndividuals: '',
    doAct: '',
    inferReason: '',
    data1: '',
    data2: '',
    data3: '',
    data4: ''
  });

  // New state for Value Cards and Tension Cards features
  const [showValueModal, setShowValueModal] = useState(false);
  const [showTensionModal, setShowTensionModal] = useState(false);
  const [showQA, setShowQA] = useState(false);
  
  // State for custom values and tensions
  const [userValueHistory, setUserValueHistory] = useState([]);
  const [userTensionHistory, setUserTensionHistory] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [selectedTensions, setSelectedTensions] = useState([]);
  
  // State for create modals
  const [showCreateValueModal, setShowCreateValueModal] = useState(false);
  const [showCreateTensionModal, setShowCreateTensionModal] = useState(false);
  const [newValue, setNewValue] = useState({ value: '', definition: '' });
  const [newTension, setNewTension] = useState({ value: '', definition: '' });
  const [editingValueIndex, setEditingValueIndex] = useState(-1);
  const [editingTensionIndex, setEditingTensionIndex] = useState(-1);
  const [editingSelectedValueIndex, setEditingSelectedValueIndex] = useState(-1);
  const [editingSelectedTensionIndex, setEditingSelectedTensionIndex] = useState(-1);

  // State for example modal
  const [showExampleModal, setShowExampleModal] = useState(false);
  
  // State for adding new value and tension cards
  const [showAddValue, setShowAddValue] = useState(false);
  const [showAddTension, setShowAddTension] = useState(false);
  const [newValueDef, setNewValueDef] = useState('');
  const [newTensionDef, setNewTensionDef] = useState('');
  
  console.log('FocusGroupPage component rendering, showExampleModal:', showExampleModal);
  
  // Example cases for different AI applications
  const exampleCaseData = {
    "Classroom Management": {
      summary: "AI engagement monitoring system flags student with ADHD as 'disengaged', raising concerns about equitable assessment and student privacy",
      subject: "Language Arts",
      grade: "6th Grade",
      date: "2025-03-15",
      impactedPop: "Students with IEPs (e.g., ADHD)",
      caseText: "During a Language Arts class, I received an alert from the AI system indicating that one of my students appeared disengaged, based on reduced participation and limited eye contact. The system suggested that I step in and offer support. However, I knew this student had an IEP related to ADHD, and their engagement often looks different from what the AI was trained to detect. Instead of calling attention to the student in front of the class, I quietly made a note of the alert and observed their behavior throughout the lesson. The student was actually following along—just in their own way. Later, I documented my observations and followed up privately. This experience made me reflect on how the AI system's indicators might not account for neurodiverse learning profiles. I raised the concern with our IT team, advocating for adjustments that would better support all learners without making assumptions. It's a reminder that while these tools can be helpful, they need to be flexible enough to respect student privacy and the varied ways students show engagement.",
      values: [
        { value: "Fairness", definition: "Ensuring that all students are treated equitably, with consideration for individual differences and needs" },
        { value: "Student Privacy", definition: "Protecting students' personal information and dignity" },
        { value: "Professional Judgment", definition: "Teachers' expertise in making informed decisions about student needs" },
        { value: "Inclusion", definition: "Supporting diverse learners and creating accessible learning environments" }
      ],
      tensions: [
        { value: "Student Privacy vs. Inclusion", definition: "Creating inclusive environments may require sharing student needs with systems or staff, but doing so could compromise personal privacy or reveal sensitive information." },
      ]
    },
    "Assessment": {
      summary: "AI grading flagged multilingual students unfairly",
      subject: "English Language Arts",
      grade: "9th Grade",
      date: "2024-10-12",
      impactedPop: "Multilingual students / English learners (ELs)",
      caseText: "I used an AI system to help grade essays in my 9th-grade English Language Arts class. While the tool initially seemed helpful in reducing my grading time, I started noticing a pattern: several of my multilingual students were consistently receiving lower scores and disproportionately flagged feedback, especially related to grammar and sentence structure. These students are thoughtful and capable writers, even if their grammar doesn't always align with standard academic English. I reviewed their work more closely and found that the AI was often prioritizing surface-level correctness over the strength of their ideas or argument structure. Rather than accepting the scores as-is, I re-evaluated the essays myself and adjusted the grades based on my rubric and knowledge of each student's growth. I also brought this issue to our department meeting, where we discussed the risk of algorithmic bias and the importance of teacher oversight in AI-assisted grading. This experience reminded me that AI can be a helpful tool, but it shouldn't replace professional judgment—especially when it comes to supporting equity and inclusion for our diverse learners.",
      values: [
        { value: "Fairness", definition: "Ensuring equitable treatment and opportunities for all students" },
        { value: "Performance", definition: "Evaluating student work based on demonstrated abilities and growth" },
        { value: "Consistency", definition: "Applying uniform standards across all student assessments" },
        { value: "Equity", definition: "Providing fair opportunities and support for diverse learners" }
      ],
      tensions: [
        { value: "Fairness vs. Performance", definition: "Balancing standardized evaluation with individual student capabilities and growth" },
        { value: "Consistency vs. Equity", definition: "Uniform grading standards versus accommodating diverse learning needs and backgrounds" }
      ]
    },
    "Learning": {
      summary: "Adjusted AI-recommended pathway for a student with ADHD to better support engagement",
      subject: "Mathematics",
      grade: "7th Grade",
      date: "2025-02-26",
      impactedPop: "Students with learning differences (e.g., ADHD)",
      caseText: "In my 7th-grade math class, I used an AI-powered personalized learning platform that adapts content based on each student's performance and engagement data. One of my students, who has ADHD, was frequently redirected by the system to repeat earlier modules due to inconsistent focus and accuracy. The student grew frustrated and disengaged, even though I knew they understood the material conceptually. After reviewing their interaction logs and speaking with the student, I realized that the AI was mistaking attentional slips for true knowledge gaps. I manually adjusted the student's learning path to provide more variety and forward movement, with built-in breaks and review options. This small change re-engaged the student and gave them a sense of progress. It also reminded me how important teacher oversight is, even with intelligent systems. Personalization needs to be flexible, especially for students with different learning styles and needs.",
      values: [
        { value: "Consistency", definition: "Maintaining uniform standards and approaches across learning systems" },
        { value: "Flexibility", definition: "Adapting to individual student needs and learning differences" },
        { value: "Professional Judgment", definition: "Teachers' expertise in making informed decisions about student needs" },
        { value: "Automation", definition: "Using AI systems to streamline and enhance educational processes" }
      ],
      tensions: [
        { value: "Automation vs. Professional Judgment", definition: "AI-driven recommendations versus teacher expertise in understanding student needs" },
        { value: "Consistency vs. Flexibility", definition: "Applying the same algorithmic logic to every student did not meet the needs of neurodiverse learners" }
      ]
    }
  };

  // Get the current example case based on selected AI application
  const getCurrentExampleCase = () => {
    const selectedCase = exampleCases[selectedCaseIdx];
    if (!selectedCase || selectedCase.title === 'Create Your Own') {
      return null; // No example for "Create Your Own"
    }
    return exampleCaseData[selectedCase.title] || null;
  };

  const exampleCase = getCurrentExampleCase();

  // Use groupName from URL as the group identifier

  // Handler for note board text change
  const handleNoteChange = (idx, text) => {
    setNoteBoards(boards => boards.map((b, i) => i === idx ? { ...b, notes: text } : b));
  };

  // Handler for value drop
  const handleDropValue = (idx, card) => {
    setNoteBoards(boards => boards.map((b, i) => i === idx ? { ...b, values: [...b.values, card] } : b));
  };
  // Handler for value remove
  const handleRemoveValue = (idx, valueIdx) => {
    setNoteBoards(boards => boards.map((b, i) => i === idx ? { ...b, values: b.values.filter((_, j) => j !== valueIdx) } : b));
  };

  // Handler for comments change
  const handleCommentChange = (idx, text) => {
    setNoteBoards(boards => boards.map((b, i) => i === idx ? { ...b, comments: text } : b));
  };



  // Helper functions for Value Cards and Tension Cards features
  const handleValueSelection = (value) => {
    setSelectedValues(prev => {
      const exists = prev.some(v => v.value === value.value && v.definition === value.definition);
      if (exists) {
        return prev.filter(v => !(v.value === value.value && v.definition === value.definition));
      } else {
        return [...prev, value];
      }
    });
  };

  const handleTensionSelection = (tension) => {
    setSelectedTensions(prev => {
      const exists = prev.some(t => t.value === tension.value && t.definition === tension.definition);
      if (exists) {
        return prev.filter(t => !(t.value === tension.value && t.definition === tension.definition));
      } else {
        return [...prev, tension];
      }
    });
  };

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
      
      if (editingValueIndex >= 0) {
        // Editing an existing value in user history
        setUserValueHistory(prev => prev.map((value, idx) => 
          idx === editingValueIndex ? updatedValue : value
        ));
        setEditingValueIndex(-1);
      } else if (editingSelectedValueIndex >= 0) {
        // Editing a selected value
        console.log('Updating selected value at index:', editingSelectedValueIndex);
        console.log('Updated value:', updatedValue);
        setSelectedValues(prev => {
          console.log('Previous selectedValues:', prev);
          const newSelectedValues = prev.map((value, idx) => 
            idx === editingSelectedValueIndex ? updatedValue : value
          );
          console.log('New selectedValues:', newSelectedValues);
          return newSelectedValues;
        });
        setEditingSelectedValueIndex(-1);
      } else {
        // Adding a new value to user history
        setUserValueHistory(prev => [...prev, updatedValue]);
      }
      
      // Reset form
      setNewValue({ value: '', definition: '' });
      setShowCreateValueModal(false);
    }
  };

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
      
      if (editingTensionIndex >= 0) {
        // Editing an existing tension in user history
        setUserTensionHistory(prev => prev.map((tension, idx) => 
          idx === editingTensionIndex ? updatedTension : tension
        ));
        setEditingTensionIndex(-1);
      } else if (editingSelectedTensionIndex >= 0) {
        // Editing a selected tension
        setSelectedTensions(prev => prev.map((tension, idx) => 
          idx === editingSelectedTensionIndex ? updatedTension : tension
        ));
        setEditingSelectedTensionIndex(-1);
      } else {
        // Adding a new tension to user history
        setUserTensionHistory(prev => [...prev, updatedTension]);
      }
      
      // Reset form
      setNewTension({ value: '', definition: '' });
      setShowCreateTensionModal(false);
    }
  };

  const handleApplyValuesToPool = () => {
    // Add selected values to the value pool
    const newValues = selectedValues.filter(selectedValue => 
      !valueCards.some(existingValue => 
        existingValue.value.toLowerCase() === selectedValue.value.toLowerCase()
      )
    );
    
    if (newValues.length > 0) {
      setValueCards(prev => [...prev, ...newValues]);
    }
    
    // Clear selections and close modal
    setSelectedValues([]);
    setShowValueModal(false);
  };

  const handleApplyTensionsToPool = () => {
    // Add selected tensions to the tension pool
    const newTensions = selectedTensions.filter(selectedTension => 
      !tensionCards.some(existingTension => 
        existingTension.value.toLowerCase() === selectedTension.value.toLowerCase()
      )
    );
    
    if (newTensions.length > 0) {
      setTensionCards(prev => [...prev, ...newTensions]);
    }
    
    // Clear selections and close modal
    setSelectedTensions([]);
    setShowTensionModal(false);
  };

  const handleEditValue = (index) => {
    const value = userValueHistory[index];
    setNewValue({ value: value.value, definition: value.definition });
    setEditingValueIndex(index);
    setShowCreateValueModal(true);
  };

  const handleEditTension = (index) => {
    const tension = userTensionHistory[index];
    setNewTension({ value: tension.value, definition: tension.definition });
    setEditingTensionIndex(index);
    setShowCreateTensionModal(true);
  };

  const handleDeleteValue = (index) => {
    setUserValueHistory(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleDeleteTension = (index) => {
    setUserTensionHistory(prev => prev.filter((_, idx) => idx !== index));
  };

  // Edit handlers for value and tension cards in the pools
  const handleEditValueCard = (index, newValue, newDefinition) => {
    setValueCards(cards => cards.map((card, i) => 
      i === index ? { ...card, value: newValue, definition: newDefinition } : card
    ));
  };

  const handleEditTensionCard = (index, newValue, newDefinition) => {
    setTensionCards(cards => cards.map((card, i) => 
      i === index ? { ...card, value: newValue, definition: newDefinition } : card
    ));
  };

  // Fetch user's value and tension history
  const fetchUserValueHistory = async () => {
    if (!user || !user.email) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/user-value-history/${encodeURIComponent(user.email)}`);
      const result = await response.json();
      
      if (result.success) {
        setUserValueHistory(result.data);
      }
    } catch (error) {
      console.error('Error fetching user value history:', error);
      // Fallback to empty array if API fails
      setUserValueHistory([]);
    }
  };

  const fetchUserTensionHistory = async () => {
    if (!user || !user.email) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/user-tension-history/${encodeURIComponent(user.email)}`);
      const result = await response.json();
      
      if (result.success) {
        setUserTensionHistory(result.data);
      }
    } catch (error) {
      console.error('Error fetching user tension history:', error);
      // Fallback to empty array if API fails
      setUserTensionHistory([]);
    }
  };

  // Fetch group submissions from backend
  const fetchGroupSubs = async () => {
    setShowGroupSubs(true);
    const res = await fetch(`/api/group-submissions?group=${encodeURIComponent(groupName)}`);
    if (!res.ok) {
      setGroupSubs([]);
      return;
    }
    const data = await res.json();
    setGroupSubs(data.data || []);
  };

  // Fetch user history when component mounts
  useEffect(() => {
    fetchUserValueHistory();
    fetchUserTensionHistory();
  }, [user]);

  // Debug modal state changes
  useEffect(() => {
    console.log('showValueModal changed to:', showValueModal);
  }, [showValueModal]);

  useEffect(() => {
    console.log('showTensionModal changed to:', showTensionModal);
  }, [showTensionModal]);

  // Handler for navigating to group submissions page
  const handleReviewGroupSubs = () => {
    navigate(`/group-submissions/${encodeURIComponent(groupName)}`);
  };

  const resetFormForNewSubmission = () => {
    setCaseCards([createEmptyCaseCard()]);
    setCustomConceptCard({
      title: '',
      description: '',
      payer: '',
      endUser: '',
      servicingParty: '',
      impactedIndividuals: '',
      doAct: '',
      inferReason: '',
      data1: '',
      data2: '',
      data3: '',
      data4: ''
    });
    setSelectedCaseIdx(0);
    setCaseErrors({});
    setSaveAllError('');
    setSaveAllSuccess(false);
    setSubmissionCompleted(false);
  };

  const handleConfirmSave = async () => {
    console.log('handleConfirmSave called');
    setShowConfirmModal(false);
    
    let conceptCard = {};
    const selectedCase = exampleCases[selectedCaseIdx];
    if (selectedCase.title === 'Create Your Own') {
      conceptCard = customConceptCard;
    } else {
      conceptCard = conceptCardTemplates[selectedCase.title];
    }
    const group = groupName || '';
    const cases = caseCards.map(card => ({
      summary: card.summary,
      subject: card.subject,
      grade: card.grade,
      date: card.date,
      caseText: card.caseText,
      values: card.values,
      tensions: card.tensions,
      status: 'pending',
      group
    }));
    const submission = {
      conceptCard,
      cases,
      username: user.username,
      email: user.email,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      group: groupName || ''
    };
    
    console.log('Submitting data:', submission);
    
    try {
      const res = await fetch('/api/case-studies-focus-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission)
      });
      
      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);
      
      if (res.ok) {
        console.log('Submission successful');
        setSaveAllSuccess(true);
        setSaveAllError('');
        setSubmissionCompleted(true);
        // Clear the page for resubmission
        resetFormForNewSubmission();
      } else {
        console.log('Submission failed with status:', res.status);
        const errorText = await res.text();
        console.log('Error response:', errorText);
        setSaveAllError('Failed to save. Please try again.');
      }
    } catch (err) {
      console.log('Network error:', err);
      setSaveAllError('Failed to save. Please try again.');
    }
  };

  // Render all notes and value fields (values/tensions only if showValues is true)
  const renderNotesAndValues = (showValues) => (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
      {noteBoards.map((board, idx) => (
        <div key={idx} style={{ background: '#fff', borderRadius: 16, padding: '1.2rem 1.2rem', minWidth: 280, maxWidth: 360, boxShadow: '0 4px 16px rgba(0,0,0,0.10)', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 600, color: '#16a34a', marginBottom: 6 }}>Note {idx + 1}</div>
          <textarea
            value={board.notes}
            onChange={e => handleNoteChange(idx, e.target.value)}
            rows={4}
            style={{ width: '100%', borderRadius: 10, border: '1.5px solid #bbf7d0', padding: '0.7rem', fontSize: '1.05rem', marginBottom: showValues ? 10 : 0 }}
            placeholder={`Group notes for case/topic ${idx + 1}...`}
          />
          {showValues && (
            <>
              <DropValueArea values={board.values} onDrop={card => handleDropValue(idx, card)} onRemove={valueIdx => handleRemoveValue(idx, valueIdx)} />
              <div style={{ width: '100%', marginTop: 8 }}>
                <label style={{ color: '#4f46e5', fontWeight: 500, fontSize: '0.98em' }}>Comments:</label>
                <textarea
                  value={board.comments}
                  onChange={e => handleCommentChange(idx, e.target.value)}
                  rows={2}
                  style={{ width: '100%', borderRadius: 8, border: '1.5px solid #bbf7d0', padding: '0.5rem', fontSize: '0.98rem', marginTop: 2 }}
                  placeholder="Add comments or clarifications..."
                />
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );

  // Phase 1: Select case, show all notes (no values/tensions)
  console.log('Current phase:', phase);
  if (phase === 1) {
    console.log('Rendering Phase 1 content');
    const selectedCase = exampleCases[selectedCaseIdx];
    const blankTemplate = {
      title: '',
      description: '',
      payer: '',
      endUser: '',
      servicingParty: '',
      impactedIndividuals: '',
      doAct: '',
      inferReason: '',
      data1: '',
      data2: '',
      data3: '',
      data4: ''
    };
    // Use customConceptCard for Create Your Own, otherwise use template
    const template = selectedCase.title === 'Create Your Own' ? customConceptCard : conceptCardTemplates[selectedCase.title];

    return (
      <DndProvider backend={HTML5Backend}>

        
        {/* Confirmation Modal - Moved to beginning */}
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
            zIndex: 9999999
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
                Submit {caseCards.length} case{caseCards.length !== 1 ? 's' : ''} to the group "{groupName}"?
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
        {/* Create Tension Modal */}
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
            zIndex: 100001
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
                  {(editingTensionIndex >= 0 || editingSelectedTensionIndex >= 0) ? 'Edit Tension' : 'Create Your Own Tension'}
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
                  placeholder="e.g., Privacy vs. Utility, Accuracy vs. Fairness"
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
                  placeholder="Describe the tension between competing values in AI systems..."
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

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowCreateTensionModal(false);
                    setNewTension({ value: '', definition: '' });
                    setEditingTensionIndex(-1);
                    setEditingSelectedTensionIndex(-1);
                  }}
                  style={{
                    background: '#fff',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
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
                    background: !newTension.value.trim() || !newTension.definition.trim() ? '#d1d5db' : '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    padding: '0.6rem 1.2rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: !newTension.value.trim() || !newTension.definition.trim() ? 'not-allowed' : 'pointer'
                  }}
                >
                  {(editingTensionIndex >= 0 || editingSelectedTensionIndex >= 0) ? 'Update Tension' : 'Create Tension'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* CONDITIONAL EXAMPLE MODAL */}
        {showExampleModal && exampleCase && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 14,
              border: '1.5px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(34,197,94,0.05)',
              padding: '1.5rem',
              maxWidth: '800px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
            }}>
              {/* Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '1rem'
              }}>
                <h3 style={{ 
                  color: '#16a34a', 
                  fontSize: '1.25rem', 
                  fontWeight: 700, 
                  margin: 0 
                }}>
                  Example Case
                </h3>
                <button
                  onClick={() => setShowExampleModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    padding: '0.25rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  ×
                </button>
              </div>

              {/* Example Case Content - Same layout as real case */}
              <div style={{ flex: 1 }}>
                {/* Case Theme */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
                    Case Theme
                    <Tooltip text="Briefly describe the main theme of this case. For example: Ethical concern about student engagement monitoring.">?</Tooltip>
                  </label>
                  <input
                    type="text"
                    value={exampleCase.summary}
                    readOnly
                    style={{ 
                      width: '100%', 
                      padding: '0.5em 1em', 
                      borderRadius: 8, 
                      border: '1.5px solid #bbf7d0', 
                      fontWeight: 500, 
                      fontSize: '0.9rem', 
                      marginTop: 2, 
                      marginBottom: 10,
                      backgroundColor: '#f9fafb',
                      color: '#374151'
                    }}
                  />
                </div>

                {/* Subject | Grade | Date */}
                <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <label style={{ fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
                      Subject (optional)
                      <Tooltip text="Indicate the academic subject(s) relevant to this case, if applicable.">?</Tooltip>
                    </label>
                    <input 
                      type="text" 
                      value={exampleCase.subject} 
                      readOnly
                      style={{ 
                        width: '100%', 
                        padding: '0.5em', 
                        borderRadius: 8, 
                        border: '1.5px solid #bbf7d0', 
                        fontWeight: 500, 
                        fontSize: '0.9rem', 
                        marginTop: 2,
                        backgroundColor: '#f9fafb',
                        color: '#374151'
                      }} 
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <label style={{ fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
                      Grade (optional)
                      <Tooltip text="Specify the student grade level(s) involved in the case, if applicable.">?</Tooltip>
                    </label>
                    <input 
                      type="text" 
                      value={exampleCase.grade} 
                      readOnly
                      style={{ 
                        width: '100%', 
                        padding: '0.5em', 
                        borderRadius: 8, 
                        border: '1.5px solid #bbf7d0', 
                        fontWeight: 500, 
                        fontSize: '0.9rem', 
                        marginTop: 2,
                        backgroundColor: '#f9fafb',
                        color: '#374151'
                      }} 
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <label style={{ fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
                      Date of Event (optional)
                      <Tooltip text="When did this incident happen, if applicable.">?</Tooltip>
                    </label>
                    <input 
                      type="date" 
                      value={exampleCase.date} 
                      readOnly
                      style={{ 
                        width: '100%', 
                        padding: '0.5em', 
                        borderRadius: 8, 
                        border: '1.5px solid #bbf7d0', 
                        fontWeight: 500, 
                        fontSize: '0.9rem', 
                        marginTop: 2,
                        backgroundColor: '#f9fafb',
                        color: '#374151'
                      }} 
                    />
                  </div>
                </div>

                {/* Impacted Population(s) */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
                    Impacted Population(s)
                    <Tooltip text="Describe the situation in detail, including who was involved in the case you're sharing.">?</Tooltip>
                  </label>
                  <input
                    type="text"
                    value={exampleCase.impactedPop}
                    readOnly
                    style={{ 
                      width: '100%', 
                      padding: '0.5em 1em', 
                      borderRadius: 8, 
                      border: '1.5px solid #bbf7d0', 
                      fontWeight: 500, 
                      fontSize: '0.9rem', 
                      marginTop: 2, 
                      marginBottom: 10,
                      backgroundColor: '#f9fafb',
                      color: '#374151'
                    }}
                  />
                </div>

                {/* Case Narrative */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
                    Case Narrative
                    <Tooltip text="Provide a detailed account of the case. Include context, actions taken, people involved (e.g., teachers, students), and how the AI system was used or affected the situation.">?</Tooltip>
                  </label>
                  <textarea 
                    value={exampleCase.caseText} 
                    readOnly
                    rows={7} 
                    style={{ 
                      width: '100%', 
                      padding: '0.6em 1em', 
                      borderRadius: 8, 
                      border: '1.5px solid #bbf7d0', 
                      fontWeight: 500, 
                      fontSize: '1.05rem', 
                      marginTop: 2, 
                      resize: 'vertical', 
                      minHeight: 120,
                      backgroundColor: '#f9fafb',
                      color: '#374151'
                    }} 
                  />
                </div>

                {/* Values | Value Tensions */}
                <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <label style={{ fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
                      Values
                      <Tooltip text="The core ethical or educational principle supported in this case. You may select from existing values, refine one to better fit your case, or define a new one if needed.">?</Tooltip>
                    </label>
                    <div style={{ minHeight: 48, background: '#f1f5f9', border: '1.5px dashed #bbf7d0', borderRadius: 8, padding: '0.5em', marginTop: 2 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {exampleCase.values.map((v, vi) => (
                          <span key={v.value} style={{ 
                            background: '#16a34a', 
                            color: '#fff', 
                            borderRadius: 6, 
                            padding: '0.25rem 0.5rem', 
                            fontWeight: 500, 
                            fontSize: '0.8rem', 
                            display: 'flex', 
                            alignItems: 'center',
                            border: '1px solid #16a34a'
                          }}>
                            {v.value}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <label style={{ fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
                      Value Tensions
                      <Tooltip text="The competing values or principles that create tension in this case. You may select from existing tensions, refine one to better fit your case, or define a new one if needed.">?</Tooltip>
                    </label>
                    <div style={{ minHeight: 48, background: '#f1f5f9', border: '1.5px dashed #bbf7d0', borderRadius: 8, padding: '0.5em', marginTop: 2 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {exampleCase.tensions.map((t, ti) => (
                          <span key={t.value} style={{ 
                            background: '#f59e0b', 
                            color: '#fff', 
                            borderRadius: 6, 
                            padding: '0.25rem 0.5rem', 
                            fontWeight: 500, 
                            fontSize: '0.8rem', 
                            display: 'flex', 
                            alignItems: 'center',
                            border: '1px solid #f59e0b'
                          }}>
                            {t.value}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

            {/* Search Values Modal */}
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
                zIndex: 9999
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
                      Search Values
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
                    color: '#0c4a6e'
                  }}>
                    <strong>Instructions:</strong> Select/create one or more values from the sections below. Your selected values will appear in the panel, where you can review and edit their definitions before adding them to your case(s).
                  </div>

                  {/* Your Value History */}
                  <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ color: '#16a34a', fontWeight: 600, marginBottom: '1rem' }}>
                      Your Value History
                    </h4>
                    {userValueHistory.length > 0 ? (
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                        gap: '12px' 
                      }}>
                        {userValueHistory.map((value, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleValueSelection(value)}
                            style={{
                              background: selectedValues.some(v => v.value === value.value && v.definition === value.definition) 
                                ? '#dcfce7' 
                                : '#fff',
                              border: selectedValues.some(v => v.value === value.value && v.definition === value.definition)
                                ? '2px solid #16a34a'
                                : '1px solid #d1d5db',
                              borderRadius: 8,
                              padding: '12px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              position: 'relative'
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
                            <div style={{
                              position: 'absolute',
                              top: '0.5rem',
                              right: '0.5rem',
                              display: 'flex',
                              gap: '0.25rem'
                            }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditValue(idx);
                                }}
                                style={{
                                  background: '#16a34a',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: 4,
                                  padding: '0.25rem 0.5rem',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer'
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteValue(idx);
                                }}
                                style={{
                                  background: '#dc2626',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: 4,
                                  padding: '0.25rem 0.5rem',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer'
                                }}
                              >
                                Delete
                              </button>
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

                  {/* Predefined Values */}
                  <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ color: '#16a34a', fontWeight: 600, marginBottom: '1rem' }}>
                      Predefined Values
                    </h4>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                      gap: '1rem' 
                    }}>
                      {predefinedValues.map((value, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleValueSelection(value)}
                          style={{
                            background: selectedValues.some(v => v.value === value.value && v.definition === value.definition) 
                              ? '#dcfce7' 
                              : '#fff',
                            border: selectedValues.some(v => v.value === value.value && v.definition === value.definition)
                              ? '2px solid #16a34a'
                              : '1px solid #d1d5db',
                            borderRadius: 8,
                            padding: '1rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ fontWeight: 600, color: '#16a34a', marginBottom: '0.5rem' }}>
                            {value.value}
                            {selectedValues.some(v => v.value === value.value && v.definition === value.definition) && (
                              <span style={{ marginLeft: '8px', fontSize: '0.8rem' }}>✓</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#374151' }}>
                            {value.definition}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Selected Values Panel */}
                  {console.log('selectedValues.length:', selectedValues.length)}
                  {selectedValues.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ color: '#16a34a', fontWeight: 600, marginBottom: '1rem' }}>
                        Selected Values from Search ({selectedValues.length})
                      </h4>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                        gap: '12px' 
                      }}>
                        {selectedValues.map((value, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: '#fff',
                              border: '1px solid #d1d5db',
                              borderRadius: 8,
                              padding: '12px',
                              position: 'relative',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ 
                              fontWeight: 600, 
                              color: '#16a34a', 
                              marginBottom: '4px',
                              textAlign: 'left'
                            }}>
                              {value.value}
                            </div>
                            <div style={{ 
                              fontSize: '0.85rem', 
                              color: '#374151', 
                              lineHeight: 1.4, 
                              textAlign: 'left',
                              marginBottom: '8px'
                            }}>
                              {value.definition}
                            </div>
                            <div style={{
                              position: 'absolute',
                              top: '0.5rem',
                              right: '0.5rem',
                              display: 'flex',
                              gap: '0.25rem'
                            }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('Edit value clicked for index:', idx);
                                  console.log('Value to edit:', value);
                                  console.log('Setting editingSelectedValueIndex to:', idx);
                                  setNewValue({ value: value.value, definition: value.definition });
                                  setShowCreateValueModal(true);
                                  setEditingSelectedValueIndex(idx);
                                  setEditingValueIndex(-1);
                                  console.log('Edit button click handler completed');
                                }}
                                style={{
                                  background: '#16a34a',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: 4,
                                  padding: '0.25rem 0.5rem',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer'
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedValues(prev => prev.filter((_, index) => index !== idx));
                                }}
                                style={{
                                  background: '#dc2626',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: 4,
                                  padding: '0.25rem 0.5rem',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer'
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '1rem'
                  }}>
                    <button
                      onClick={() => {
                        setShowValueModal(false);
                        setSelectedValues([]);
                      }}
                      style={{
                        background: '#fff',
                        color: '#6b7280',
                        border: '1px solid #d1d5db',
                        borderRadius: 6,
                        padding: '0.6rem 1.2rem',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApplyValuesToPool}
                      disabled={selectedValues.length === 0}
                      style={{
                        background: selectedValues.length === 0 ? '#d1d5db' : '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        padding: '0.6rem 1.2rem',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: selectedValues.length === 0 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Apply to Pool ({selectedValues.length})
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Create Value Modal */}
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
                zIndex: 10000
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
                      {console.log('Modal title check - editingValueIndex:', editingValueIndex, 'editingSelectedValueIndex:', editingSelectedValueIndex)}
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

            <label style={{ color: '#16a34a', fontWeight: 600, marginBottom: 8, fontSize: '1rem' }}>Choose an AI application scenario:</label>
            <select value={selectedCaseIdx} onChange={e => setSelectedCaseIdx(Number(e.target.value))} style={{ fontSize: '1rem', padding: '0.7rem 2.2rem', borderRadius: 12, border: '2px solid #16a34a', marginBottom: 28, background: '#fff', color: '#222', fontWeight: 600, boxShadow: '0 2px 8px rgba(34,197,94,0.10)', outline: 'none', minWidth: 220, cursor: 'pointer', transition: 'border 0.2s' }}>
              {exampleCases.map((c, idx) => (
                <option key={c.id} value={idx}>{c.title}</option>
              ))}
            </select>
            <div className="concept-card-section" style={{ background: '#f8fafc', borderRadius: 18, border: '1.5px solid #e5e7eb', boxShadow: '0 4px 32px rgba(0,0,0,0.06)', marginBottom: 32, padding: '2.2rem', maxWidth: 1100, width: '95%' }}>
              <div style={{ fontWeight: 700, color: '#16a34a', fontSize: '1.4rem', marginBottom: 18, textAlign: 'center', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                AI Application Card
                <Tooltip text="Use this card to clearly describe how your AI system works in an educational setting. Even similar tools may differ in purpose, data, or stakeholders. This structured format ensures everyone has shared context, please fill it out as thoroughly as possible..">?</Tooltip>
              </div>

              <div style={{ marginBottom: 18 }}>
                <div style={{ color: '#444', fontWeight: 600, fontSize: '1rem', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Title
                  <Tooltip text="Please share the name of the application or a short descriptive title for the system.">?</Tooltip>
                </div>
                <textarea 
                  readOnly={selectedCase.title !== 'Create Your Own'} 
                  required={selectedCase.title === 'Create Your Own'} 
                  value={template.title} 
                  onChange={selectedCase.title === 'Create Your Own' ? (e) => setCustomConceptCard(prev => ({ ...prev, title: e.target.value })) : undefined}
                  rows={2} 
                  style={{ 
                    width: '100%', 
                    background: selectedCase.title === 'Create Your Own' ? '#fff' : '#f1f5f9', 
                    color: '#222', 
                    fontWeight: 600, 
                    border: selectedCase.title === 'Create Your Own' ? '1.5px solid #bbf7d0' : 'none', 
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
                <div style={{ color: '#444', fontWeight: 600, fontSize: '1rem', marginBottom: 6 }}>
                  Description
                </div>
                <textarea 
                  readOnly={selectedCase.title !== 'Create Your Own'} 
                  required={selectedCase.title === 'Create Your Own'} 
                  value={template.description} 
                  onChange={selectedCase.title === 'Create Your Own' ? (e) => setCustomConceptCard(prev => ({ ...prev, description: e.target.value })) : undefined}
                  rows={3} 
                  style={{ 
                    width: '100%', 
                    background: selectedCase.title === 'Create Your Own' ? '#fff' : '#f1f5f9', 
                    color: '#222', 
                    fontWeight: 500, 
                    border: selectedCase.title === 'Create Your Own' ? '1.5px solid #bbf7d0' : 'none', 
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
                    readOnly={selectedCase.title !== 'Create Your Own'} 
                    value={template.doAct} 
                    onChange={selectedCase.title === 'Create Your Own' ? (e) => setCustomConceptCard(prev => ({ ...prev, doAct: e.target.value })) : undefined}
                    rows={4} 
                    style={{ 
                      width: '100%', 
                      background: selectedCase.title === 'Create Your Own' ? '#fff' : '#f1f5f9', 
                      color: '#222', 
                      border: selectedCase.title === 'Create Your Own' ? '1.5px solid #bbf7d0' : 'none', 
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
                    readOnly={selectedCase.title !== 'Create Your Own'} 
                    value={template.inferReason} 
                    onChange={selectedCase.title === 'Create Your Own' ? (e) => setCustomConceptCard(prev => ({ ...prev, inferReason: e.target.value })) : undefined}
                    rows={4} 
                    style={{ 
                      width: '100%', 
                      background: selectedCase.title === 'Create Your Own' ? '#fff' : '#f1f5f9', 
                      color: '#222', 
                      border: selectedCase.title === 'Create Your Own' ? '1.5px solid #bbf7d0' : 'none', 
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
                <Tooltip text=" Please list the data your system uses (e.g., engagement, attendance). If unsure, just write what you know, no need to fill every box. ">?</Tooltip>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
                <div style={{ width: '100%' }}><b>Data 1:</b> <textarea 
                  readOnly={selectedCase.title !== 'Create Your Own'} 
                  value={template.data1} 
                  onChange={selectedCase.title === 'Create Your Own' ? (e) => setCustomConceptCard(prev => ({ ...prev, data1: e.target.value })) : undefined}
                  rows={2} 
                  style={{ 
                    width: '100%', 
                    background: selectedCase.title === 'Create Your Own' ? '#fff' : '#f1f5f9', 
                    color: '#222', 
                    border: selectedCase.title === 'Create Your Own' ? '1.5px solid #bbf7d0' : 'none', 
                    borderRadius: 8, 
                    padding: '0.6em 1em', 
                    fontSize: '0.9rem', 
                    boxSizing: 'border-box', 
                    resize: 'none', 
                    overflowY: 'auto' 
                  }} 
                /></div>
                <div style={{ width: '100%' }}><b>Data 2:</b> <textarea 
                  readOnly={selectedCase.title !== 'Create Your Own'} 
                  value={template.data2} 
                  onChange={selectedCase.title === 'Create Your Own' ? (e) => setCustomConceptCard(prev => ({ ...prev, data2: e.target.value })) : undefined}
                  rows={2} 
                  style={{ 
                    width: '100%', 
                    background: selectedCase.title === 'Create Your Own' ? '#fff' : '#f1f5f9', 
                    color: '#222', 
                    border: selectedCase.title === 'Create Your Own' ? '1.5px solid #bbf7d0' : 'none', 
                    borderRadius: 8, 
                    padding: '0.6em 1em', 
                    fontSize: '0.9rem', 
                    boxSizing: 'border-box', 
                    resize: 'none', 
                    overflowY: 'auto' 
                  }} 
                /></div>
                <div style={{ width: '100%' }}><b>Data 3:</b> <textarea 
                  readOnly={selectedCase.title !== 'Create Your Own'} 
                  value={template.data3} 
                  onChange={selectedCase.title === 'Create Your Own' ? (e) => setCustomConceptCard(prev => ({ ...prev, data3: e.target.value })) : undefined}
                  rows={2} 
                  style={{ 
                    width: '100%', 
                    background: selectedCase.title === 'Create Your Own' ? '#fff' : '#f1f5f9', 
                    color: '#222', 
                    border: selectedCase.title === 'Create Your Own' ? '1.5px solid #bbf7d0' : 'none', 
                    borderRadius: 8, 
                    padding: '0.6em 1em', 
                    fontSize: '0.9rem', 
                    boxSizing: 'border-box', 
                    resize: 'none', 
                    overflowY: 'auto' 
                  }} 
                /></div>
                <div style={{ width: '100%' }}><b>Data 4:</b> <textarea 
                  readOnly={selectedCase.title !== 'Create Your Own'} 
                  value={template.data4} 
                  onChange={selectedCase.title === 'Create Your Own' ? (e) => setCustomConceptCard(prev => ({ ...prev, data4: e.target.value })) : undefined}
                  rows={2} 
                  style={{ 
                    width: '100%', 
                    background: selectedCase.title === 'Create Your Own' ? '#fff' : '#f1f5f9', 
                    color: '#222', 
                    border: selectedCase.title === 'Create Your Own' ? '1.5px solid #bbf7d0' : 'none', 
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
                <Tooltip text=" List key groups involved with or affected by the system. If you're unsure about some roles, just fill in what you know.">?</Tooltip>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
                <div style={{ width: '100%' }}><b>Funder/Customer:</b> <textarea 
                  readOnly={selectedCase.title !== 'Create Your Own'} 
                  value={template.payer} 
                  onChange={selectedCase.title === 'Create Your Own' ? (e) => setCustomConceptCard(prev => ({ ...prev, payer: e.target.value })) : undefined}
                  rows={2} 
                  style={{ 
                    width: '100%', 
                    background: selectedCase.title === 'Create Your Own' ? '#fff' : '#f1f5f9', 
                    color: '#222', 
                    border: selectedCase.title === 'Create Your Own' ? '1.5px solid #bbf7d0' : 'none', 
                    borderRadius: 8, 
                    padding: '0.6em 1em', 
                    fontSize: '0.9rem', 
                    boxSizing: 'border-box', 
                    resize: 'none', 
                    overflowY: 'auto' 
                  }} 
                /></div>
                <div style={{ width: '100%' }}><b>Servicing Party:</b> <textarea 
                  readOnly={selectedCase.title !== 'Create Your Own'} 
                  value={template.servicingParty} 
                  onChange={selectedCase.title === 'Create Your Own' ? (e) => setCustomConceptCard(prev => ({ ...prev, servicingParty: e.target.value })) : undefined}
                  rows={2} 
                  style={{ 
                    width: '100%', 
                    background: selectedCase.title === 'Create Your Own' ? '#fff' : '#f1f5f9', 
                    color: '#222', 
                    border: selectedCase.title === 'Create Your Own' ? '1.5px solid #bbf7d0' : 'none', 
                    borderRadius: 8, 
                    padding: '0.6em 1em', 
                    fontSize: '0.9rem', 
                    boxSizing: 'border-box', 
                    resize: 'none', 
                    overflowY: 'auto' 
                  }} 
                /></div>
                <div style={{ width: '100%' }}><b>End User:</b> <textarea 
                  readOnly={selectedCase.title !== 'Create Your Own'} 
                  value={template.endUser} 
                  onChange={selectedCase.title === 'Create Your Own' ? (e) => setCustomConceptCard(prev => ({ ...prev, endUser: e.target.value })) : undefined}
                  rows={2} 
                  style={{ 
                    width: '100%', 
                    background: selectedCase.title === 'Create Your Own' ? '#fff' : '#f1f5f9', 
                    color: '#222', 
                    border: selectedCase.title === 'Create Your Own' ? '1.5px solid #bbf7d0' : 'none', 
                    borderRadius: 8, 
                    padding: '0.6em 1em', 
                    fontSize: '0.9rem', 
                    boxSizing: 'border-box', 
                    resize: 'none', 
                    overflowY: 'auto' 
                  }} 
                /></div>
                <div style={{ width: '100%' }}><b>Impacted Individuals:</b> <textarea 
                  readOnly={selectedCase.title !== 'Create Your Own'} 
                  value={template.impactedIndividuals} 
                  onChange={selectedCase.title === 'Create Your Own' ? (e) => setCustomConceptCard(prev => ({ ...prev, impactedIndividuals: e.target.value })) : undefined}
                  rows={2} 
                  style={{ 
                    width: '100%', 
                    background: selectedCase.title === 'Create Your Own' ? '#fff' : '#f1f5f9', 
                    color: '#222', 
                    border: selectedCase.title === 'Create Your Own' ? '1.5px solid #bbf7d0' : 'none', 
                    borderRadius: 8, 
                    padding: '0.6em 1em', 
                    fontSize: '0.9rem', 
                    boxSizing: 'border-box', 
                    resize: 'none', 
                    overflowY: 'auto' 
                  }} 
                /></div>
              </div>
            </div>
            <>
              {/* Show Case Cards Button and Section */}
              <div style={{ width: '100%', textAlign: 'center', margin: '32px 0 0 0' }}>
                <button
                  type="button"
                  className="green-btn polished-btn"
                  style={{ fontSize: '1rem', padding: '0.8rem 2.5rem', borderRadius: 12, fontWeight: 700, background: '#fff', color: '#16a34a', border: '2px solid #bbf7d0', marginTop: 8, boxShadow: '0 2px 8px rgba(34,197,94,0.07)', cursor: 'pointer' }}
                  onClick={() => setShowCaseCards(v => !v)}
                >
                  {showCaseCards ? 'Hide Case Cards' : 'Show Case Cards'}
                </button>
              </div>
              {showCaseCards && (
                <div style={{ margin: '32px auto', maxWidth: 1100, width: '100%', background: '#f9fafb', borderRadius: 18, border: '1.5px solid #e5e7eb', boxShadow: '0 2px 16px rgba(34,197,94,0.07)', padding: '2.2rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <label style={{ fontWeight: 800, color: '#16a34a', fontSize: '1.2rem', margin: 0, textAlign: 'center' }}>
                        The Collection of Cases
                      </label>
                      <Tooltip text="The Collection of Cases is designed to capture real or hypothetical classroom situations where the same AI application (as defined above) is used. All cases added to this collection should relate to that same system.">?</Tooltip>
                    </div>
                    
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {exampleCase && (
                    <button
                      type="button"
                      className="green-btn polished-btn"
                          style={{ fontSize: '0.95rem', padding: '0.6rem 1.6rem', borderRadius: 10, fontWeight: 700, background: '#fff', color: '#16a34a', border: '2px solid #bbf7d0', boxShadow: '0 2px 8px rgba(34,197,94,0.07)', cursor: 'pointer', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => {
                            console.log('Show Example button clicked - toggling modal');
                            setShowExampleModal(!showExampleModal);
                          }}
                        >
                          👁️ Show Example
                        </button>
                      )}
                      
                      <button
                        type="button"
                        className="green-btn polished-btn"
                        style={{ fontSize: '0.95rem', padding: '0.6rem 1.6rem', borderRadius: 10, fontWeight: 700, background: '#fff', color: '#16a34a', border: '2px solid #bbf7d0', boxShadow: '0 2px 8px rgba(34,197,94,0.07)', cursor: 'pointer', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => {
                        // Validate that the currently open case has required fields
                        const openCaseIdx = getOpenCaseIdx();
                        
                        if (openCaseIdx === -1) {
                          // No case is open, allow adding a new case
                          setCaseCards(cards => {
                            const newCards = [...cards, createEmptyCaseCard()];
                            // Set expandedCaseIdx to the index of the newly added case
                            setExpandedCaseIdx(newCards.length - 1);
                            return newCards;
                          });
                          return;
                        }
                        
                        const openCase = caseCards[openCaseIdx];
                        const validationErrors = [];
                        
                        if (!openCase.summary || openCase.summary.trim() === '') {
                          validationErrors.push('Case Theme is required.');
                        }
                        if (!openCase.caseText || openCase.caseText.trim() === '') {
                          validationErrors.push('Case Narrative is required.');
                        }
                        if (!openCase.values || openCase.values.length === 0) {
                          validationErrors.push('At least one Value is required.');
                        }
                        
                        if (validationErrors.length > 0) {
                          const errorMessage = `Please complete all required fields before creating a new case:\n\n${validationErrors.join('\n')}`;
                          setErrorModal({ isOpen: true, message: errorMessage });
                          return;
                        }
                        
                        // If validation passes, add new case
                        setCaseCards(cards => {
                          const newCards = [...cards, createEmptyCaseCard()];
                          // Set expandedCaseIdx to the index of the newly added case
                          setExpandedCaseIdx(newCards.length - 1);
                          return newCards;
                        });
                      }}
                    >
                      + Add Case
                    </button>
                    </div>
                  </div>
                  {caseCards.map((card, idx) => (
                    <div key={idx} style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e5e7eb', boxShadow: '0 2px 8px rgba(34,197,94,0.05)', padding: expandedCaseIdx === idx ? '1.5rem 1.5rem 1.2rem 1.5rem' : '0.7rem 1.5rem 0.7rem 1.5rem', marginBottom: 28, position: 'relative', minHeight: 56, display: 'flex', alignItems: 'center' }}>
                      {/* Folded state: show unfold icon, summary, trash icon */}
                                             {expandedCaseIdx !== idx && (
                        <>
                          <button
                            type="button"
                            title="Expand"
                            style={{ background: 'none', border: 'none', color: '#bbb', fontSize: 18, cursor: 'pointer', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transition: 'background 0.15s, color 0.15s', marginRight: 8 }}
                            onClick={() => setExpandedCaseIdx(expanded => expanded === idx ? -1 : idx)}
                            onMouseOver={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.background = '#f3f4f6'; }}
                            onMouseOut={e => { e.currentTarget.style.color = '#bbb'; e.currentTarget.style.background = 'none'; }}
                          >
                            <span>&#9660;</span>
                          </button>
                          <span style={{ flex: 1, color: '#222', fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: 12 }}>
                            {card.summary || <span style={{ color: '#bbb', fontWeight: 400 }}>[No summary]</span>}
                          </span>
                        </>
                      )}
                      <button
                        type="button"
                        title="Delete Case"
                        style={{ position: expandedCaseIdx === idx ? 'absolute' : 'static', top: 8, right: 8, background: 'none', border: 'none', color: '#bbb', fontSize: 16, cursor: 'pointer', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transition: 'background 0.15s, color 0.15s', marginLeft: expandedCaseIdx === idx ? 0 : 8 }}
                        onClick={() => setCaseCards(cards => cards.filter((_, i) => i !== idx))}
                        onMouseOver={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.background = '#f3f4f6'; }}
                        onMouseOut={e => { e.currentTarget.style.color = '#bbb'; e.currentTarget.style.background = 'none'; }}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                      {expandedCaseIdx === idx && (
                        <div style={{ flex: 1 }}>
                          {/* Short Summary (full width, first row) */}
                          <div style={{ marginBottom: 16 }}>
                            <label style={{ fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
                              Case Theme
                              <Tooltip text="Briefly describe the main theme of this case. For example: Ethical concern about student engagement monitoring.">?</Tooltip>
                            </label>
                            <input
                              type="text"
                              value={card.summary}
                              onChange={e => setCaseCards(cards => cards.map((c, i) => i === idx ? { ...c, summary: e.target.value } : c))}
                              style={{ width: '100%', padding: '0.5em 1em', borderRadius: 8, border: '1.5px solid #bbf7d0', fontWeight: 500, fontSize: '0.9rem', marginTop: 2, marginBottom: 10 }}
                              placeholder="A one-sentence summary of this case"
                            />
                          </div>
                          {/* Subject | Grade | Date (side by side, second row) */}
                          <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
                            <div style={{ flex: 1, minWidth: 120 }}>
                              <label style={{ fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
                                Subject (optional)
                                <Tooltip text="Indicate the academic subject(s) relevant to this case, if applicable.">?</Tooltip>
                              </label>
                              <input type="text" value={card.subject} onChange={e => setCaseCards(cards => cards.map((c, i) => i === idx ? { ...c, subject: e.target.value } : c))} style={{ width: '100%', padding: '0.5em', borderRadius: 8, border: '1.5px solid #bbf7d0', fontWeight: 500, fontSize: '0.9rem', marginTop: 2 }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 120 }}>
                              <label style={{ fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
                                Grade (optional)
                                <Tooltip text="Specify the student grade level(s) involved in the case, if applicable.">?</Tooltip>
                              </label>
                              <input type="text" value={card.grade} onChange={e => setCaseCards(cards => cards.map((c, i) => i === idx ? { ...c, grade: e.target.value } : c))} style={{ width: '100%', padding: '0.5em', borderRadius: 8, border: '1.5px solid #bbf7d0', fontWeight: 500, fontSize: '0.9rem', marginTop: 2 }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 120 }}>
                              <label style={{ fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
                                Date of Event (optional)
                                <Tooltip text="When did this incident happen, if applicable.">?</Tooltip>
                              </label>
                              <input type="date" value={card.date} onChange={e => setCaseCards(cards => cards.map((c, i) => i === idx ? { ...c, date: e.target.value } : c))} style={{ width: '100%', padding: '0.5em', borderRadius: 8, border: '1.5px solid #bbf7d0', fontWeight: 500, fontSize: '0.9rem', marginTop: 2 }} />
                            </div>
                          </div>
                          {/* Impacted Population(s) */}
                          <div style={{ marginBottom: 16 }}>
                            <label style={{ fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
                              Impacted Population(s)
                              <Tooltip text="Describe the situation in detail, including who was involved in the case you're sharing.">?</Tooltip>
                            </label>
                            <input
                              type="text"
                              value={card.impactedPop || ''}
                              onChange={e => setCaseCards(cards => cards.map((c, i) => i === idx ? { ...c, impactedPop: e.target.value } : c))}
                              style={{ width: '100%', padding: '0.5em 1em', borderRadius: 8, border: '1.5px solid #bbf7d0', fontWeight: 500, fontSize: '0.9rem', marginTop: 2, marginBottom: 10 }}
                              placeholder="Who is most affected by this case? (e.g., students with IEPs, English learners, etc.)"
                            />
                          </div>
                          {/* Case (large textarea, full width, third row) */}
                          <div style={{ marginBottom: 16 }}>
                            <label style={{ fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
                              Case Narrative
                              <Tooltip text="Provide a detailed account of the case. Include context, actions taken, people involved (e.g., teachers, students), and how the AI system was used or affected the situation.">?</Tooltip>
                            </label>
                            <textarea value={card.caseText} onChange={e => setCaseCards(cards => cards.map((c, i) => i === idx ? { ...c, caseText: e.target.value } : c))} rows={7} style={{ width: '100%', padding: '0.6em 1em', borderRadius: 8, border: '1.5px solid #bbf7d0', fontWeight: 500, fontSize: '1.05rem', marginTop: 2, resize: 'vertical', minHeight: 120 }} />
                          </div>
                          {/* Values | Value Tensions (side by side, fifth row) */}
                          <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
                            <div style={{ flex: 1, minWidth: 180 }}>
                              <label style={{ fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
                                Values
                                <Tooltip text="The core ethical or educational principle supported in this case. You may select from existing values, refine one to better fit your case, or define a new one if needed.">?</Tooltip>
                              </label>
                              <div style={{ minHeight: 48, background: '#f1f5f9', border: '1.5px dashed #bbf7d0', borderRadius: 8, padding: '0.5em', marginTop: 2 }}>
                                {card.values.length === 0 && <span style={{ color: '#bbb', fontStyle: 'italic', display: 'flex', alignItems: 'center', height: '100%', minHeight: '32px' }}>Click on value cards below to add them here.</span>}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                  {card.values.map((v, vi) => (
                                    <span key={v.value} style={{ 
                                      background: '#16a34a', 
                                      color: '#fff', 
                                      borderRadius: 6, 
                                      padding: '0.25rem 0.5rem', 
                                      fontWeight: 500, 
                                      fontSize: '0.8rem', 
                                      display: 'flex', 
                                      alignItems: 'center',
                                      border: '1px solid #16a34a'
                                    }}>
                                      {v.value}
                                      <button 
                                        onClick={() => setCaseCards(cards => cards.map((c, i) => i === idx ? { ...c, values: c.values.filter((_, j) => j !== vi) } : c))} 
                                        style={{ 
                                          marginLeft: 4, 
                                          background: 'none', 
                                          border: 'none', 
                                          color: '#fff', 
                                          fontWeight: 600, 
                                          cursor: 'pointer', 
                                          fontSize: '0.9rem',
                                          padding: '0 2px'
                                        }} 
                                        title="Remove"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div style={{ flex: 1, minWidth: 180 }}>
                              <label style={{ fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
                                Value Tension
                                <Tooltip text="A conflicting value or tradeoff that emerged in the case, where upholding one value may come at the cost of another. You may select from existing values, refine one to better fit your case, or define a new one if needed.">?</Tooltip>
                              </label>
                              <div style={{ minHeight: 48, background: '#f1f5f9', border: '1.5px dashed #bbf7d0', borderRadius: 8, padding: '0.5em', marginTop: 2 }}>
                                {card.tensions.length === 0 && <span style={{ color: '#bbb', fontStyle: 'italic', display: 'flex', alignItems: 'center', height: '100%', minHeight: '32px' }}>Click on tension cards below to add them here.</span>}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                  {card.tensions.map((t, ti) => (
                                    <span key={t.value} style={{ 
                                      background: '#f59e0b', 
                                      color: '#fff', 
                                      borderRadius: 6, 
                                      padding: '0.25rem 0.5rem', 
                                      fontWeight: 500, 
                                      fontSize: '0.8rem', 
                                      display: 'flex', 
                                      alignItems: 'center',
                                      border: '1px solid #f59e0b'
                                    }}>
                                      {t.value}
                                      <button 
                                        onClick={() => setCaseCards(cards => cards.map((c, i) => i === idx ? { ...c, tensions: c.tensions.filter((_, j) => j !== ti) } : c))} 
                                        style={{ 
                                          marginLeft: 4, 
                                          background: 'none', 
                                          border: 'none', 
                                          color: '#fff', 
                                          fontWeight: 600, 
                                          cursor: 'pointer', 
                                          fontSize: '0.9rem',
                                          padding: '0 2px'
                                        }} 
                                        title="Remove"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Save button (right-aligned, last row) */}
                          <div style={{ width: '100%', textAlign: 'right', marginTop: 18 }}>
                            <button
                              type="button"
                              className="green-btn polished-btn"
                              style={{ fontSize: '1.05rem', padding: '0.7rem 2.2rem', borderRadius: 10, fontWeight: 700, background: '#16a34a', color: '#fff', border: 'none', boxShadow: '0 2px 8px rgba(34,197,94,0.07)', cursor: 'pointer', transition: 'background 0.15s' }}
                              onClick={() => {
                                const errors = {};
                                if (!card.summary || card.summary.trim() === '') {
                                  errors.summary = 'Case Theme is required.';
                                }
                                if (!card.caseText || card.caseText.trim() === '') {
                                  errors.caseText = 'Case Narrative is required.';
                                }
                                if (!card.values || card.values.length === 0) {
                                  errors.values = 'At least one Value is required.';
                                }
                                if (Object.keys(errors).length > 0) {
                                  setCaseErrors(prev => ({ ...prev, [idx]: errors }));
                                  return;
                                } else {
                                  setCaseErrors(prev => ({ ...prev, [idx]: undefined }));
                                }
                                setSavedCases(saved => [...saved.filter(i => i !== idx), idx]);
                                setExpandedCaseIdx(expanded => expanded === idx ? -1 : idx);
                                setTimeout(() => setSavedCases(saved => saved.filter(i => i !== idx)), 1200);
                              }}
                            >
                              {savedCases.includes(idx) ? 'Saved!' : 'Save'}
                            </button>
                            {caseErrors[idx]?.summary && (
                              <div style={{ color: '#dc2626', fontWeight: 600, marginBottom: 6 }}>{caseErrors[idx].summary}</div>
                            )}
                            {caseErrors[idx]?.caseText && (
                              <div style={{ color: '#dc2626', fontWeight: 600, marginBottom: 6 }}>{caseErrors[idx].caseText}</div>
                            )}
                            {caseErrors[idx]?.values && (
                              <div style={{ color: '#dc2626', fontWeight: 600, marginBottom: 6 }}>{caseErrors[idx].values}</div>
                            )}
                            {caseErrors[idx]?.tensions && (
                              <div style={{ color: '#dc2626', fontWeight: 600, marginBottom: 6 }}>{caseErrors[idx].tensions}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {/* Show Value Cards Button and Section */}
              <div style={{ width: '100%', textAlign: 'center', margin: '32px 0 0 0' }}>
                <button
                  type="button"
                  className="green-btn polished-btn"
                  style={{ fontSize: '1rem', padding: '0.8rem 2.5rem', borderRadius: 12, fontWeight: 700, background: '#fff', color: '#16a34a', border: '2px solid #bbf7d0', marginTop: 8, boxShadow: '0 2px 8px rgba(34,197,94,0.07)', cursor: 'pointer' }}
                  onClick={() => setShowValueCards(v => !v)}
                >
                  {showValueCards ? 'Hide Value Cards' : 'Show Value Cards'}
                </button>
              </div>
              {showValueCards && (
                <div style={{ margin: '32px auto', maxWidth: 1100, width: '100%', background: '#fff', borderRadius: 18, border: '1.5px solid #e5e7eb', boxShadow: '0 2px 16px rgba(34,197,94,0.07)', padding: '2.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ color: '#16a34a', fontWeight: 800, fontSize: '1.35rem', marginBottom: 18, letterSpacing: '-0.5px', textAlign: 'center', width: '100%' }}>Value Cards</div>
                  
                  {/* FAQ Section */}
                  <div style={{ width: '100%', marginBottom: '20px' }}>
                    <button
                      onClick={() => setShowQA(!showQA)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#16a34a',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      {showQA ? 'Hide' : 'Show'} Frequently Asked Questions
                      <span style={{ fontSize: '0.8rem' }}>{showQA ? '▼' : '▶'}</span>
                    </button>
                    
                    {showQA && (
                      <div style={{ 
                        background: '#f0f9ff', 
                        border: '1px solid #bae6fd', 
                        borderRadius: 8, 
                        padding: '1rem', 
                        marginTop: '0.5rem',
                        fontSize: '0.9rem',
                        color: '#0c4a6e'
                      }}>
                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ fontWeight: 600, color: '#0c4a6e', marginBottom: '0.3rem' }}>
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
                  
                  {/* Search Values Button */}
                  <div style={{ marginBottom: '20px', position: 'relative', zIndex: 10 }}>
                    <button
                      onClick={() => {
                        setShowValueModal(true);
                      }}
                      style={{
                        background: '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: '0.6rem 1.2rem',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        position: 'relative',
                        zIndex: 10
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#15803d'}
                      onMouseLeave={(e) => e.target.style.background = '#16a34a'}
                    >
                      🔍 Search Values
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, width: '100%', marginBottom: 18, alignItems: 'start', justifyItems: 'center' }}>
                    {valueCards.map((card, idx) => (
                      <DraggableValueCard
                        key={card.value + card.definition}
                        card={card}
                        isCustom={idx >= 3}
                        onDelete={() => setValueCards(cards => cards.filter((c, i) => i !== idx))}
                        onEdit={(newValue, newDefinition) => handleEditValueCard(idx, newValue, newDefinition)}
                        onClick={() => handleClickValueCard(card)}
                      />
                    ))}
                  </div>
                  {clickToAddError && <div style={{ color: '#dc2626', fontWeight: 600, marginBottom: 8 }}>{clickToAddError}</div>}
                  <div style={{ color: '#16a34a', fontWeight: 700, fontSize: '1.13rem', margin: '18px 0 10px 0', textAlign: 'center', width: '100%' }}>Value Tensions</div>
                  
                  {/* Search Tensions Button */}
                  <div style={{ marginBottom: '20px', position: 'relative', zIndex: 100 }}>
                      <button
                      onClick={() => {
                        console.log('Search Tensions button clicked!');
                        console.log('Setting showTensionModal to true');
                        setShowTensionModal(true);
                        }}
                        style={{
                        background: '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: '0.6rem 1.2rem',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        position: 'relative',
                        zIndex: 100
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#15803d'}
                      onMouseLeave={(e) => e.target.style.background = '#16a34a'}
                    >
                      🔍 Search Tensions
                    </button>
                        </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, width: '100%', marginBottom: 18, alignItems: 'start', justifyItems: 'center' }}>
                    {tensionCards.map((card, idx) => (
                      <DraggableTensionCard
                        key={card.value + card.definition}
                        card={card}
                        isCustom={idx >= 2}
                        onDelete={() => setTensionCards(cards => cards.filter((c, i) => i !== idx))}
                        onEdit={(newValue, newDefinition) => handleEditTensionCard(idx, newValue, newDefinition)}
                        onClick={() => handleClickTensionCard(card)}
                      />
                    ))}
                  </div>

                </div>
              )}
              {/* Save All section immediately below Show Value Cards */}
              
              <div style={{ width: '100%', maxWidth: 1100, margin: '32px auto 0 auto', padding: '2rem 0', textAlign: 'center' }}>
                {/* Add Review Group Submission button above Save All */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 18 }}>
                  <input
                    type="text"
                    placeholder="Your Name (required)"
                    value={user.username}
                    onChange={e => setUsername(e.target.value)}
                    style={{ padding: '0.7rem 1.2rem', borderRadius: 8, border: '1.5px solid #bbf7d0', fontSize: '1.08rem', minWidth: 220 }}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Your Email (required)"
                    value={user.email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ padding: '0.7rem 1.2rem', borderRadius: 8, border: '1.5px solid #bbf7d0', fontSize: '1.08rem', minWidth: 220 }}
                    required
                  />
                </div>
                
                {/* Vertical button layout */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <button
                  className="green-btn polished-btn"
                    style={{ fontSize: '1rem', padding: '0.8rem 2.5rem', borderRadius: 12, fontWeight: 800, background: '#16a34a', color: '#fff', border: 'none', boxShadow: '0 2px 8px rgba(34,197,94,0.07)', cursor: 'pointer' }}
                  onClick={async () => {
                    console.log('Save All button clicked!');
                    console.log('submissionCompleted:', submissionCompleted);
                    console.log('user:', user);
                    
                    if (submissionCompleted) {
                      console.log('Resetting form for new submission');
                      resetFormForNewSubmission();
                      return;
                    }
                    
                    console.log('Starting validation...');
                    setSaveAllError('');
                    setSaveAllSuccess(false);
                    // Validate user
                    if (!user || !user.username || !user.email) {
                      console.log('User validation failed');
                      setSaveAllError('You must be logged in to submit.');
                      return;
                    }
                    console.log('User validation passed');
                      
                      // Validate AI Application Card for "Create Your Own"
                      if (exampleCases[selectedCaseIdx].title === 'Create Your Own') {
                        if (!customConceptCard.title || customConceptCard.title.trim() === '') {
                          setErrorModal({ isOpen: true, message: 'Title is required for the AI Application Card. Please fill in the Title field before saving.' });
                          return;
                        }
                        if (!customConceptCard.description || customConceptCard.description.trim() === '') {
                          setErrorModal({ isOpen: true, message: 'Description is required for the AI Application Card. Please fill in the Description field before saving.' });
                          return;
                        }
                      }
                      
                    // Validate all cases
                    let hasError = false;
                    const newCaseErrors = {};
                    console.log('Validating cases:', caseCards);
                    console.log('Number of cases:', caseCards.length);
                    
                    caseCards.forEach((card, idx) => {
                      console.log(`Validating case ${idx}:`, card);
                      const errors = {};
                      if (!card.summary || card.summary.trim() === '') {
                        errors.summary = 'Case Theme is required.';
                        console.log(`Case ${idx}: Missing summary`);
                      }
                      if (!card.caseText || card.caseText.trim() === '') {
                        errors.caseText = 'Case Narrative is required.';
                        console.log(`Case ${idx}: Missing caseText`);
                      }
                      if (!card.values || card.values.length === 0) {
                        errors.values = 'At least one Value is required.';
                        console.log(`Case ${idx}: Missing values. Current values:`, card.values);
                      }
                      if (Object.keys(errors).length > 0) {
                        newCaseErrors[idx] = errors;
                        hasError = true;
                        console.log(`Case ${idx} has errors:`, errors);
                      } else {
                        console.log(`Case ${idx}: No errors`);
                      }
                    });
                    setCaseErrors(newCaseErrors);
                    if (hasError) {
                      setSaveAllError('Please fix errors in all cases before submitting.');
                      console.log('Validation failed. Errors:', newCaseErrors);
                      return;
                    }
                    
                    console.log('Validation passed. Showing confirmation modal.');
                    console.log('Setting showConfirmModal to true');
                    console.log('Current showConfirmModal before setting:', showConfirmModal);
                    
                    // Show confirmation modal
                    setShowConfirmModal(true);
                    
                    // Check if state was updated
                    setTimeout(() => {
                      console.log('showConfirmModal after setting:', showConfirmModal);
                    }, 100);
                  }}
                >
                    Save All
                </button>
                
                <button
                  className="green-btn polished-btn"
                    style={{ fontSize: '1rem', padding: '0.8rem 2.5rem', borderRadius: 12, fontWeight: 700, background: '#fff', color: '#16a34a', border: '2px solid #bbf7d0', boxShadow: '0 2px 8px rgba(34,197,94,0.07)', cursor: 'pointer' }}
                  onClick={() => navigate(`/group-submissions/${encodeURIComponent(groupName)}`)}
                >
                  Review Group Submission
                </button>
                </div>
                
                {saveAllError && <div style={{ color: '#dc2626', fontWeight: 600, marginTop: 8 }}>{saveAllError}</div>}
                {saveAllSuccess && <div style={{ color: '#16a34a', fontWeight: 700, marginTop: 8 }}>✅ Submission saved successfully! Your case studies have been submitted to the group.</div>}
              </div>
            </>
          </div>
        </div>
        <ErrorModal 
          isOpen={errorModal.isOpen} 
          message={errorModal.message} 
          onClose={closeErrorModal} 
        />
        {/* Search Tensions Modal - Moved inside main component */}
        {console.log('Rendering tension modal, showTensionModal:', showTensionModal)}
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
            zIndex: 100000
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
                color: '#0c4a6e'
              }}>
                <strong>Instructions:</strong> Select/create one or more value tensions from the sections below. Your selected value tensions will appear in the panel, where you can review and edit their definitions before adding them to your case(s).
              </div>

              {/* Your Tension History */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: '#16a34a', fontWeight: 600, marginBottom: '1rem' }}>
                  Your Tension History
                </h4>
                {userTensionHistory.length > 0 ? (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: '12px' 
                  }}>
                    {userTensionHistory.map((tension, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleTensionSelection(tension)}
                        style={{
                          background: selectedTensions.some(t => t.value === tension.value && t.definition === tension.definition) 
                            ? '#dcfce7' 
                            : '#fff',
                          border: selectedTensions.some(t => t.value === tension.value && t.definition === tension.definition)
                            ? '2px solid #16a34a'
                            : '1px solid #d1d5db',
                          borderRadius: 8,
                          padding: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          position: 'relative'
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
                        <div style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          display: 'flex',
                          gap: '0.25rem'
                        }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTension(idx);
                            }}
                            style={{
                              background: '#16a34a',
                              color: 'white',
                              border: 'none',
                              borderRadius: 4,
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTension(idx);
                            }}
                            style={{
                              background: '#dc2626',
                              color: 'white',
                              border: 'none',
                              borderRadius: 4,
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            Delete
                          </button>
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

              {/* Predefined Tensions */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: '#16a34a', fontWeight: 600, marginBottom: '1rem' }}>
                  Predefined Tensions
                </h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                  gap: '1rem' 
                }}>
                  {predefinedTensions.map((tension, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleTensionSelection(tension)}
                      style={{
                        background: selectedTensions.some(t => t.value === tension.value && t.definition === tension.definition) 
                          ? '#dcfce7' 
                          : '#fff',
                        border: selectedTensions.some(t => t.value === tension.value && t.definition === tension.definition)
                          ? '2px solid #16a34a'
                          : '1px solid #d1d5db',
                        borderRadius: 8,
                        padding: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ fontWeight: 600, color: '#16a34a', marginBottom: '0.5rem' }}>
                        {tension.value}
                        {selectedTensions.some(t => t.value === tension.value && t.definition === tension.definition) && (
                          <span style={{ marginLeft: '8px', fontSize: '0.8rem' }}>✓</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#374151' }}>
                        {tension.definition}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Tensions Panel */}
              {console.log('selectedTensions.length:', selectedTensions.length)}
              {selectedTensions.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ color: '#16a34a', fontWeight: 600, marginBottom: '1rem' }}>
                    Selected Tensions from Search ({selectedTensions.length})
                  </h4>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: '12px' 
                  }}>
                    {selectedTensions.map((tension, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#fff',
                          border: '1px solid #d1d5db',
                          borderRadius: 8,
                          padding: '12px',
                          position: 'relative',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ 
                          fontWeight: 600, 
                          color: '#16a34a', 
                          marginBottom: '4px',
                          textAlign: 'left'
                        }}>
                          {tension.value}
                        </div>
                        <div style={{ 
                          fontSize: '0.85rem', 
                          color: '#374151', 
                          lineHeight: 1.4, 
                          textAlign: 'left',
                          marginBottom: '8px'
                        }}>
                          {tension.definition}
                        </div>
                        <div style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          display: 'flex',
                          gap: '0.25rem'
                        }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Edit tension clicked for index:', idx);
                              console.log('Tension to edit:', tension);
                              setNewTension({ value: tension.value, definition: tension.definition });
                              setShowCreateTensionModal(true);
                              setEditingSelectedTensionIndex(idx);
                              setEditingTensionIndex(-1);
                            }}
                            style={{
                              background: '#16a34a',
                              color: 'white',
                              border: 'none',
                              borderRadius: 4,
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTensions(prev => prev.filter((_, index) => index !== idx));
                            }}
                            style={{
                              background: '#dc2626',
                              color: 'white',
                              border: 'none',
                              borderRadius: 4,
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Create Your Own Tension Button */}
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <button
                  onClick={() => {
                    console.log('Create Your Own Tension button clicked!');
                    console.log('Current showCreateTensionModal state:', showCreateTensionModal);
                    setShowCreateTensionModal(true);
                    console.log('Set showCreateTensionModal to true');
                  }}
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
                  Create Your Own Tension
                </button>
              </div>

              {/* Action Buttons */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderTop: '1px solid #e5e7eb',
                paddingTop: '1rem'
              }}>
                <button
                  onClick={() => {
                    setShowTensionModal(false);
                    setSelectedTensions([]);
                  }}
                  style={{
                    background: '#fff',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    padding: '0.6rem 1.2rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyTensionsToPool}
                  disabled={selectedTensions.length === 0}
                  style={{
                    background: selectedTensions.length === 0 ? '#d1d5db' : '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    padding: '0.6rem 1.2rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: selectedTensions.length === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Apply to Pool ({selectedTensions.length})
                </button>
              </div>
            </div>
          </div>
        )}
      </DndProvider>
    );
  }

  // Phase 2: Show value cards/tensions, all notes/values now editable
  if (phase === 2) {
    return (
      <DndProvider backend={HTML5Backend}>
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ color: '#16a34a', textAlign: 'center', marginBottom: 32, fontSize: '2.3rem', fontWeight: 800, letterSpacing: '-1px' }}>Phase 2: Value Cards & Tensions</h2>
          <div style={{ display: 'flex', flexDirection: 'row', width: '100%', maxWidth: 1200, margin: '0 auto', alignItems: 'flex-start', justifyContent: 'center', gap: 32 }}>
            {/* Left column: Value cards and tensions intro */}
            <div style={{ maxWidth: 520, minWidth: 400, background: 'rgba(230,250,237,0.97)', borderRadius: 22, boxShadow: '0 4px 24px rgba(34,197,94,0.10)', padding: '2rem 1.5rem 2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '2.5px solid #bbf7d0' }}>
              <div style={{ color: '#16a34a', fontWeight: 800, fontSize: '1.20rem', textAlign: 'center', marginBottom: 18, letterSpacing: '-0.5px' }}>What are Responsible AI values?</div>
              <div style={{ color: '#388e5c', textAlign: 'center', fontSize: '1.00rem', marginBottom: 22, fontWeight: 500, lineHeight: 1.6 }}>These are ethical principles that guide how AI should be designed, used, and governed to benefit people and society. They help ensure AI is fair, safe, transparent, and aligned with human needs and rights.</div>
              <div style={{ color: '#16a34a', fontWeight: 700, fontSize: '1.13rem', marginBottom: 10, textAlign: 'center' }}>Value Cards</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, width: '100%', marginBottom: 18 }}>
                {valueCards.map((card, idx) => (
                  <DraggableValueCard
                    key={card.value + card.definition}
                    card={card}
                    isCustom={idx >= 3}
                    onDelete={() => setValueCards(cards => cards.filter((c, i) => i !== idx))}
                    onEdit={(newValue, newDefinition) => handleEditValueCard(idx, newValue, newDefinition)}
                    onClick={() => handleClickValueCard(card)}
                  />
                ))}
              </div>
              {clickToAddError && <div style={{ color: '#dc2626', fontWeight: 600, marginBottom: 8 }}>{clickToAddError}</div>}
              {/* Add Value Card Button and Form */}
              <div style={{ width: '100%', textAlign: 'center', marginBottom: 18 }}>
                {!showAddValue ? (
                  <button
                    className="green-btn polished-btn"
                    style={{ fontSize: '1rem', padding: '0.8rem 2.5rem', borderRadius: 12, fontWeight: 700, background: '#fff', color: '#16a34a', border: '2px solid #bbf7d0', marginTop: 8, boxShadow: '0 2px 8px rgba(34,197,94,0.07)', cursor: 'pointer' }}
                    onClick={() => setShowAddValue(true)}
                  >
                    + Add Value Card
                  </button>
                ) : (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      if (newValue.trim() && newValueDef.trim()) {
                        setValueCards(cards => [...cards, { value: newValue.trim(), definition: newValueDef.trim() }]);
                        setNewValue('');
                        setNewValueDef('');
                        setShowAddValue(false);
                      }
                    }}
                    style={{
                      background: '#fff',
                      borderRadius: 14,
                      border: '2px solid #bbf7d0',
                      boxShadow: '0 2px 8px rgba(34,197,94,0.07)',
                      padding: '1.1rem 1.1rem 1.1rem 1.1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 10,
                      margin: '0 auto',
                      maxWidth: 260,
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Value name (one word)"
                      value={newValue}
                      onChange={e => setNewValue(e.target.value)}
                      style={{ width: '100%', marginBottom: 8, padding: '0.5rem', borderRadius: 8, border: '1.5px solid #bbf7d0', fontWeight: 600, fontSize: '1.05rem' }}
                      required
                    />
                    <textarea
                      placeholder="Definition (sentence or two)"
                      value={newValueDef}
                      onChange={e => setNewValueDef(e.target.value)}
                      rows={2}
                      style={{ width: '100%', marginBottom: 8, padding: '0.5rem', borderRadius: 8, border: '1.5px solid #bbf7d0', fontSize: '0.9rem' }}
                      required
                    />
                    <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                      <button type="submit" className="green-btn polished-btn" style={{ flex: 1, fontWeight: 700, borderRadius: 8 }}>Add</button>
                      <button type="button" style={{ flex: 1, background: '#fff', color: '#16a34a', border: '1.5px solid #bbf7d0', borderRadius: 8, padding: '0.5rem 0', fontWeight: 600, cursor: 'pointer' }} onClick={() => setShowAddValue(false)}>Cancel</button>
                    </div>
                  </form>
                )}
              </div>
              <div style={{ color: '#16a34a', fontWeight: 700, fontSize: '1.13rem', margin: '18px 0 10px 0', textAlign: 'center' }}>Value Tensions</div>
              <div style={{ color: '#388e5c', textAlign: 'center', fontSize: '1.00rem', marginBottom: 18, fontWeight: 500, lineHeight: 1.5 }}>Sometimes, important goals or values can pull in different directions. Some common tensions include:</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, width: '100%', marginBottom: 18 }}>
                {tensionCards.map((card, idx) => (
                  <DraggableTensionCard
                    key={card.value + card.definition}
                    card={card}
                    isCustom={idx >= 2}
                    onDelete={() => setTensionCards(cards => cards.filter((c, i) => i !== idx))}
                    onEdit={(newValue, newDefinition) => handleEditTensionCard(idx, newValue, newDefinition)}
                    onClick={() => handleClickTensionCard(card)}
                  />
                ))}
              </div>
              {/* Add Tension Card Button and Form */}
              <div style={{ width: '100%', textAlign: 'center', marginBottom: 18 }}>
                {!showAddTension ? (
                  <button
                    className="green-btn polished-btn"
                    style={{ fontSize: '1rem', padding: '0.8rem 2.5rem', borderRadius: 12, fontWeight: 700, background: '#fff', color: '#16a34a', border: '2px solid #bbf7d0', marginTop: 8, boxShadow: '0 2px 8px rgba(34,197,94,0.07)', cursor: 'pointer' }}
                    onClick={() => setShowAddTension(true)}
                  >
                    + Add Tension Card
                  </button>
                ) : (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      if (newTension.trim() && newTensionDef.trim()) {
                        setTensionCards(cards => [...cards, { value: newTension.trim(), definition: newTensionDef.trim() }]);
                        setNewTension('');
                        setNewTensionDef('');
                        setShowAddTension(false);
                      }
                    }}
                    style={{
                      background: '#fff',
                      borderRadius: 14,
                      border: '2px solid #bbf7d0',
                      boxShadow: '0 2px 8px rgba(34,197,94,0.07)',
                      padding: '1.1rem 1.1rem 1.1rem 1.1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 10,
                      margin: '0 auto',
                      maxWidth: 260,
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Tension name (one word)"
                      value={newTension}
                      onChange={e => setNewTension(e.target.value)}
                      style={{ width: '100%', marginBottom: 8, padding: '0.5rem', borderRadius: 8, border: '1.5px solid #bbf7d0', fontWeight: 600, fontSize: '1.05rem' }}
                      required
                    />
                    <textarea
                      placeholder="Definition (sentence or two)"
                      value={newTensionDef}
                      onChange={e => setNewTensionDef(e.target.value)}
                      rows={2}
                      style={{ width: '100%', marginBottom: 8, padding: '0.5rem', borderRadius: 8, border: '1.5px solid #bbf7d0', fontSize: '0.9rem' }}
                      required
                    />
                    <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                      <button type="submit" className="green-btn polished-btn" style={{ flex: 1, fontWeight: 700, borderRadius: 8 }}>Add</button>
                      <button type="button" style={{ flex: 1, background: '#fff', color: '#16a34a', border: '1.5px solid #bbf7d0', borderRadius: 8, padding: '0.5rem 0', fontWeight: 600, cursor: 'pointer' }} onClick={() => setShowAddTension(false)}>Cancel</button>
                    </div>
                  </form>
                )}
              </div>
              
            </div>
            {/* Right column: Group notes sections */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', justifyContent: 'flex-start', minWidth: 400, maxWidth: 520 }}>
              {noteBoards.map((board, idx) => (
                <div key={idx} style={{ background: 'linear-gradient(135deg, #f6fff9 0%, #e6faed 100%)', borderRadius: 22, padding: '2rem 1.5rem 1.5rem 1.5rem', width: 400, minHeight: 420, boxShadow: '0 8px 32px rgba(34,197,94,0.13)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', border: '2.5px solid #bbf7d0', position: 'relative', animation: 'fadeInCard 0.7s', transition: 'box-shadow 0.2s, border 0.2s' }}>
                  <div style={{ fontWeight: 600, color: '#16a34a', marginBottom: 18, fontSize: '1.25rem', letterSpacing: '-0.5px', textShadow: '0 2px 8px #e6faed' }}>{`Note ${idx + 1}`}</div>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <textarea
                      value={board.notes}
                      onChange={e => handleNoteChange(idx, e.target.value)}
                      rows={8}
                      style={{ width: '100%', minHeight: 120, borderRadius: 14, border: '2.5px solid #bbf7d0', padding: '1.1rem 1rem 0.7rem 1rem', fontSize: '1.00rem', background: '#222', color: '#e6faed', fontWeight: 500, boxShadow: '0 2px 12px rgba(34,197,94,0.07)', outline: 'none', transition: 'border 0.22s, box-shadow 0.22s', resize: 'vertical', marginBottom: 0, borderColor: board.notes.length > 0 ? '#16a34a' : '#bbf7d0' }}
                      placeholder=" "
                      onFocus={e => e.target.style.boxShadow = '0 0 0 3px #bbf7d0, 0 2px 12px rgba(34,197,94,0.13)'}
                      onBlur={e => e.target.style.boxShadow = '0 2px 12px rgba(34,197,94,0.07)'}
                    />
                    <label style={{ position: 'absolute', left: 18, top: 10, color: board.notes.length > 0 ? '#16a34a' : '#bbf7d0', fontSize: board.notes.length > 0 ? '0.95rem' : '0.90rem', fontWeight: 600, pointerEvents: 'none', transition: 'all 0.18s', opacity: 0.95 }}>Enter your group notes</label>
                  </div>
                  {/* Drop area for value/tension cards */}
                  <DropValueArea values={board.values} onDrop={card => handleDropValue(idx, card)} onRemove={valueIdx => handleRemoveValue(idx, valueIdx)} />
                  <div style={{ width: '100%', marginTop: 8 }}>
                    <label style={{ color: '#4f46e5', fontWeight: 500, fontSize: '0.98em' }}>Comments:</label>
                    <textarea value={board.comments} onChange={e => handleCommentChange(idx, e.target.value)} rows={2} style={{ width: '100%', borderRadius: 8, border: '1.5px solid #bbf7d0', padding: '0.5rem', fontSize: '0.98rem', marginTop: 2 }} placeholder="Add comments or clarifications..." />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Contribute Your Own Case button at the bottom */}
        <div style={{ width: '100%', textAlign: 'center', margin: '48px 0 0 0', display: 'flex', justifyContent: 'center' }}>
          <button
            className="green-btn polished-btn"
            style={{ fontSize: '1.18rem', padding: '1.1rem 3.2rem', borderRadius: 14, fontWeight: 800, background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)', color: '#fff', border: 'none', boxShadow: '0 6px 24px rgba(34,197,94,0.13)', letterSpacing: '0.01em', transition: 'background 0.2s, box-shadow 0.2s, transform 0.1s', cursor: 'pointer', margin: '0 auto', display: 'block' }}
            onMouseOver={e => { e.currentTarget.style.background = 'linear-gradient(90deg, #16a34a 0%, #22c55e 100%)'; e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(34,197,94,0.18)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(34,197,94,0.13)'; }}
            onClick={() => navigate(`/focus-group/${encodeURIComponent(groupName)}/contribute`)}
          >
            Contribute Your Own Case
          </button>
        </div>
        {/* ... just above the 'Contribute Your Own Case' button, add: */}
        <div style={{ width: '100%', maxWidth: 1100, margin: '32px auto 0 auto', padding: '2rem 0', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 18 }}>
            <input
              type="text"
              placeholder="Your Name (required)"
              value={user.username}
              onChange={e => setUsername(e.target.value)}
              style={{ padding: '0.7rem 1.2rem', borderRadius: 8, border: '1.5px solid #bbf7d0', fontSize: '1.08rem', minWidth: 220 }}
              required
            />
            <input
              type="email"
              placeholder="Your Email (required)"
              value={user.email}
              onChange={e => setEmail(e.target.value)}
              style={{ padding: '0.7rem 1.2rem', borderRadius: 8, border: '1.5px solid #bbf7d0', fontSize: '1.08rem', minWidth: 220 }}
              required
            />
          </div>
          <button
            className="green-btn polished-btn"
            style={{ fontSize: '1rem', padding: '0.8rem 2.5rem', borderRadius: 12, fontWeight: 800, background: '#16a34a', color: '#fff', border: 'none', boxShadow: '0 2px 8px rgba(34,197,94,0.07)', cursor: 'pointer', marginBottom: 12 }}
            onClick={async () => {
              if (submissionCompleted) {
                resetFormForNewSubmission();
                return;
              }
              
              setSaveAllError('');
              setSaveAllSuccess(false);
              // Validate user
              if (!user || !user.username || !user.email) {
                setSaveAllError('You must be logged in to submit.');
                return;
              }
              
              // Validate AI Application Card for "Create Your Own"
              if (exampleCases[selectedCaseIdx].title === 'Create Your Own') {
                if (!customConceptCard.title || customConceptCard.title.trim() === '') {
                  setErrorModal({ isOpen: true, message: 'Title is required for the AI Application Card. Please fill in the Title field before saving.' });
                  return;
                }
                if (!customConceptCard.description || customConceptCard.description.trim() === '') {
                  setErrorModal({ isOpen: true, message: 'Description is required for the AI Application Card. Please fill in the Description field before saving.' });
                  return;
                }
              }
              
              // Validate all cases
              let hasError = false;
              const newCaseErrors = {};
              caseCards.forEach((card, idx) => {
                const errors = {};
                if (!card.summary || card.summary.trim() === '') errors.summary = 'Case Theme is required.';
                if (!card.caseText || card.caseText.trim() === '') errors.caseText = 'Case Narrative is required.';
                if (!card.values || card.values.length === 0) errors.values = 'At least one Value is required.';
                if (Object.keys(errors).length > 0) {
                  newCaseErrors[idx] = errors;
                  hasError = true;
                }
              });
              setCaseErrors(newCaseErrors);
              if (hasError) {
                setSaveAllError('Please fix errors in all cases before submitting.');
                return;
              }
              let conceptCard = {};
              const selectedCase = exampleCases[selectedCaseIdx];
              if (selectedCase.title === 'Create Your Own') {
                conceptCard = customConceptCard;
              } else {
              conceptCard = conceptCardTemplates[selectedCase.title];
              }
              const group = groupName || '';
              const cases = caseCards.map(card => ({
                summary: card.summary,
                subject: card.subject,
                grade: card.grade,
                date: card.date,
                caseText: card.caseText,
                values: card.values,
                tensions: card.tensions,
                status: 'pending',
                group
              }));
              const submission = {
                conceptCard,
                cases,
                username: user.username,
                email: user.email,
                submittedAt: new Date().toISOString(),
                status: 'pending',
                group: groupName || ''
              };
              try {
                const res = await fetch('/api/case-studies-focus-group', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(submission)
                });
                if (res.ok) {
                  setSaveAllSuccess(true);
                  setSaveAllError('');
                  setSubmissionCompleted(true);
                } else {
                  setSaveAllError('Failed to save. Please try again.');
                }
              } catch (err) {
                setSaveAllError('Failed to save. Please try again.');
              }
            }}
          >
            {submissionCompleted ? 'Submit Another' : 'Save All'}
          </button>
          {saveAllError && <div style={{ color: '#dc2626', fontWeight: 600, marginTop: 8 }}>{saveAllError}</div>}
          {saveAllSuccess && <div style={{ color: '#16a34a', fontWeight: 700, marginTop: 8 }}>Submission saved successfully!</div>}
        </div>


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
                  width: '90%'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    <h3 style={{ color: '#16a34a', fontWeight: 700, fontSize: '1.2rem', margin: 0 }}>
                      {editingTensionIndex >= 0 ? 'Edit Tension' : 'Create Your Own Tension'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowCreateTensionModal(false);
                        setNewTension({ value: '', definition: '' });
                        setEditingTensionIndex(-1);
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
                      placeholder="e.g., Privacy vs. Utility, Accuracy vs. Fairness"
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
                      placeholder="Describe the tension between competing values in AI systems..."
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
                      {editingTensionIndex >= 0 ? 'Update Tension' : 'Create Tension'}
                    </button>
                  </div>
                </div>
              </div>
            

            {/* Debug: Show modal state */}
            
            {/* Example Modal */}
            {showExampleModal && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10000,
              }}>
                <div style={{
                  background: '#ffff00',
                  borderRadius: 14,
                  border: '3px solid #ff0000',
                  boxShadow: '0 2px 8px rgba(34,197,94,0.05)',
                  padding: '1.5rem',
                  maxWidth: '800px',
                  width: '90%',
                  maxHeight: '90vh',
                  overflow: 'auto',
                  position: 'relative',
                }}>
                  {/* Header */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '1.5rem',
                    borderBottom: '1px solid #e5e7eb',
                    paddingBottom: '1rem'
                  }}>
                    <h3 style={{ 
                      color: '#16a34a', 
                      fontSize: '1.25rem', 
                      fontWeight: 700, 
                      margin: 0 
                    }}>
                      Example Case
                    </h3>
                    <button
                      onClick={() => setShowExampleModal(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: '#9ca3af',
                        padding: '0.25rem',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      ×
                    </button>
                  </div>

                  {/* Example Case Content - Same layout as real case */}
                  <div style={{ flex: 1 }}>
                    {/* Case Theme */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
                        Case Theme
                        <Tooltip text="Briefly describe the main theme of this case. For example: Ethical concern about student engagement monitoring.">?</Tooltip>
                      </label>
                      <input
                        type="text"
                        value={exampleCase.summary}
                        readOnly
                        style={{ 
                          width: '100%', 
                          padding: '0.5em 1em', 
                          borderRadius: 8, 
                          border: '1.5px solid #bbf7d0', 
                          fontWeight: 500, 
                          fontSize: '0.9rem', 
                          marginTop: 2, 
                          marginBottom: 10,
                          backgroundColor: '#f9fafb',
                          color: '#374151'
                        }}
                      />
                    </div>

                    {/* Subject | Grade | Date */}
                    <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
                      <div style={{ flex: 1, minWidth: 120 }}>
                        <label style={{ fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
                          Subject (optional)
                          <Tooltip text="Indicate the academic subject(s) relevant to this case, if applicable.">?</Tooltip>
                        </label>
                        <input 
                          type="text" 
                          value={exampleCase.subject} 
                          readOnly
                          style={{ 
                            width: '100%', 
                            padding: '0.5em', 
                            borderRadius: 8, 
                            border: '1.5px solid #bbf7d0', 
                            fontWeight: 500, 
                            fontSize: '0.9rem', 
                            marginTop: 2,
                            backgroundColor: '#f9fafb',
                            color: '#374151'
                          }} 
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 120 }}>
                        <label style={{ fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
                          Grade (optional)
                          <Tooltip text="Specify the student grade level(s) involved in the case, if applicable.">?</Tooltip>
                        </label>
                        <input 
                          type="text" 
                          value={exampleCase.grade} 
                          readOnly
                          style={{ 
                            width: '100%', 
                            padding: '0.5em', 
                            borderRadius: 8, 
                            border: '1.5px solid #bbf7d0', 
                            fontWeight: 500, 
                            fontSize: '0.9rem', 
                            marginTop: 2,
                            backgroundColor: '#f9fafb',
                            color: '#374151'
                          }} 
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 120 }}>
                        <label style={{ fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
                          Date of Event (optional)
                          <Tooltip text="When did this incident happen, if applicable.">?</Tooltip>
                        </label>
                        <input 
                          type="date" 
                          value={exampleCase.date} 
                          readOnly
                          style={{ 
                            width: '100%', 
                            padding: '0.5em', 
                            borderRadius: 8, 
                            border: '1.5px solid #bbf7d0', 
                            fontWeight: 500, 
                            fontSize: '0.9rem', 
                            marginTop: 2,
                            backgroundColor: '#f9fafb',
                            color: '#374151'
                          }} 
                        />
                      </div>
                    </div>

                    {/* Impacted Population(s) */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
                        Impacted Population(s)
                        <Tooltip text="Describe the situation in detail, including who was involved in the case you're sharing.">?</Tooltip>
                      </label>
                      <input
                        type="text"
                        value={exampleCase.impactedPop}
                        readOnly
                        style={{ 
                          width: '100%', 
                          padding: '0.5em 1em', 
                          borderRadius: 8, 
                          border: '1.5px solid #bbf7d0', 
                          fontWeight: 500, 
                          fontSize: '0.9rem', 
                          marginTop: 2, 
                          marginBottom: 10,
                          backgroundColor: '#f9fafb',
                          color: '#374151'
                        }}
                      />
                    </div>

                    {/* Case Narrative */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
                        Case Narrative
                        <Tooltip text="Provide a detailed account of the case. Include context, actions taken, people involved (e.g., teachers, students), and how the AI system was used or affected the situation.">?</Tooltip>
                      </label>
                      <textarea 
                        value={exampleCase.caseText} 
                        readOnly
                        rows={7} 
                        style={{ 
                          width: '100%', 
                          padding: '0.6em 1em', 
                          borderRadius: 8, 
                          border: '1.5px solid #bbf7d0', 
                          fontWeight: 500, 
                          fontSize: '1.05rem', 
                          marginTop: 2, 
                          resize: 'vertical', 
                          minHeight: 120,
                          backgroundColor: '#f9fafb',
                          color: '#374151'
                        }} 
                      />
                    </div>

                    {/* Values | Value Tensions */}
                    <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <label style={{ fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
                          Values
                          <Tooltip text="The core ethical or educational principle supported in this case. You may select from existing values, refine one to better fit your case, or define a new one if needed.">?</Tooltip>
                        </label>
                        <div style={{ minHeight: 48, background: '#f1f5f9', border: '1.5px dashed #bbf7d0', borderRadius: 8, padding: '0.5em', marginTop: 2 }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {exampleCase.values.map((v, vi) => (
                              <span key={v.value} style={{ 
                                background: '#16a34a', 
                                color: '#fff', 
                                borderRadius: 6, 
                                padding: '0.25rem 0.5rem', 
                                fontWeight: 500, 
                                fontSize: '0.8rem', 
                                display: 'flex', 
                                alignItems: 'center',
                                border: '1px solid #16a34a'
                              }}>
                                {v.value}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <label style={{ fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
                          Value Tensions
                          <Tooltip text="The competing values or principles that create tension in this case. You may select from existing tensions, refine one to better fit your case, or define a new one if needed.">?</Tooltip>
                        </label>
                        <div style={{ minHeight: 48, background: '#f1f5f9', border: '1.5px dashed #bbf7d0', borderRadius: 8, padding: '0.5em', marginTop: 2 }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {exampleCase.tensions.map((t, ti) => (
                              <span key={t.value} style={{ 
                                background: '#f59e0b', 
                                color: '#fff', 
                                borderRadius: 6, 
                                padding: '0.25rem 0.5rem', 
                                fontWeight: 500, 
                                fontSize: '0.8rem', 
                                display: 'flex', 
                                alignItems: 'center',
                                border: '1px solid #f59e0b'
                              }}>
                                {t.value}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

        <ErrorModal 
          isOpen={errorModal.isOpen} 
          message={errorModal.message} 
          onClose={closeErrorModal} 
        />
        
        {/* Always visible debug text */}
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'blue',
          color: 'white',
          padding: '10px',
          zIndex: 99999999,
          fontSize: '16px'
        }}>
          DEBUG: showConfirmModal = {showConfirmModal ? 'true' : 'false'}
        </div>
        
        {/* Test Modal - Simple red box */}
        {showConfirmModal && (
          <div style={{
            position: 'fixed',
            top: '50px',
            left: '50px',
            background: 'red',
            color: 'white',
            padding: '20px',
            zIndex: 99999999,
            fontSize: '24px',
            border: '3px solid black'
          }}>
            TEST MODAL - SHOULD BE VISIBLE!
          </div>
        )}
        
        {/* Confirmation Modal - Moved to main component area */}
        {console.log('Checking showConfirmModal in render:', showConfirmModal)}
        {showConfirmModal && (
          console.log('showConfirmModal is true, rendering confirmation modal'),
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
            zIndex: 9999999
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
                Submit {caseCards.length} case{caseCards.length !== 1 ? 's' : ''} to the group "{groupName}"?
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
          <div style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            background: 'red',
            color: 'white',
            padding: '10px',
            zIndex: 99999999,
            fontSize: '20px'
          }}>
            DEBUG: Confirmation Modal Should Be Visible!
          </div>

            

      </DndProvider>
    );
  }

  // Fallback for other phases or initial state
  return null;
};

export default FocusGroupPage; 