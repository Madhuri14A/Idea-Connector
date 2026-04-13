// Trending topics that could inspire projects

const trends = [
  {
    trend: 'AI Agents (Autonomous Workflows)',
    keywords: ['ai', 'agents', 'automation', 'llm'],
    idea: {
      title: 'AI Agent for Your Domain',
      description: 'AI agents are 2024\'s biggest trend. Build an autonomous agent that uses your domain expertise. Legal agent that reads contracts, Healthcare agent that triages patients, Finance agent that analyzes portfolios. This is where the money is.',
      technologies: ['LLM APIs', 'Tool Calling', 'Python', 'React'],
      difficulty: 'Medium',
      timeEstimate: '50 hours'
    },
    match: (skills) => skills.includes('python') || skills.includes('node.js') || skills.includes('ai')
  },
  {
    trend: 'Graph + AI (Context Windows)',
    keywords: ['graph', 'ai', 'knowledge', 'context'],
    idea: {
      title: 'AI-Powered Knowledge Graph',
      description: 'Combine graph databases with AI. Build a system that understands relationships between concepts. Used by OpenAI for context, by companies for RAG, by researchers for discovery. This is next-gen.',
      technologies: ['Neo4j', 'LLM APIs', 'Python', 'React'],
      difficulty: 'Hard',
      timeEstimate: '80 hours'
    },
    match: (skills) => skills.includes('database') || skills.includes('ai')
  },
  {
    trend: 'Local-First & Edge Computing',
    keywords: ['edge', 'local', 'offline', 'privacy'],
    idea: {
      title: 'Local-First Productivity App',
      description: 'The future is local-first. Build an app that works offline, syncs seamlessly, and protects user privacy. Use Replicache or CRDTs. Users will love you. Companies will hire you.',
      technologies: ['React', 'Replicache', 'SQLite', 'Electron', 'Local-First'],
      difficulty: 'Hard',
      timeEstimate: '70 hours'
    },
    match: (skills) => skills.includes('react') || skills.includes('node.js')
  },
  {
    trend: 'Real-Time Collaboration',
    keywords: ['realtime', 'collaboration', 'websocket', 'sync'],
    idea: {
      title: 'Figma-Like Collab Tool',
      description: 'Real-time collaboration is everywhere. Build a multiplayer whiteboard, document editor, or design tool. Operational transform your data. This is genuinely impressive to hire for.',
      technologies: ['React', 'Node.js', 'WebSocket', 'Yjs', 'PostgreSQL'],
      difficulty: 'Very Hard',
      timeEstimate: '100 hours'
    },
    match: (skills) => skills.includes('react') && skills.includes('node.js')
  }
];

module.exports = trends;
