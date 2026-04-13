// Real pain points that could become products

const problemExamples = [
  {
    domain: 'healthcare',
    keywords: ['health', 'medical', 'patient', 'diagnosis'],
    idea: {
      title: 'Patient-to-Provider Messaging Platform',
      description: 'HIPAA-compliant messaging between patients and doctors. Telemedicine clinics and hospitals will pay big for this. Build it once, license it to 20 clinics = $5K/month.',
      technologies: ['Node.js', 'React', 'PostgreSQL', 'HIPAA Compliance'],
      difficulty: 'Hard',
      timeEstimate: '100 hours'
    }
  },
  {
    domain: 'education',
    keywords: ['learning', 'student', 'course', 'teach'],
    idea: {
      title: 'Teacher Grading Automation with AI',
      description: 'Teachers spend 20 hours/week grading. AI can grade 80% automatically. Teachers will pay. EdTech platforms will license. This solves a real, repeated problem.',
      technologies: ['Python', 'LLM API', 'React', 'PostgreSQL'],
      difficulty: 'Medium',
      timeEstimate: '50 hours'
    }
  },
  {
    domain: 'finance',
    keywords: ['money', 'investment', 'trading', 'portfolio'],
    idea: {
      title: 'Personal Finance Dashboard with AI Insights',
      description: 'Aggregates bank + brokerage + crypto accounts. AI suggests optimizations. Charge $5-15/month. Average user has $50K in assets = high LTV.',
      technologies: ['React', 'Node.js', 'Plaid API', 'LLM API'],
      difficulty: 'Medium',
      timeEstimate: '60 hours'
    }
  }
];

module.exports = problemExamples;
