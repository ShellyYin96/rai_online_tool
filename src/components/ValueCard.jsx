// Redesign the ValueCard component for a smaller, clearer, and more user-friendly UI.
// - Remove the large pill style.
// - Use a simple card: small header for value name, small trash icon top right, definition below (or on hover/expand).
// - White background, subtle border, padding, compact size.
// - Make the card visually clean for grid use.

// Add a small edit (pencil) icon next to the trash icon. When clicked, switch to edit mode.
// In edit mode, show Save and Cancel buttons. On Save, update value/definition and exit edit mode. On Cancel, discard changes.

import React, { useState } from 'react';
import './ValueCard.css';

const ValueCard = ({ value, definition, isBlank, onDefine, editable, onSave, onDelete, onClick }) => {
  const [showDef, setShowDef] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customValue, setCustomValue] = useState(value || '');
  const [customDef, setCustomDef] = useState(definition || '');

  if (isBlank) {
    return (
      <div className="value-card blank-card" tabIndex={0} onClick={e => { e.stopPropagation(); if (onDefine) onDefine(null); }}
        style={{ minWidth: 120, minHeight: 60, background: '#f8fafc', border: '1.5px dashed #bbf7d0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 600, color: '#16a34a', fontSize: '0.9rem' }}>
        + Define your own
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="value-card user-edit-card" tabIndex={0} style={{ minWidth: 140, minHeight: 90, background: '#fff', border: '1.5px solid #bbf7d0', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
        <input
          type="text"
          placeholder="Value name"
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
};

export default ValueCard; 