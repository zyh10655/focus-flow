// src/models/AttentionEngine.js
class AttentionEngine {
    constructor() {
      this.attentionLevels = ['low', 'medium', 'high'];
      this.attentionHistory = [];
      this.userPatterns = {
        bestTimeForHighAttention: [9, 10, 11], // Hours of day (default values)
        attentionCycleLength: 90, // Minutes
        distractionFactors: [], // What tends to cause distractions
        productiveEnvironments: [] // Where user works best
      };
      
      this.cognitiveLoad = {
        current: 0,
        max: 100,
        recoveryRate: 5 // per hour
      };
    }
    
    // Return the internal state for saving
    getState() {
      return {
        attentionHistory: this.attentionHistory,
        userPatterns: this.userPatterns,
        cognitiveLoad: this.cognitiveLoad
      };
    }
    
    // Load a previously saved state
    loadState(state) {
      if (state.attentionHistory) {
        this.attentionHistory = state.attentionHistory;
      }
      if (state.userPatterns) {
        this.userPatterns = state.userPatterns;
      }
      if (state.cognitiveLoad) {
        this.cognitiveLoad = state.cognitiveLoad;
      }
    }
    
    // Log a new attention state
    logAttentionState(level, timestamp = new Date(), metadata = {}) {
      const newEntry = {
        level,
        timestamp: timestamp.getTime(),
        ...metadata
      };
      
      this.attentionHistory.push(newEntry);
      
      // Keep history at a reasonable size
      if (this.attentionHistory.length > 100) {
        this.attentionHistory = this.attentionHistory.slice(-100);
      }
      
      // Update user patterns based on new data
      this._updateUserPatterns();
      
      return newEntry;
    }
    
    // Log task completion with attention data
    logTaskCompletion(task, focusScore, startTime, endTime, metadata = {}) {
      // Calculate cognitive load impact
      const difficulty = task.cognitiveDifficulty || 3;
      const duration = (endTime - startTime) / 1000 / 60; // minutes
      
      // Higher difficulty tasks cause more cognitive load
      const loadImpact = difficulty * Math.min(duration / 30, 2);
      this.cognitiveLoad.current = Math.min(
        this.cognitiveLoad.max,
        this.cognitiveLoad.current + loadImpact
      );
      
      // Record when high focus tasks were completed successfully
      if (focusScore > 70 && difficulty >= 4) {
        const hour = new Date(endTime).getHours();
        this.userPatterns.successfulHighFocusHours = 
          this.userPatterns.successfulHighFocusHours || {};
        
        this.userPatterns.successfulHighFocusHours[hour] = 
          (this.userPatterns.successfulHighFocusHours[hour] || 0) + 1;
        
        // Update best hours based on successful completions
        this._updateBestHours();
      }
      
      return {
        cognitiveLoadImpact: loadImpact,
        currentLoad: this.cognitiveLoad.current
      };
    }
    
    // Get recommended tasks based on current attention and cognitive state
    getRecommendedTasks(tasks, currentAttentionLevel) {
      // Filter out completed tasks
      const incompleteTasks = tasks.filter(task => !task.completed);
      
      // First, get tasks that match current attention level
      const matchingTasks = incompleteTasks.filter(task => {
        const requiredAttention = this._getRequiredAttentionForTask(task);
        return requiredAttention === currentAttentionLevel;
      });
      
      // If cognitive load is high (> 70%), prioritize easier tasks
      if (this.cognitiveLoad.current > 70 && currentAttentionLevel !== 'high') {
        return matchingTasks.sort((a, b) => {
          // When tired, prioritize easier tasks
          if (a.cognitiveDifficulty !== b.cognitiveDifficulty) {
            return a.cognitiveDifficulty - b.cognitiveDifficulty;
          }
          
          // But still consider priority
          if (a.priority !== b.priority) {
            return b.priority - a.priority;
          }
          
          return 0;
        });
      }
      
      // Otherwise, sort by priority first, then deadline if available
      return matchingTasks.sort((a, b) => {
        // First by priority
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        
        // Then by deadline if available
        if (a.deadline && b.deadline) {
          return new Date(a.deadline) - new Date(b.deadline);
        }
        
        // Then by cognitive difficulty (matching current state best)
        if (currentAttentionLevel === 'high') {
          return b.cognitiveDifficulty - a.cognitiveDifficulty;
        } else {
          return a.cognitiveDifficulty - b.cognitiveDifficulty;
        }
      });
    }
    
    // Get user's attention patterns
    getUserPatterns() {
      return this.userPatterns;
    }
    
    // Predict optimal daily schedule based on patterns
    predictOptimalSchedule(tasks) {
      const hourlyRecommendations = Array(24).fill().map((_, hour) => {
        // Determine likely attention level for this hour
        let predictedAttention = 'medium';
        
        if (this.userPatterns.bestTimeForHighAttention?.includes(hour)) {
          predictedAttention = 'high';
        } else if (hour >= 14 && hour <= 15 || hour >= 22 || hour <= 5) {
          // Early afternoon slump and late night/early morning as low energy
          predictedAttention = 'low';
        }
        
        // Find suitable tasks
        const suitableTasks = this.getRecommendedTasks(
          tasks,
          predictedAttention
        ).slice(0, 2); // Top 2 tasks
        
        return {
          hour,
          predictedAttention,
          recommendedTasks: suitableTasks
        };
      });
      
      return hourlyRecommendations;
    }
    
    // Calculate cognitive recovery times
    calculateRecoveryNeeded() {
      if (this.cognitiveLoad.current <= 30) return 0;
      
      // Calculate hours needed to recover to 30% load
      const loadToRecover = this.cognitiveLoad.current - 30;
      const hoursNeeded = Math.ceil(loadToRecover / this.cognitiveLoad.recoveryRate);
      
      return hoursNeeded;
    }
    
    // Determine required attention level for a task
    _getRequiredAttentionForTask(task) {
      const { cognitiveDifficulty = 3 } = task;
      
      if (cognitiveDifficulty >= 4) return 'high';
      if (cognitiveDifficulty >= 2) return 'medium';
      return 'low';
    }
    
    // Update user patterns based on attention history
    _updateUserPatterns() {
      // Need minimum data points
      if (this.attentionHistory.length < 10) return;
      
      // Analyze when 'high' attention states occur
      const highAttentionEntries = this.attentionHistory
        .filter(entry => entry.level === 'high')
        .map(entry => new Date(entry.timestamp).getHours());
      
      if (highAttentionEntries.length >= 5) {
        // Find the most common hours for high attention
        const hourCounts = {};
        highAttentionEntries.forEach(hour => {
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });
        
        // Sort by count and take the top 3
        this.userPatterns.bestTimeForHighAttention = Object.entries(hourCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(entry => parseInt(entry[0]));
      }
      
      // More pattern analysis could be added here
    }
    
    // Update best hours based on successful task completions
    _updateBestHours() {
      if (!this.userPatterns.successfulHighFocusHours) return;
      
      this.userPatterns.bestTimeForHighAttention = Object.entries(
        this.userPatterns.successfulHighFocusHours
      )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => parseInt(entry[0]));
    }
    
    // Simulate cognitive load recovery (e.g., call this at regular intervals)
    simulateRecovery(hours = 1) {
      const recoveryAmount = this.cognitiveLoad.recoveryRate * hours;
      this.cognitiveLoad.current = Math.max(
        0,
        this.cognitiveLoad.current - recoveryAmount
      );
      
      return this.cognitiveLoad.current;
    }
  }
  
  export default AttentionEngine;