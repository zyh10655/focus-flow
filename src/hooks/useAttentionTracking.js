// src/hooks/useAttentionTracking.js
import { useState, useEffect } from 'react';

const useAttentionTracking = (initialLevel = 'medium') => {
  const [currentLevel, setCurrentLevel] = useState(initialLevel);
  const [attentionHistory, setAttentionHistory] = useState(() => {
    const saved = localStorage.getItem('attentionHistory');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Update history when level changes
  useEffect(() => {
    const newEntry = {
      level: currentLevel,
      timestamp: new Date().toISOString()
    };
    
    const newHistory = [...attentionHistory, newEntry];
    
    // Keep history at a reasonable size (last 100 entries)
    if (newHistory.length > 100) {
      newHistory.splice(0, newHistory.length - 100);
    }
    
    setAttentionHistory(newHistory);
    localStorage.setItem('attentionHistory', JSON.stringify(newHistory));
  }, [currentLevel]);
  
  // Detect patterns in attention levels
  const getAttentionPatterns = () => {
    if (attentionHistory.length < 5) return null;
    
    // Group by hour of day
    const hourlyPatterns = {};
    attentionHistory.forEach(entry => {
      const hour = new Date(entry.timestamp).getHours();
      if (!hourlyPatterns[hour]) {
        hourlyPatterns[hour] = { high: 0, medium: 0, low: 0, total: 0 };
      }
      hourlyPatterns[hour][entry.level]++;
      hourlyPatterns[hour].total++;
    });
    
    // Calculate peak hours (most likely to be 'high')
    const peakHours = Object.entries(hourlyPatterns)
      .filter(([_, data]) => data.total >= 3) // need minimum samples
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        highRatio: data.high / data.total,
        mediumRatio: data.medium / data.total,
        lowRatio: data.low / data.total
      }))
      .sort((a, b) => b.highRatio - a.highRatio);
    
    return {
      peakHours: peakHours.slice(0, 3),
      hourlyPatterns
    };
  };
  
  return {
    currentLevel,
    setCurrentLevel,
    attentionHistory,
    patterns: getAttentionPatterns()
  };
};

export default useAttentionTracking;