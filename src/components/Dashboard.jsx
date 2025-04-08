// src/components/Dashboard.jsx
import React from 'react';
import AttentionTracker from './AttentionTracker';
import AttentionVisualization from './AttentionVisualization';
import FocusInsights from './FocusInsights';

function Dashboard({ 
    currentLevel, 
    onLevelChange, 
    attentionHistory, 
    patterns,
    recommendedTasks,
    onStartFocusSession
}) {
  const timeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };
  
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Good {timeOfDay()}</h2>
        <p className="date-display">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
      
      <div className="dashboard-grid">
        <div className="attention-status-card">
          <h3>Current Attention State</h3>
          <AttentionTracker 
            currentLevel={currentLevel}
            onLevelChange={onLevelChange}
          />
          <div className="attention-state-info">
            <p>
              {currentLevel === 'high' && 'You are in a high-focus state. Ideal for complex tasks.'}
              {currentLevel === 'medium' && 'You are in a medium-focus state. Good for routine work.'}
              {currentLevel === 'low' && 'You are in a low-focus state. Best for simple tasks.'}
            </p>
          </div>
        </div>
        
        <div className="attention-visualization-card">
          <AttentionVisualization 
            attentionHistory={attentionHistory}
            patterns={patterns}
          />
        </div>
        
        <div className="recommendations-card">
          <h3>Recommended Next Tasks</h3>
          {recommendedTasks.length === 0 ? (
            <p>No matching tasks for your current attention level.</p>
          ) : (
            <div className="task-cards">
              {recommendedTasks.slice(0, 3).map(task => (
                <div key={task.id} className="task-card">
                  <div className="task-card-header">
                    <h4>{task.title}</h4>
                    <span className={`difficulty-badge level-${task.cognitiveDifficulty}`}>
                      Level {task.cognitiveDifficulty}
                    </span>
                  </div>
                  {task.description && (
                    <p className="task-card-description">{task.description}</p>
                  )}
                  <button 
                    className="focus-session-button"
                    onClick={() => onStartFocusSession(task)}
                  >
                    Start Focus Session
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="focus-stats-card">
          <h3>Today's Focus Stats</h3>
          <div className="stat-items">
            <div className="stat-item">
              <div className="stat-value">
                {attentionHistory
                  .filter(e => 
                    new Date(e.timestamp).toDateString() === new Date().toDateString() &&
                    e.level === 'high'
                  ).length
                }
              </div>
              <div className="stat-label">High Focus Periods</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-value">
                {Math.round(attentionHistory
                  .filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString())
                  .reduce((acc, e) => acc + (e.level === 'high' ? 1 : 0), 0) / 
                  Math.max(1, attentionHistory.filter(e => 
                    new Date(e.timestamp).toDateString() === new Date().toDateString()
                  ).length) * 100)
                }%
              </div>
              <div className="stat-label">High Focus Ratio</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;