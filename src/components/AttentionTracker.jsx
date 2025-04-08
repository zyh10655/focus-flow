// src/components/AttentionTracker.jsx
import React from 'react';

function AttentionTracker({ currentLevel, onLevelChange }) {
  return (
    <div className="attention-tracker">
      <h3>Current Attention Level</h3>
      <div className="attention-buttons">
        <button 
          className={currentLevel === 'low' ? 'active' : ''} 
          onClick={() => onLevelChange('low')}
        >
          Low
        </button>
        <button 
          className={currentLevel === 'medium' ? 'active' : ''} 
          onClick={() => onLevelChange('medium')}
        >
          Medium
        </button>
        <button 
          className={currentLevel === 'high' ? 'active' : ''} 
          onClick={() => onLevelChange('high')}
        >
          High
        </button>
      </div>
    </div>
  );
}

export default AttentionTracker;