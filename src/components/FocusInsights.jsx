// src/components/FocusInsights.jsx
import React from 'react';

function FocusInsights({ engine, attentionHistory, tasks }) {
    const patterns = engine.getUserPatterns();
    const completedTasks = tasks.filter(task => task.completed && task.focusScore);

    if (completedTasks.length === 0) {
        return (
            <div className="focus-insights empty-state">
                <h3>Not Enough Data</h3>
                <p>Complete tasks with the focus timer to see personalized insights.</p>
            </div>
        );
    }

    // Calculate attention metrics
    const calculateAttentionMetrics = () => {
        // High focus sessions in last 7 days
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const recentHighFocus = attentionHistory.filter(
            entry => entry.level === 'high' && new Date(entry.timestamp) > oneWeekAgo
        ).length;

        // Average focus score
        const avgFocusScore = completedTasks.reduce(
            (sum, task) => sum + task.focusScore, 0
        ) / completedTasks.length;

        // Highest productivity day
        const dayProductivity = {};
        completedTasks.forEach(task => {
            if (!task.completedAt) return;
            // src/components/FocusInsights.jsx (continued)
            const day = new Date(task.completedAt).toLocaleDateString('en-US', { weekday: 'long' });
            dayProductivity[day] = (dayProductivity[day] || 0) + 1;
        });

        const mostProductiveDay = Object.entries(dayProductivity).sort((a, b) => b[1] - a[1])[0];

        // Recovery recommendation based on cognitive load
        const recoveryNeeded = engine.calculateRecoveryNeeded();

        return {
            recentHighFocus,
            avgFocusScore,
            mostProductiveDay: mostProductiveDay ? mostProductiveDay[0] : 'Not enough data',
            taskCount: mostProductiveDay ? mostProductiveDay[1] : 0,
            recoveryNeeded
        };
    };

    const metrics = calculateAttentionMetrics();

    return (
        <div className="focus-insights">
            <h3>Your Focus Insights</h3>

            <div className="insights-grid">
                <div className="insight-card">
                    <div className="insight-value">{Math.round(metrics.avgFocusScore)}</div>
                    <div className="insight-label">Average Focus Score</div>
                    <div className="insight-description">
                        {metrics.avgFocusScore > 80 ? 'Excellent focus!' :
                            metrics.avgFocusScore > 60 ? 'Good focus level' : 'Room for improvement'}
                    </div>
                </div>

                <div className="insight-card">
                    <div className="insight-value">{metrics.recentHighFocus}</div>
                    <div className="insight-label">High-Focus Sessions</div>
                    <div className="insight-description">
                        In the past 7 days
                    </div>
                </div>

                <div className="insight-card">
                    <div className="insight-value">{metrics.mostProductiveDay}</div>
                    <div className="insight-label">Most Productive Day</div>
                    <div className="insight-description">
                        {metrics.taskCount} tasks completed
                    </div>
                </div>

                <div className="insight-card">
                    <div className="insight-value">
                        {patterns.bestTimeForHighAttention?.map(hour =>
                            `${hour}:00`
                        ).join(', ')}
                    </div>
                    <div className="insight-label">Peak Focus Hours</div>
                    <div className="insight-description">
                        Schedule demanding tasks during these hours
                    </div>
                </div>
            </div>

            <div className="recovery-insights">
                <h4>Cognitive Recovery</h4>
                {metrics.recoveryNeeded > 0 ? (
                    <div className="recovery-recommendation">
                        <p>Your cognitive load is high. Consider taking a {metrics.recoveryNeeded} hour break from demanding tasks.</p>
                        <div className="recovery-progress">
                            <div className="progress-label">Current cognitive load</div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${engine.cognitiveLoad.current}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <p>Your cognitive resources are well-balanced. You're ready for challenging tasks!</p>
                )}
            </div>
        </div>
    );
}

export default FocusInsights;