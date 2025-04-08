// src/components/AnalyticsPage.jsx
import React from 'react';
import TaskAnalytics from './TaskAnalytics';
import FocusInsights from './FocusInsights';

function AnalyticsPage({ tasks, engine, attentionHistory }) {
  return (
    <div className="analytics-page">
      <h2>Performance Analytics</h2>
      
      <div className="analytics-grid">
        <div className="analytics-card">
          <FocusInsights 
            engine={engine}
            attentionHistory={attentionHistory}
            tasks={tasks}
          />
        </div>
        
        <div className="analytics-card">
          <TaskAnalytics 
            tasks={tasks}
            attentionHistory={attentionHistory}
          />
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;