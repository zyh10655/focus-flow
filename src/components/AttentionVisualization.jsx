// src/components/AttentionVisualization.jsx
import React from 'react';

function AttentionVisualization({ attentionHistory, patterns }) {
  if (!attentionHistory || attentionHistory.length < 5) {
    return (
      <div className="attention-visualization empty">
        <p>Track your attention levels to see patterns over time.</p>
      </div>
    );
  }
  
  // Get data for the last 24 hours
  const getHourlyData = () => {
    const hourData = Array(24).fill(null).map((_, i) => ({
      hour: i,
      level: null,
      count: 0
    }));
    
    // Only use data from the last 7 days for pattern detection
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    
    attentionHistory
      .filter(entry => new Date(entry.timestamp) > cutoff)
      .forEach(entry => {
        const hour = new Date(entry.timestamp).getHours();
        if (!hourData[hour].count) {
          hourData[hour].level = entry.level;
          hourData[hour].count = 1;
        } else {
          // Use the most common level for this hour
          hourData[hour].count++;
          // This is a simplification - in a real app you'd count each level
          if (entry.level === 'high') {
            hourData[hour].level = 'high';
          }
        }
      });
    
    return hourData;
  };
  
  const hourlyData = getHourlyData();
  
  return (
    <div className="attention-visualization">
      <h3>Your Attention Patterns</h3>
      
      <div className="hourly-chart">
        {hourlyData.map((data, index) => (
          <div key={index} className="hour-bar-container">
            <div 
              className={`hour-bar ${data.level || 'unknown'}`}
              style={{ 
                height: `${data.count ? Math.min(data.count * 15, 100) : 5}px`
              }}
            />
            <div className="hour-label">{index}</div>
          </div>
        ))}
      </div>
      
      {patterns && patterns.peakHours.length > 0 && (
        <div className="patterns-insights">
          <h4>Focus Insights</h4>
          <p>Your peak focus hours are typically:</p>
          <ul>
            {patterns.peakHours.map((peak, i) => (
              <li key={i}>
                {peak.hour}:00 - {peak.hour + 1}:00 
                ({Math.round(peak.highRatio * 100)}% high focus)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AttentionVisualization;