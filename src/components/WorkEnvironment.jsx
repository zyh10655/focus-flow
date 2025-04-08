// src/components/WorkEnvironment.jsx
import React, { useState, useEffect } from 'react';

function WorkEnvironment() {
  const [environments, setEnvironments] = useState(() => {
    const saved = localStorage.getItem('workEnvironments');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Quiet desk', productivityScore: 0, sessions: 0 },
      { id: 2, name: 'Coffee shop', productivityScore: 0, sessions: 0 },
      { id: 3, name: 'Home office', productivityScore: 0, sessions: 0 },
    ];
  });
  
  const [currentEnvironment, setCurrentEnvironment] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEnvironmentName, setNewEnvironmentName] = useState('');
  
  // Save environments to localStorage
  useEffect(() => {
    localStorage.setItem('workEnvironments', JSON.stringify(environments));
  }, [environments]);
  
  // Start a session in the selected environment
  const startEnvironmentSession = (environmentId) => {
    setCurrentEnvironment(environments.find(env => env.id === environmentId));
  };
  
  // End a session and record the productivity score
  const endEnvironmentSession = (productivityScore) => {
    if (!currentEnvironment) return;
    
    setEnvironments(environments.map(env => {
      if (env.id === currentEnvironment.id) {
        const totalScore = (env.productivityScore * env.sessions) + productivityScore;
        const newSessions = env.sessions + 1;
        return {
          ...env,
          productivityScore: Math.round(totalScore / newSessions),
          sessions: newSessions
        };
      }
      return env;
    }));
    
    setCurrentEnvironment(null);
  };
  
  // Add a new environment
  const addNewEnvironment = () => {
    if (!newEnvironmentName.trim()) return;
    
    const newId = Math.max(0, ...environments.map(e => e.id)) + 1;
    setEnvironments([
      ...environments,
      { id: newId, name: newEnvironmentName, productivityScore: 0, sessions: 0 }
    ]);
    
    setNewEnvironmentName('');
    setShowAddForm(false);
  };
  
  // Delete an environment
  const deleteEnvironment = (id) => {
    setEnvironments(environments.filter(env => env.id !== id));
  };
  
  // Sort environments by productivity score
  const sortedEnvironments = [...environments].sort((a, b) => {
    if (a.sessions === 0 && b.sessions === 0) return 0;
    if (a.sessions === 0) return 1;
    if (b.sessions === 0) return -1;
    return b.productivityScore - a.productivityScore;
  });
  
  // Environment session form
  const EnvironmentSessionForm = () => {
    const [productivityScore, setProductivityScore] = useState(70);
    
    return (
      <div className="environment-session-form">
        <h4>Current Environment: {currentEnvironment.name}</h4>
        <p>When you're done with your session, rate your productivity:</p>
        
        <div className="form-group">
          <label>
            Productivity:
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={productivityScore} 
              onChange={(e) => setProductivityScore(parseInt(e.target.value))} 
            />
            <span>{productivityScore}%</span>
          </label>
        </div>
        
        <button 
          onClick={() => endEnvironmentSession(productivityScore)}
          className="end-session-btn"
        >
          End Session
        </button>
      </div>
    );
  };
  
  return (
    <div className="work-environment">
      <div className="environment-header">
        <h3>Work Environments</h3>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="add-env-btn"
        >
          {showAddForm ? 'Cancel' : '+ Add Environment'}
        </button>
      </div>
      
      {showAddForm && (
        <div className="add-environment-form">
          <input 
            type="text"
            value={newEnvironmentName}
            onChange={(e) => setNewEnvironmentName(e.target.value)}
            placeholder="Environment name (e.g., Coffee shop)"
          />
          <button onClick={addNewEnvironment}>Add</button>
        </div>
      )}
      
      {currentEnvironment ? (
        <EnvironmentSessionForm />
      ) : (
        <div className="environments-list">
          {sortedEnvironments.map(env => (
            <div key={env.id} className="environment-card">
              <div className="environment-info">
                <h4>{env.name}</h4>
                <div className="environment-stats">
                  <span className="score">
                    {env.sessions > 0 ? `${env.productivityScore}%` : 'No sessions'}
                  </span>
                  <span className="sessions">
                    {env.sessions} {env.sessions === 1 ? 'session' : 'sessions'}
                  </span>
                </div>
              </div>
              <div className="environment-actions">
                <button
                  onClick={() => startEnvironmentSession(env.id)}
                  className="start-session-btn"
                >
                  Start Session
                </button>
                <button
                  onClick={() => deleteEnvironment(env.id)}
                  className="delete-env-btn"
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="environment-insights">
        <h4>Environment Insights</h4>
        {environments.some(env => env.sessions > 0) ? (
          <>
            <p>Your most productive environment: 
              <strong>
                {sortedEnvironments.find(env => env.sessions > 0)?.name}
              </strong>
            </p>
            <p>Try to work in your most productive environments when tackling high-difficulty tasks.</p>
          </>
        ) : (
          <p>Start tracking your environments to get personalized insights.</p>
        )}
      </div>
    </div>
  );
}

export default WorkEnvironment;