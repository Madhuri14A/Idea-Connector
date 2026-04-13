// Extract meaningful words from text (removes stop words)
const extractMeaningfulWords = (text) => {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may',
    'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
    'what', 'which', 'who', 'when', 'where', 'how', 'not', 'all', 'each',
    'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'only',
    'same', 'than', 'too', 'very', 'just', 'because', 'also', 'like', 'use',
    'using', 'used', 'make', 'made', 'know', 'need', 'want', 'get', 'got'
  ]);

  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word))
    .filter(word => !/^\d+$/.test(word));
};

/**
 * Check if a note describes a project
 */
const isProject = (content) => {
  const indicators = ['build', 'create', 'develop', 'app', 'platform', 'website', 'tool', 'system', 'project', 'prototype', 'mvp'];
  return indicators.some(ind => content.includes(ind));
};

/**
 * Check if a note describes a problem
 */
const isProblemStatement = (content) => {
  const indicators = ['problem', 'issue', 'challenge', 'difficult', 'hard', 'struggle', 'pain', 'frustrat', 'annoying', 'broken', 'slow'];
  return indicators.some(ind => content.includes(ind));
};

/**
 * Check if a note is about an interest area
 */
const isInterestArea = (content) => {
  const indicators = ['learn', 'explore', 'interested', 'curious', 'want to', 'future', 'excited', 'try', 'experiment'];
  return indicators.some(ind => content.includes(ind));
};

/**
 * Extract main concept from note title
 */
const extractConcept = (note) => {
  const words = note.title.split(/\s+/).filter(w => w.length > 2);
  return words.slice(0, 3).join(' ');
};

/**
 * Find notes related to specific keywords
 */
const findRelatedNotes = (notes, keywords) => {
  return notes
    .filter(n => {
      const content = (n.title + ' ' + n.content + ' ' + (n.tags || []).join(' ')).toLowerCase();
      return keywords.some(kw => content.includes(kw.toLowerCase()));
    })
    .slice(0, 3)
    .map(n => n.id);
};

/**
 * Capitalize first letter
 */
const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Detect domains (healthcare, education, finance, etc.)
 */
const detectDomains = (content) => {
  const domains = [];
  const domainMap = {
    'healthcare': ['health', 'medical', 'patient', 'doctor', 'hospital', 'wellness', 'fitness'],
    'education': ['learn', 'student', 'course', 'teach', 'school', 'university', 'tutorial'],
    'finance': ['finance', 'payment', 'money', 'bank', 'invest', 'expense', 'budget', 'stock'],
    'social': ['social', 'community', 'government', 'rural', 'farmer', 'village'],
    'productivity': ['todo', 'task', 'project', 'manage', 'organize', 'track', 'productivity'],
    'ecommerce': ['shop', 'product', 'cart', 'order', 'ecommerce', 'marketplace'],
    'entertainment': ['game', 'music', 'video', 'stream', 'content', 'media']
  };

  for (const [domain, keywords] of Object.entries(domainMap)) {
    if (keywords.some(kw => content.includes(kw))) domains.push(domain);
  }
  return domains;
};

/**
 * Classify the theme of a note
 */
const classifyTheme = (content) => {
  const themes = {
    'web-dev': ['react', 'frontend', 'backend', 'fullstack', 'html', 'css', 'javascript', 'typescript', 'next.js', 'vite'],
    'ai-ml': ['artificial intelligence', 'machine learning', 'neural', 'nlp', 'deep learning', 'openai', 'gpt', 'model', 'training'],
    'blockchain': ['blockchain', 'crypto', 'web3', 'smart contract', 'decentralized', 'token', 'nft', 'rubix'],
    'data': ['database', 'sql', 'nosql', 'data science', 'analytics', 'visualization', 'chart', 'graph', 'neo4j'],
    'devops': ['docker', 'kubernetes', 'ci/cd', 'deployment', 'aws', 'cloud', 'server', 'hosting'],
    'mobile': ['mobile', 'android', 'ios', 'react native', 'flutter', 'swift'],
    'career': ['career', 'job', 'interview', 'resume', 'portfolio', 'salary', 'hire', 'recruiter'],
    'finance': ['finance', 'payment', 'expense', 'budget', 'money', 'investment', 'fintech'],
    'education': ['learn', 'course', 'tutorial', 'study', 'teach', 'education', 'student'],
    'social-impact': ['government', 'social', 'india', 'rural', 'community', 'accessibility', 'health']
  };

  for (const [theme, keywords] of Object.entries(themes)) {
    if (keywords.some(kw => content.includes(kw))) return theme;
  }
  return null;
};

module.exports = {
  extractMeaningfulWords,
  isProject,
  isProblemStatement,
  isInterestArea,
  extractConcept,
  findRelatedNotes,
  capitalize,
  detectDomains,
  classifyTheme
};
