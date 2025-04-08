// src/components/PomodoroTimer.jsx
import React, { useState, useEffect, useRef } from 'react';

function PomodoroTimer({ onFocusComplete, onBreakComplete }) {
  const [mode, setMode] = useState('idle'); // idle, focus, break
  const [timeLeft, setTimeLeft] = useState(0);
  const [settings, setSettings] = useState({
    focusTime: 25, // minutes
    breakTime: 5,  // minutes
  });
  
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  
  useEffect(() => {
    // Create an audio element for the timer completion sound
    audioRef.current = new Audio('/notification.mp3');
    
    // Clean up on unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  
  const startFocus = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setMode('focus');
    setTimeLeft(settings.focusTime * 60);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          audioRef.current.play().catch(e => console.log('Audio error:', e));
          setMode('break');
          setTimeLeft(settings.breakTime * 60);
          if (onFocusComplete) onFocusComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const startBreak = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setMode('break');
    setTimeLeft(settings.breakTime * 60);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          audioRef.current.play().catch(e => console.log('Audio error:', e));
          setMode('idle');
          if (onBreakComplete) onBreakComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setMode('idle');
  };
  
  // Format time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (mode === 'focus') {
      return (1 - timeLeft / (settings.focusTime * 60)) * 100;
    } else if (mode === 'break') {
      return (1 - timeLeft / (settings.breakTime * 60)) * 100;
    }
    return 0;
  };
  
  return (
    <div className="pomodoro-timer">
      <div className="timer-display">
        <div 
          className={`timer-circle ${mode}`}
          style={{ 
            background: `conic-gradient(
              ${mode === 'focus' ? '#10b981' : '#6366f1'} ${getProgressPercentage()}%, 
              #e5e7eb ${getProgressPercentage()}% 100%
            )` 
          }}
        >
          <div className="timer-inner-circle">
            <div className="time-display">{formatTime(timeLeft)}</div>
            <div className="mode-display">
              {mode === 'focus' ? 'Focus Time' : mode === 'break' ? 'Break Time' : 'Ready'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="timer-controls">
        {mode === 'idle' && (
          <button className="start-focus-btn" onClick={startFocus}>
            Start Focus Session
          </button>
        )}
        {mode === 'focus' && (
          <button className="stop-timer-btn" onClick={stopTimer}>
            End Focus Session
          </button>
        )}
        {mode === 'break' && (
          <>
            <button className="start-focus-btn" onClick={startFocus}>
              Skip Break
            </button>
            <button className="stop-timer-btn" onClick={stopTimer}>
              End Break
            </button>
          </>
        )}
      </div>
      
      <div className="timer-settings">
        <div className="setting">
          <label>Focus Time (min)</label>
          <input 
            type="number" 
            min="1" 
            max="60" 
            value={settings.focusTime}
            onChange={(e) => setSettings({...settings, focusTime: Number(e.target.value)})}
            disabled={mode !== 'idle'}
          />
        </div>
        <div className="setting">
          <label>Break Time (min)</label>
          <input 
            type="number" 
            min="1" 
            max="30" 
            value={settings.breakTime}
            onChange={(e) => setSettings({...settings, breakTime: Number(e.target.value)})}
            disabled={mode !== 'idle'}
          />
        </div>
      </div>
    </div>
  );
}

export default PomodoroTimer;