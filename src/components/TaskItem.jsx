// src/components/TaskItem.jsx (updated version)
import React, { useState } from 'react';

function TaskItem({ task, onUpdate, isRecommended, onStartFocusSession }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedTask, setEditedTask] = useState({...task});
  
  const handleSave = () => {
    onUpdate(editedTask);
    setIsEditing(false);
  };
  
  // Determine the appropriate styling based on difficulty and recommended status
  const getTaskClass = () => {
    let baseClass = "task-item";
    if (isRecommended) baseClass += " recommended";
    if (task.completed) baseClass += " completed";
    
    if (task.cognitiveDifficulty >= 4) {
      baseClass += " high-difficulty";
    } else if (task.cognitiveDifficulty >= 2) {
      baseClass += " medium-difficulty";
    } else {
      baseClass += " low-difficulty";
    }
    
    return baseClass;
  };

  if (isEditing) {
    return (
      <div className={getTaskClass()}>
        <input
          type="text"
          value={editedTask.title}
          onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
          className="task-title-input"
        />
        <div className="task-edit-controls">
          <label>
            Priority:
            <select 
              value={editedTask.priority} 
              onChange={(e) => setEditedTask({...editedTask, priority: Number(e.target.value)})}
            >
              <option value="1">Low</option>
              <option value="2">Medium</option>
              <option value="3">High</option>
            </select>
          </label>
          <label>
            Cognitive Difficulty:
            <select 
              value={editedTask.cognitiveDifficulty} 
              onChange={(e) => setEditedTask({...editedTask, cognitiveDifficulty: Number(e.target.value)})}
            >
              <option value="1">Very Easy</option>
              <option value="2">Easy</option>
              <option value="3">Medium</option>
              <option value="4">Difficult</option>
              <option value="5">Very Difficult</option>
            </select>
          </label>
          <label>
            Description:
            <textarea
              value={editedTask.description || ''}
              onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
              rows="2"
            />
          </label>
          <div className="edit-buttons">
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={getTaskClass()}>
      <div className="task-header">
        <div className="task-title-area" onClick={() => setIsExpanded(!isExpanded)}>
          <h3 className={task.completed ? 'completed-title' : ''}>
            {task.title}
          </h3>
          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
        </div>
        <div className="task-controls">
          {!task.completed && (
            <button 
              className="focus-session-btn"
              onClick={() => onStartFocusSession(task)}
            >
              Focus
            </button>
          )}
          <button onClick={() => setIsEditing(true)}>Edit</button>
          <button 
            className={task.completed ? 'reopen-btn' : 'complete-btn'}
            onClick={() => onUpdate({...task, completed: !task.completed})}
          >
            {task.completed ? 'Reopen' : 'Complete'}
          </button>
        </div>
      </div>
      <div className="task-details">
        <span className="task-priority">
          Priority: {task.priority === 3 ? 'High' : task.priority === 2 ? 'Medium' : 'Low'}
        </span>
        <span className="task-difficulty">
          Cognitive Difficulty: {task.cognitiveDifficulty}/5
        </span>
      </div>
      
      {isExpanded && (
        <div className="task-expanded">
          {task.description && (
            <div className="task-description">
              <h4>Description:</h4>
              <p>{task.description}</p>
            </div>
          )}
          
          {task.completed && task.focusScore && (
            <div className="task-completion-data">
              <h4>Completion Data:</h4>
              <div className="completion-stats">
                <div className="stat">
                  <span className="stat-label">Focus Score:</span>
                  <span className="stat-value">{Math.round(task.focusScore)}/100</span>
                </div>
                {task.sessionDuration && (
                  <div className="stat">
                    <span className="stat-label">Duration:</span>
                    <span className="stat-value">
                      {Math.round(task.sessionDuration)} min
                    </span>
                  </div>
                )}
                {task.distractions !== undefined && (
                  <div className="stat">
                    <span className="stat-label">Distractions:</span>
                    <span className="stat-value">{task.distractions}</span>
                  </div>
                )}
                {task.completedAt && (
                  <div className="stat">
                    <span className="stat-label">Completed:</span>
                    <span className="stat-value">
                      {new Date(task.completedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              
              {task.notes && (
                <div className="task-notes">
                  <h4>Notes:</h4>
                  <p>{task.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TaskItem;