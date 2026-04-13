// Portfolio project ideas that impress employers

const portfolioExamples = [
  {
    idea: {
      title: 'Real-Time Multiplayer Game (Web-Based)',
      description: 'WebGL + WebSocket game that syncs perfectly across 100+ players. Developers see this and immediately think you can ship scalable real-time systems. This project alone gets job offers.',
      technologies: ['Three.js', 'Node.js', 'WebSocket', 'PostgreSQL'],
      difficulty: 'Very Hard',
      timeEstimate: '120 hours'
    },
    match: (profile, skills) => profile.frontend >= 4 && profile.backend >= 3
  },
  {
    idea: {
      title: 'End-to-End Encrypted Chat App',
      description: 'Privacy-first messaging with Signal-like encryption. Proves you understand cryptography, security, and can build paranoid-level infrastructure. Tech leads respect this.',
      technologies: ['React', 'Node.js', 'Signal Protocol', 'WebSocket', 'PostgreSQL'],
      difficulty: 'Very Hard',
      timeEstimate: '100 hours'
    },
    match: (profile, skills) => profile.backend >= 3
  },
  {
    idea: {
      title: 'Distributed Video Transcoding Platform',
      description: 'AWS Lambda + S3 video transcoding infrastructure. Shows you understand distributed systems at scale. Netflix, YouTube, and TikTok all do this. Building it gets you hired.',
      technologies: ['AWS Lambda', 'FFmpeg', 'S3', 'Node.js', 'Docker'],
      difficulty: 'Hard',
      timeEstimate: '90 hours'
    },
    match: (profile, skills) => profile.devops >= 2 || skills.includes('aws')
  }
];

module.exports = portfolioExamples;
