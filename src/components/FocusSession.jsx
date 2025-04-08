// src/components/FocusSession.jsx
import React, { useState, useEffect } from 'react';
import PomodoroTimer from './PomodoroTimer';

function FocusSession({ currentTask, onTaskComplete, onTaskUpdate, onExit }) {
  const [notes, setNotes] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [focusScore, setFocusScore] = useState(null);
  const [distractions, setDistractions] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  
  useEffect(() => {
    // Record start time when component mounts
    setStartTime(new Date());
    
    // Set up beforeunload event to warn if leaving during session
    const handleBeforeUnload = (e) => {
      if (!sessionComplete) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sessionComplete]);
  
  const handleFocusComplete = () => {
    // Calculate focus score (example algorithm)
    const duration = (new Date() - startTime) / 1000 / 60; // in minutes
    const score = Math.max(0, 100 - (distractions * 10));
    
    setFocusScore(score);
    setSessionComplete(true);
  };
  
  const handleReportDistraction = () => {
    setDistractions(prev => prev + 1);
  };
  
  const handleCompleteTask = () => {
    // Update task with completion data
    const updatedTask = {
      ...currentTask,
      completed: true,
      completedAt: new Date().toISOString(),
      focusScore,
      sessionDuration: (new Date() - startTime) / 1000 / 60, // in minutes
      distractions,
      notes
    };
    
    onTaskComplete(updatedTask);
    onExit();
  };
  
  const handleContinueTask = () => {
    // Update task with progress data but don't mark as complete
    const updatedTask = {
      ...currentTask,
      lastWorkedOn: new Date().toISOString(),
      notes: currentTask.notes ? `${currentTask.notes}\n\n${notes}` : notes
    };
    
    onTaskUpdate(updatedTask);
    onExit();
  };
  
  return (
    <div className="focus-session">
      <div className="session-header">
        <h2>Focus Session</h2>
        <button className="exit-session-btn" onClick={onExit}>Exit</button>
      </div>
      
      <div className="task-info">
        <h3>Current Task: {currentTask.title}</h3>
        <div className="task-meta">
          <span className="difficulty">Difficulty: {currentTask.cognitiveDifficulty}/5</span>
          <span className="priority">
            Priority: {currentTask.priority === 3 ? 'High' : 
                      currentTask.priority === 2 ? 'Medium' : 'Low'}
          </span>
        </div>
        {currentTask.description && (
          <div className="task-description">{currentTask.description}</div>
        )}
      </div>
      
      <div className="session-timer">
        <PomodoroTimer 
          onFocusComplete={handleFocusComplete}
          onBreakComplete={() => {}}
        />
      </div>
      
      {!sessionComplete ? (
        <div className="session-controls">
          <button 
            className="distraction-btn"
            onClick={handleReportDistraction}
          >
            Report Distraction
          </button>
          <div className="distraction-count">
            Distractions reported: {distractions}
          </div>
        </div>
      ) : (
        <div className="session-complete">
          <div className="session-summary">
            <h3>Session Complete!</h3>
            <div className="score-display">
              <div className="score-value">{Math.round(focusScore)}</div>
              <div className="score-label">Focus Score</div>
            </div>
            <div className="session-stats">
              <div className="stat">
                <span className="stat-label">Duration:</span>
                <span className="stat-value">
                  {Math.round((new Date() - startTime) / 1000 / 60)} minutes
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Distractions:</span>
                <span className="stat-value">{distractions}</span>
              </div>
            </div>
          </div>
          
          <div className="session-notes">
            <h4>Session Notes</h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you accomplish? Any observations about your focus?"
              rows={4}
            />
          </div>
          
          <div className="session-actions">
            <button 
              className="complete-task-btn"
              onClick={handleCompleteTask}
            >
              Complete Task
            </button>
            <button 
              className="continue-task-btn"
              onClick={handleContinueTask}
            >
              Save Progress & Continue Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FocusSession;