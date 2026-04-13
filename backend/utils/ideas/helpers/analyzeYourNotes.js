const { extractMeaningfulWords, classifyTheme, detectDomains, isProject, isProblemStatement, isInterestArea } = require('./utilities');
const { getCosineSimilarity } = require('../../similarity');

// Analyze what you're learning, problems you face, and your strengths
const analyzeYourNotes = (notes) => {
  const tagFrequency = {};
  const keywordFrequency = {};
  const contentThemes = [];
  const projects = [];
  const problems = [];
  const interests = [];
  const skills = new Set();
  const domains = new Set();

  notes.forEach(note => {
    const content = (note.title + ' ' + note.content).toLowerCase();

    // Count tags
    note.tags?.forEach(tag => {
      const key = tag.toLowerCase();
      tagFrequency[key] = (tagFrequency[key] || 0) + 1;
      skills.add(key);
    });

    // Extract keywords from content
    const keywords = extractMeaningfulWords(content);
    keywords.forEach(word => {
      keywordFrequency[word] = (keywordFrequency[word] || 0) + 1;
    });

    // Classify note themes
    const theme = classifyTheme(content);
    if (theme) contentThemes.push({ noteId: note.id, theme, title: note.title });

    // Detect domains
    detectDomains(content).forEach(d => domains.add(d));

    if (isProject(content)) projects.push(note);
    if (isProblemStatement(content)) problems.push(note);
    if (isInterestArea(content)) interests.push(note);
  });

  // Find hidden connections using NLP similarity
  const hiddenConnections = findHiddenConnections(notes);

  return {
    topTags: Object.entries(tagFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([tag, count]) => ({ tag, count })),
    topKeywords: Object.entries(keywordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([word, count]) => ({ word, count })),
    skills: [...skills],
    domains: [...domains],
    contentThemes,
    projects,
    problems,
    interests,
    hiddenConnections,
    totalNotes: notes.length,
    techProfile: buildTechProfile(tagFrequency, keywordFrequency),
    focusArea: determineFocusArea(tagFrequency, keywordFrequency)
  };
};

/**
 * Find hidden connections between notes (medium similarity = interesting)
 */
const findHiddenConnections = (notes) => {
  const connections = [];

  for (let i = 0; i < notes.length; i++) {
    for (let j = i + 1; j < notes.length; j++) {
      const textA = `${notes[i].title} ${notes[i].content} ${(notes[i].tags || []).join(' ')}`;
      const textB = `${notes[j].title} ${notes[j].content} ${(notes[j].tags || []).join(' ')}`;
      const similarity = getCosineSimilarity(textA, textB);

      // Medium similarity = interesting cross-pollination opportunity
      if (similarity > 0.15 && similarity < 0.6) {
        connections.push({
          noteA: notes[i],
          noteB: notes[j],
          similarity,
          type: similarity > 0.35 ? 'related' : 'unexpected'
        });
      }
    }
  }

  return connections.sort((a, b) => {
    // Prefer "unexpected" connections - they spark the most creative ideas
    if (a.type !== b.type) return a.type === 'unexpected' ? -1 : 1;
    return b.similarity - a.similarity;
  });
};

/**
 * Build tech profile (frontend/backend/ai/etc scores)
 */
const buildTechProfile = (tags, keywords) => {
  const profile = {
    frontend: 0, backend: 0, database: 0, ai: 0,
    blockchain: 0, devops: 0, mobile: 0
  };

  const mapping = {
    frontend: ['react', 'vue', 'angular', 'css', 'html', 'javascript', 'typescript', 'frontend', 'tailwind', 'next.js'],
    backend: ['node', 'express', 'python', 'django', 'flask', 'api', 'rest', 'graphql', 'backend', 'server', 'go', 'golang'],
    database: ['sql', 'postgresql', 'mongodb', 'neo4j', 'redis', 'firebase', 'database', 'nosql'],
    ai: ['ai', 'ml', 'machine learning', 'openai', 'gpt', 'nlp', 'deep learning', 'neural'],
    blockchain: ['blockchain', 'web3', 'crypto', 'smart contract', 'ethereum', 'rubix', 'solidity'],
    devops: ['docker', 'kubernetes', 'aws', 'ci/cd', 'deploy', 'cloud', 'linux'],
    mobile: ['mobile', 'react native', 'flutter', 'android', 'ios', 'swift']
  };

  for (const [category, techs] of Object.entries(mapping)) {
    techs.forEach(tech => {
      profile[category] += (tags[tech] || 0) * 3 + (keywords[tech] || 0);
    });
  }

  return profile;
};

/**
 * Determine your main focus area
 */
const determineFocusArea = (tags, keywords) => {
  const topTag = Object.entries(tags).sort((a, b) => b[1] - a[1])[0];
  if (!topTag) return 'Full-Stack Development';
  const [tag] = topTag;

  if (['ai', 'ml', 'openai'].includes(tag)) return 'AI/ML Applications';
  if (['blockchain', 'web3', 'crypto'].includes(tag)) return 'Blockchain Development';
  if (['react', 'vue', 'angular', 'css'].includes(tag)) return 'Frontend Development';
  if (['node', 'express', 'python', 'go'].includes(tag)) return 'Backend Development';
  if (['neo4j', 'postgresql', 'mongodb'].includes(tag)) return 'Data Engineering';
  return 'Full-Stack Development';
};

module.exports = {
  analyzeYourNotes,
  findHiddenConnections,
  buildTechProfile,
  determineFocusArea
};
