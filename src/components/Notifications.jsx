// src/components/Notifications.jsx
import React, { useState, useEffect } from 'react';

function Notifications({ engine, attentionLevel, tasks }) {
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    // Generate notifications based on app state
    const newNotifications = [];
    
    // 1. Check for optimal task suggestions
    const recommendedTasks = engine.getRecommendedTasks(tasks, attentionLevel);
    if (recommendedTasks.length > 0 && attentionLevel === 'high') {
      newNotifications.push({
        id: 'high-attention-tasks',
        type: 'suggestion',
        title: 'High focus detected',
        message: `This is a good time to work on ${recommendedTasks[0].title}`
      });
    }
    
    // 2. Check if there are high priority tasks
    const highPriorityTasks = tasks.filter(task => !task.completed && task.priority === 3);
    if (highPriorityTasks.length > 0) {
      newNotifications.push({
        id: 'high-priority',
        type: 'warning',
        title: 'High priority tasks',
        message: `You have ${highPriorityTasks.length} high priority task(s) pending`
      });
    }
    
    // 3. Check for optimal focus time based on patterns
    const patterns = engine.getUserPatterns?.();
    if (patterns && patterns.bestTimeForHighAttention) {
      const currentHour = new Date().getHours();
      if (patterns.bestTimeForHighAttention.includes(currentHour) && attentionLevel !== 'high') {
        newNotifications.push({
          id: 'optimal-focus-time',
          type: 'info',
          title: 'Optimal focus time',
          message: 'This is typically your high productivity time - consider focusing on important work'
        });
      }
    }
    
    setNotifications(newNotifications);
  }, [engine, attentionLevel, tasks]);
  
  const dismissNotification = (id) => {
    setNotifications(notifications.filter(note => note.id !== id));
  };
  
  if (notifications.length === 0) return null;
  
  return (
    <div className="notifications-container">
      {notifications.map(note => (
        <div key={note.id} className={`notification notification-${note.type}`}>
          <div className="notification-content">
            <h4 className="notification-title">{note.title}</h4>
            <p className="notification-message">{note.message}</p>
          </div>
          <button 
            className="notification-dismiss"
            onClick={() => dismissNotification(note.id)}
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}

export default Notifications;