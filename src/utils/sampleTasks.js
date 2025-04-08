// src/utils/sampleTasks.js
export const generateSampleTasks = () => {
    return [
      {
        id: "1",
        title: "Design system architecture",
        description: "Create high-level architecture for the new product",
        priority: 3,
        cognitiveDifficulty: 5,
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: "2",
        title: "Write documentation",
        description: "Update API documentation with new endpoints",
        priority: 2,
        cognitiveDifficulty: 3,
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: "3",
        title: "Reply to emails",
        description: "Catch up on inbox",
        priority: 2,
        cognitiveDifficulty: 1,
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: "4",
        title: "Brainstorm new features",
        description: "Creative session for next quarter features",
        priority: 2,
        cognitiveDifficulty: 4,
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: "5",
        title: "Review pull requests",
        description: "Review code changes from team members",
        priority: 3,
        cognitiveDifficulty: 3,
        completed: false,
        createdAt: new Date().toISOString()
      }
    ];
  };