// src/components/TaskList.jsx
import React, { useState } from 'react';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';

function TaskList({ 
  tasks, 
  attentionLevel, 
  onAddTask, 
  onUpdateTask, 
  recommendedTasks,
  onStartFocusSession
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, completed
  const [sortBy, setSortBy] = useState('priority'); // priority, difficulty, created
  
  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return !task.completed;
    if (filterStatus === 'completed') return task.completed;
    return true;
  });
  
  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority') {
      return b.priority - a.priority;
    }
    if (sortBy === 'difficulty') {
      return b.cognitiveDifficulty - a.cognitiveDifficulty;
    }
    if (sortBy === 'created') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return 0;
  });
  
  return (
    <div className="task-list-container">
      <div className="recommended-tasks">
        <h2>Recommended for your current attention level</h2>
        {recommendedTasks.length === 0 ? (
          <p>No tasks match your current attention level.</p>
        ) : (
          <div className="recommended-task-grid">
            {recommendedTasks.slice(0, 3).map(task => (
              <div key={task.id} className="recommended-task-card">
                <div className="task-name">{task.title}</div>
                <div className="task-meta">
                  <span className="difficulty">Level {task.cognitiveDifficulty}</span>
                  <span className="priority">
                    {task.priority === 3 ? 'High' : task.priority === 2 ? 'Medium' : 'Low'} Priority
                  </span>
                </div>
                {task.description && (
                  <div className="task-description">{task.description}</div>
                )}
                <button 
                  className="focus-button"
                  onClick={() => onStartFocusSession(task)}
                >
                  Start Focus Session
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="all-tasks">
        <div className="task-list-header">
          <h2>All Tasks</h2>
          <button 
            className="add-task-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : '+ Add Task'}
          </button>
        </div>
        
        {showAddForm && (
          <TaskForm 
            onSubmit={(newTask) => {
              onAddTask({
                ...newTask,
                id: Date.now().toString(),
                createdAt: new Date().toISOString()
              });
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
          />
        )}
        
        <div className="task-filters">
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="priority">Priority</option>
              <option value="difficulty">Difficulty</option>
              <option value="created">Recently Created</option>
            </select>
          </div>
        </div>
        
        {sortedTasks.length === 0 ? (
          <p>No tasks found. Add your first task to get started.</p>
        ) : (
          <div className="task-items">
            {sortedTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onUpdate={onUpdateTask}
                isRecommended={recommendedTasks.some(t => t.id === task.id)}
                onStartFocusSession={onStartFocusSession}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskList;