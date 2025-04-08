import React, { useState } from 'react';

function TaskForm({ onSubmit, onCancel }) {
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 2,
    cognitiveDifficulty: 3,
    completed: false
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    onSubmit(newTask);
  };
  
  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">Task Title</label>
        <input
          type="text"
          id="title"
          value={newTask.title}
          onChange={(e) => setNewTask({...newTask, title: e.target.value})}
          placeholder="What needs to be done?"
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="description">Description (optional)</label>
        <textarea
          id="description"
          value={newTask.description}
          onChange={(e) => setNewTask({...newTask, description: e.target.value})}
          placeholder="Add details..."
          rows="2"
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            value={newTask.priority}
            onChange={(e) => setNewTask({...newTask, priority: Number(e.target.value)})}
          >
            <option value="1">Low</option>
            <option value="2">Medium</option>
            <option value="3">High</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="cognitiveDifficulty">Cognitive Difficulty</label>
          <select
            id="cognitiveDifficulty"
            value={newTask.cognitiveDifficulty}
            onChange={(e) => setNewTask({...newTask, cognitiveDifficulty: Number(e.target.value)})}
          >
            <option value="1">Very Easy</option>
            <option value="2">Easy</option>
            <option value="3">Medium</option>
            <option value="4">Difficult</option>
            <option value="5">Very Difficult</option>
          </select>
        </div>
      </div>
      
      <div className="form-actions">
        <button type="submit" className="submit-btn">Add Task</button>
        <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default TaskForm;