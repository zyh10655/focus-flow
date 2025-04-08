// src/App.jsx
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import AnalyticsPage from './components/AnalyticsPage';
import FocusSession from './components/FocusSession';
import Notifications from './components/Notifications';
import AttentionEngine from './models/AttentionEngine';
import useAttentionTracking from './hooks/useAttentionTracking';
import { generateSampleTasks } from './utils/sampleTasks';

function App() {
  // Use the custom hook for attention tracking
  const { 
    currentLevel, 
    setCurrentLevel, 
    attentionHistory, 
    patterns 
  } = useAttentionTracking('medium');
  
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : generateSampleTasks();
  });
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [engine] = useState(() => {
    const newEngine = new AttentionEngine();
    
    // Load saved state if available
    const savedState = localStorage.getItem('engineState');
    if (savedState) {
      newEngine.loadState(JSON.parse(savedState));
    }
    
    return newEngine;
  });
  
  const [focusSessionTask, setFocusSessionTask] = useState(null);
  
  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  // Save engine state to localStorage
  useEffect(() => {
    localStorage.setItem('engineState', JSON.stringify(engine.getState()));
  }, [attentionHistory, engine]);
  
  // Log attention changes to the engine
  useEffect(() => {
    engine.logAttentionState(currentLevel);
  }, [currentLevel, engine]);
  
  // Calculate recommended tasks
  const getRecommendedTasks = () => {
    return engine.getRecommendedTasks(tasks, currentLevel);
  };
  
  // Handle adding a new task
  const handleAddTask = (newTask) => {
    setTasks([...tasks, {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }]);
  };
  
  // Handle updating a task
  const handleUpdateTask = (updatedTask) => {
    setTasks(tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };
  
  // Handle completing a task with focus data
  const handleCompleteTask = (taskWithFocusData) => {
    // Log task completion in engine
    engine.logTaskCompletion(
      taskWithFocusData, 
      taskWithFocusData.focusScore,
      new Date(taskWithFocusData.startTime || Date.now() - 1000 * 60 * 30), // Default to 30 mins ago
      new Date(taskWithFocusData.completedAt)
    );
    
    // Update the task in state
    handleUpdateTask(taskWithFocusData);
  };
  
  // Start a focus session with a task
  const startFocusSession = (task) => {
    setFocusSessionTask(task);
  };
  
  // End a focus session
  const endFocusSession = () => {
    setFocusSessionTask(null);
  };
  
  // If in a focus session, show that component
  if (focusSessionTask) {
    return (
      <FocusSession
        currentTask={focusSessionTask}
        onTaskComplete={handleCompleteTask}
        onTaskUpdate={handleUpdateTask}
        onExit={endFocusSession}
      />
    );
  }
  
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>FocusFlow</h1>
        <nav className="main-nav">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={activeTab === 'tasks' ? 'active' : ''}
            onClick={() => setActiveTab('tasks')}
          >
            Tasks
          </button>
          <button 
            className={activeTab === 'analytics' ? 'active' : ''}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </nav>
        <div className="attention-state-indicator">
          <span className={`indicator ${currentLevel}`}></span>
          <span className="indicator-label">
            {currentLevel === 'high' ? 'High Focus' : 
             currentLevel === 'medium' ? 'Medium Focus' : 'Low Focus'}
          </span>
        </div>
      </header>
      
      <Notifications 
        engine={engine}
        attentionLevel={currentLevel}
        tasks={tasks}
      />
      
      <main className="app-main">
        {activeTab === 'dashboard' && (
          <Dashboard 
            currentLevel={currentLevel}
            onLevelChange={setCurrentLevel}
            attentionHistory={attentionHistory}
            patterns={patterns}
            recommendedTasks={getRecommendedTasks()}
            onStartFocusSession={startFocusSession}
          />
        )}
        
        {activeTab === 'tasks' && (
          <TaskList 
            tasks={tasks}
            attentionLevel={currentLevel}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            recommendedTasks={getRecommendedTasks()}
            onStartFocusSession={startFocusSession}
          />
        )}
        
        {activeTab === 'analytics' && (
          <AnalyticsPage
            tasks={tasks}
            engine={engine}
            attentionHistory={attentionHistory}
          />
        )}
      </main>
      
      <footer className="app-footer">
        <p>FocusFlow - Attention-Based Project Management</p>
      </footer>
    </div>
  );
}

export default App;