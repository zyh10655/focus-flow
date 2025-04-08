// src/components/EnergyManagement.jsx
import React, { useState, useEffect } from 'react';

function EnergyManagement({ attentionHistory, completedTasks }) {
  const [energyLevel, setEnergyLevel] = useState(() => {
    const saved = localStorage.getItem('energyLevel');
    return saved ? JSON.parse(saved) : 100;
  });
  
  const [recoveryActivities, setRecoveryActivities] = useState(() => {
    const saved = localStorage.getItem('recoveryActivities');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Short walk', energyImpact: 15, durationMinutes: 10 },
      { id: 2, name: 'Meditation', energyImpact: 20, durationMinutes: 15 },
      { id: 3, name: 'Power nap', energyImpact: 30, durationMinutes: 20 },
      { id: 4, name: 'Deep breathing', energyImpact: 10, durationMinutes: 5 },
    ];
  });
  
  const [recoveryLog, setRecoveryLog] = useState(() => {
    const saved = localStorage.getItem('recoveryLog');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Calculate energy depletion based on task difficulty and duration
  useEffect(() => {
    const calculateEnergyImpact = () => {
      // Only consider tasks completed today
      const today = new Date().toDateString();
      const todaysTasks = completedTasks.filter(
        task => new Date(task.completedAt).toDateString() === today
      );
      
      if (todaysTasks.length === 0) return;
      
      // Calculate energy depletion
      let totalDepletion = 0;
      todaysTasks.forEach(task => {
        const baseCost = task.cognitiveDifficulty * 5; // 5-25 energy points
        const durationMultiplier = task.sessionDuration ? task.sessionDuration / 30 : 1;
        totalDepletion += baseCost * durationMultiplier;
      });
      
      // Calculate energy recovery from activities
      const todaysRecovery = recoveryLog.filter(
        log => new Date(log.timestamp).toDateString() === today
      );
      
      let totalRecovery = 0;
      todaysRecovery.forEach(log => {
        totalRecovery += log.energyImpact;
      });
      
      // Update energy level (100 is max, can't go below 0)
      setEnergyLevel(prevLevel => {
        // Start each day at 100
        if (recoveryLog.length === 0 && completedTasks.length === 0) return 100;
        
        const newLevel = Math.max(0, 100 - totalDepletion + totalRecovery);
        return Math.min(100, newLevel);
      });
    };
    
    calculateEnergyImpact();
  }, [completedTasks, recoveryLog]);
  
  // Save energy level to localStorage
  useEffect(() => {
    localStorage.setItem('energyLevel', JSON.stringify(energyLevel));
  }, [energyLevel]);
  
  // Save recovery activities to localStorage
  useEffect(() => {
    localStorage.setItem('recoveryActivities', JSON.stringify(recoveryActivities));
  }, [recoveryActivities]);
  
  // Save recovery log to localStorage
  useEffect(() => {
    localStorage.setItem('recoveryLog', JSON.stringify(recoveryLog));
  }, [recoveryLog]);
  
  // Complete a recovery activity
  const completeRecoveryActivity = (activityId) => {
    const activity = recoveryActivities.find(a => a.id === activityId);
    if (!activity) return;
    
    // Log the activity
    setRecoveryLog([
      ...recoveryLog,
      {
        activityId,
        name: activity.name,
        energyImpact: activity.energyImpact,
        timestamp: new Date().toISOString()
      }
    ]);
    
    // Increase energy level
    setEnergyLevel(prevLevel => Math.min(100, prevLevel + activity.energyImpact));
  };
  
  // Add a new recovery activity
  const [showAddForm, setShowAddForm] = useState(false);
  const [newActivity, setNewActivity] = useState({
    name: '',
    energyImpact: 10,
    durationMinutes: 5
  });
  
  const addRecoveryActivity = () => {
    if (!newActivity.name.trim()) return;
    
    const newId = Math.max(0, ...recoveryActivities.map(a => a.id)) + 1;
    setRecoveryActivities([
      ...recoveryActivities,
      { 
        id: newId, 
        name: newActivity.name, 
        energyImpact: newActivity.energyImpact,
        durationMinutes: newActivity.durationMinutes 
      }
    ]);
    
    setNewActivity({ name: '', energyImpact: 10, durationMinutes: 5 });
    setShowAddForm(false);
  };
  
  // Get energy level status
  const getEnergyStatus = () => {
    if (energyLevel >= 80) return 'high';
    if (energyLevel >= 40) return 'medium';
    return 'low';
  };
  
  // Get recommended activities based on energy level
  const getRecommendedActivities = () => {
    const status = getEnergyStatus();
    
    if (status === 'high') {
      return recoveryActivities.filter(a => a.energyImpact <= 10);
    } else if (status === 'medium') {
      return recoveryActivities.filter(a => a.energyImpact > 10 && a.energyImpact <= 20);
    } else {
      return recoveryActivities.filter(a => a.energyImpact > 20);
    }
  };
  
  return (
    <div className="energy-management">
      <div className="energy-header">
        <h3>Cognitive Energy</h3>
        <div className={`energy-level ${getEnergyStatus()}`}>
          <div className="energy-fill" style={{ width: `${energyLevel}%` }}></div>
          <span className="energy-value">{Math.round(energyLevel)}%</span>
        </div>
      </div>
      
      <div className="energy-status">
        <h4>Status: {
          energyLevel >= 80 ? 'High Energy' :
          energyLevel >= 40 ? 'Moderate Energy' :
          'Low Energy - Take a Break!'
        }</h4>
        <p className="energy-advice">
          {energyLevel >= 80 && 'You have plenty of mental energy. This is a great time for challenging tasks.'}
          {energyLevel >= 40 && energyLevel < 80 && 'Your energy is moderately depleted. Consider a short break soon.'}
          {energyLevel < 40 && 'Your cognitive resources are running low. Take a recovery break now.'}
        </p>
      </div>
      
      <div className="recovery-activities">
        <div className="recovery-header">
          <h4>Recovery Activities</h4>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="add-activity-btn"
          >
            {showAddForm ? 'Cancel' : '+ Add Activity'}
          </button>
        </div>
        
        {showAddForm && (
          <div className="add-activity-form">
            <div className="form-group">
              <input 
                type="text"
                value={newActivity.name}
                onChange={(e) => setNewActivity({...newActivity, name: e.target.value})}
                placeholder="Activity name (e.g., Short walk)"
              />
            </div>
            <div className="form-group">
              <label>
                Energy Impact:
                <input 
                  type="range" 
                  min="5" 
                  max="50" 
                  value={newActivity.energyImpact} 
                  onChange={(e) => setNewActivity({
                    ...newActivity, 
                    energyImpact: parseInt(e.target.value)
                  })} 
                />
                <span>{newActivity.energyImpact} points</span>
              </label>
            </div>
            <div className="form-group">
              <label>
                Duration (minutes):
                <input 
                  type="number" 
                  min="1" 
                  max="60" 
                  value={newActivity.durationMinutes} 
                  onChange={(e) => setNewActivity({
                    ...newActivity, 
                    durationMinutes: parseInt(e.target.value)
                  })} 
                />
              </label>
            </div>
            <button onClick={addRecoveryActivity}>Add Activity</button>
          </div>
        )}
        
        <div className="recommended-activities">
          <h5>Recommended Activities</h5>
          <div className="activity-cards">
            {getRecommendedActivities().map(activity => (
              <div key={activity.id} className="activity-card">
                <div className="activity-info">
                  <h5>{activity.name}</h5>
                  <div className="activity-details">
                    <span className="duration">{activity.durationMinutes} min</span>
                    <span className="impact">+{activity.energyImpact} energy</span>
                  </div>
                </div>
                <button 
                  onClick={() => completeRecoveryActivity(activity.id)}
                  className="complete-activity-btn"
                >
                  Complete
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="recovery-log">
          <h5>Today's Recovery Log</h5>
          {recoveryLog.filter(
            log => new Date(log.timestamp).toDateString() === new Date().toDateString()
          ).length === 0 ? (
            <p className="empty-log">No recovery activities completed today.</p>
          ) : (
            <ul className="log-items">
              {recoveryLog
                .filter(log => new Date(log.timestamp).toDateString() === new Date().toDateString())
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((log, index) => (
                  <li key={index} className="log-item">
                    <span className="log-time">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="log-name">{log.name}</span>
                    <span className="log-impact">+{log.energyImpact}</span>
                  </li>
                ))
              }
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default EnergyManagement;