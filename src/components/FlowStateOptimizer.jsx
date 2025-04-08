// src/components/FlowStateOptimizer.jsx
import React, { useState, useEffect } from 'react';

function FlowStateOptimizer({ attentionHistory, currentTask, onTaskComplete }) {
  const [flowScore, setFlowScore] = useState(0);
  const [flowStatus, setFlowStatus] = useState('');
  const [flowTips, setFlowTips] = useState([]);
  const [taskStartTime, setTaskStartTime] = useState(null);
  const [checkIns, setCheckIns] = useState([]);

  // Start tracking when component mounts or task changes
  useEffect(() => {
    if (currentTask) {
      setTaskStartTime(new Date());
      setCheckIns([]);
    }
  }, [currentTask]);

  // Calculate flow score based on attention stability and check-ins
  const calculateFlowScore = () => {
    if (!attentionHistory || attentionHistory.length < 5) return 0;
    
    // Get recent attention entries
    const recentEntries = attentionHistory.slice(-5);
    
    // Calculate stability (less switching between levels = more stable)
    let switches = 0;
    for (let i = 1; i < recentEntries.length; i++) {
      if (recentEntries[i].level !== recentEntries[i-1].level) {
        switches++;
      }
    }
    
    const stabilityScore = Math.max(0, 100 - (switches * 20));
    
    // Calculate focus score based on high attention frequency
    const highFocusCount = recentEntries.filter(e => e.level === 'high').length;
    const focusScore = (highFocusCount / recentEntries.length) * 100;
    
    // Calculate engagement score based on check-ins
    const engagementScore = checkIns.length > 0 
      ? checkIns.reduce((sum, ci) => sum + ci.engagement, 0) / checkIns.length 
      : 0;
    
    // Combined score
    const score = (stabilityScore * 0.3) + (focusScore * 0.4) + (engagementScore * 0.3);
    return Math.round(score);
  };

  // Periodically update the flow score
  useEffect(() => {
    if (!currentTask) return;
    
    const interval = setInterval(() => {
      const score = calculateFlowScore();
      setFlowScore(score);
      
      // Update flow status based on score
      if (score >= 80) {
        setFlowStatus('deep-flow');
        setFlowTips([
          'You\'re in deep flow! Minimize interruptions.',
          'Consider extending your focused session.',
          'Stay hydrated but avoid major breaks.'
        ]);
      } else if (score >= 60) {
        setFlowStatus('flow');
        setFlowTips([
          'You\'re in a good flow state.',
          'If you need to take a break, keep it short (2-3 min).',
          'Maintain your environment - it\'s working for you.'
        ]);
      } else if (score >= 40) {
        setFlowStatus('approaching-flow');
        setFlowTips([
          'You\'re getting into flow.',
          'Minimize distractions for the next 10 minutes.',
          'Focus on one aspect of your task to deepen engagement.'
        ]);
      } else {
        setFlowStatus('pre-flow');
        setFlowTips([
          'You\'re not in flow yet. That\'s okay!',
          'Try breaking your task into smaller, more manageable pieces.',
          'Remove distractions and set a clear goal for the next 15 minutes.'
        ]);
      }
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [currentTask, attentionHistory, checkIns]);

  // Record a flow state check-in
  const recordCheckIn = (engagement, distractionLevel) => {
    const newCheckIn = {
      timestamp: new Date(),
      engagement, // 0-100
      distractionLevel, // 0-100
      notes: ''
    };
    setCheckIns([...checkIns, newCheckIn]);
  };

  // Flow state check-in form
  const CheckInForm = () => {
    const [engagement, setEngagement] = useState(50);
    const [distraction, setDistraction] = useState(50);
    
    const handleSubmit = (e) => {
      e.preventDefault();
      recordCheckIn(engagement, distraction);
    };
    
    return (
      <form onSubmit={handleSubmit} className="flow-checkin-form">
        <h4>Quick Check-in</h4>
        <div className="form-group">
          <label>
            How engaged do you feel with this task?
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={engagement} 
              onChange={(e) => setEngagement(parseInt(e.target.value))} 
            />
            <span>{engagement}%</span>
          </label>
        </div>
        <div className="form-group">
          <label>
            Distraction level:
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={distraction} 
              onChange={(e) => setDistraction(parseInt(e.target.value))} 
            />
            <span>{distraction}%</span>
          </label>
        </div>
        <button type="submit">Record</button>
      </form>
    );
  };

  if (!currentTask) {
    return (
      <div className="flow-optimizer empty-state">
        <p>Select a task to start tracking your flow state.</p>
      </div>
    );
  }

  return (
    <div className={`flow-optimizer ${flowStatus}`}>
      <div className="flow-header">
        <h3>Flow State Tracker</h3>
        <div className="flow-score">
          <div className="score-display">{flowScore}</div>
          <div className="score-label">Flow Score</div>
        </div>
      </div>
      
      <div className="current-flow-status">
        <h4>
          {flowStatus === 'deep-flow' && 'Deep Flow State! 🌊'}
          {flowStatus === 'flow' && 'In Flow 🌊'}
          {flowStatus === 'approaching-flow' && 'Approaching Flow'}
          {flowStatus === 'pre-flow' && 'Building Focus'}
        </h4>
        <p className="flow-description">
          {flowStatus === 'deep-flow' && 'You\'re fully immersed in your task. This is the optimal state for productive work!'}
          {flowStatus === 'flow' && 'You\'re in a good flow state, with steady focus and engagement.'}
          {flowStatus === 'approaching-flow' && 'You\'re getting into a rhythm. Keep going!'}
          {flowStatus === 'pre-flow' && 'You\'re in the early stages of focusing. It usually takes 10-15 minutes to reach flow.'}
        </p>
      </div>
      
      <div className="flow-tips">
        <h4>Flow Optimization Tips</h4>
        <ul>
          {flowTips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>
      
      <CheckInForm />
      
      {taskStartTime && (
        <div className="flow-session-time">
          <p>
            Session time: {Math.round((new Date() - taskStartTime) / 1000 / 60)} minutes
          </p>
        </div>
      )}
    </div>
  );
}

export default FlowStateOptimizer;