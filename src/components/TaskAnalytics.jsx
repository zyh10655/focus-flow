// src/components/TaskAnalytics.jsx
import React from 'react';

function TaskAnalytics({ tasks, attentionHistory }) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="task-analytics empty-state">
        <p>Complete tasks to see analytics</p>
      </div>
    );
  }
  
  // Calculate completion rate by difficulty
  const calculateCompletionByDifficulty = () => {
    const difficultyStats = {
      1: { total: 0, completed: 0 },
      2: { total: 0, completed: 0 },
      3: { total: 0, completed: 0 },
      4: { total: 0, completed: 0 },
      5: { total: 0, completed: 0 }
    };
    
    tasks.forEach(task => {
      const difficulty = task.cognitiveDifficulty || 3;
      difficultyStats[difficulty].total++;
      if (task.completed) {
        difficultyStats[difficulty].completed++;
      }
    });
    
    return Object.entries(difficultyStats).map(([difficulty, stats]) => ({
      difficulty: Number(difficulty),
      total: stats.total,
      completed: stats.completed,
      rate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
    }));
  };
  
  // Calculate average focus score by time of day
  const calculateFocusByTimeOfDay = () => {
    const hourlyFocus = Array(24).fill().map(() => ({ count: 0, totalScore: 0 }));
    
    const completedTasks = tasks.filter(task => task.completed && task.focusScore);
    
    completedTasks.forEach(task => {
      const completedHour = new Date(task.completedAt).getHours();
      hourlyFocus[completedHour].count++;
      hourlyFocus[completedHour].totalScore += task.focusScore;
    });
    
    return hourlyFocus.map((data, hour) => ({
      hour,
      averageScore: data.count > 0 ? data.totalScore / data.count : 0,
      taskCount: data.count
    }));
  };
  
  // Stats calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const averageFocusScore = tasks
    .filter(task => task.completed && task.focusScore)
    .reduce((sum, task) => sum + task.focusScore, 0) / 
    Math.max(1, tasks.filter(task => task.completed && task.focusScore).length);
  
  const difficultyCompletion = calculateCompletionByDifficulty();
  const hourlyFocus = calculateFocusByTimeOfDay();
  
  // Find best focus hours
  const bestFocusHours = hourlyFocus
    .filter(data => data.taskCount >= 2)
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 3);
  
  return (
    <div className="task-analytics">
      <div className="analytics-summary">
        <div className="summary-stat">
          <div className="stat-value">{completedTasks}</div>
          <div className="stat-label">Completed Tasks</div>
        </div>
        <div className="summary-stat">
          <div className="stat-value">{Math.round(completionRate)}%</div>
          <div className="stat-label">Completion Rate</div>
        </div>
        <div className="summary-stat">
          <div className="stat-value">{Math.round(averageFocusScore)}</div>
          <div className="stat-label">Avg Focus Score</div>
        </div>
      </div>
      
      <div className="analytics-detail">
        <div className="difficulty-chart">
          <h3>Completion by Difficulty</h3>
          <div className="chart">
            {difficultyCompletion.map(data => (
              <div key={data.difficulty} className="chart-bar-container">
                <div className="chart-label">Level {data.difficulty}</div>
                <div className="chart-bar-wrapper">
                  <div 
                    className="chart-bar"
                    style={{ width: `${Math.max(2, data.rate)}%` }}
                  >
                    {data.total > 0 ? `${Math.round(data.rate)}%` : ''}
                  </div>
                </div>
                <div className="chart-value">{data.completed}/{data.total}</div>
              </div>
            ))}
          </div>
        </div>
        
        {bestFocusHours.length > 0 && (
          <div className="focus-insights">
            <h3>Focus Insights</h3>
            <p>Your best focus hours are:</p>
            <ul>
              {bestFocusHours.map((hour, i) => (
                <li key={i}>
                  {hour.hour}:00 - {(hour.hour + 1) % 24}:00 
                  (Score: {Math.round(hour.averageScore)})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskAnalytics;