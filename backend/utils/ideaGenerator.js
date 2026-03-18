const { getCosineSimilarity, extractKeywords } = require('./similarity');

const generateIdeas = (notes) => {
  if (!notes || notes.length < 3) {
    return [{
      id: '1',
      title: 'Add More Notes First',
      description: 'Create at least 3-5 notes with different topics to get personalized project suggestions. The more context you give, the smarter the ideas get.',
      technologies: [],
      relatedNoteIds: [],
      confidence: 50,
      type: 'suggestion'
    }];
  }

  const ideas = [];
  const analysis = analyzeKnowledgeBase(notes);

  // Strategy 1: Cross-Pollination — mash up unrelated notes
  ideas.push(...generateCrossPollinationIdeas(notes, analysis));

  // Strategy 2: Gap Analysis — what's missing in your stack
  ideas.push(...generateGapAnalysisIdeas(notes, analysis));

  // Strategy 3: Trend Fusion — combine your skills with hot trends
  ideas.push(...generateTrendFusionIdeas(notes, analysis));

  // Strategy 4: Problem→Product — turn pain points into SaaS
  ideas.push(...generateProblemToProductIdeas(notes, analysis));

  // Strategy 5: Skill Amplifier — double down on strengths
  ideas.push(...generateSkillAmplifierIdeas(notes, analysis));

  // Strategy 6: Portfolio Standouts — ideas that impress recruiters
  ideas.push(...generatePortfolioIdeas(notes, analysis));

  // Strategy 7: Micro-SaaS Opportunities
  ideas.push(...generateMicroSaaSIdeas(notes, analysis));

  // Strategy 8: Community & Open Source
  ideas.push(...generateCommunityIdeas(notes, analysis));

  // Deduplicate, score by relevance, return top 6
  const uniqueIdeas = deduplicateIdeas(ideas);
  const scoredIdeas = scoreAndRankIdeas(uniqueIdeas, analysis);

  return scoredIdeas.slice(0, 6);
};

// ─── Deep Knowledge Analysis ─────────────────────────────────────────────────

const analyzeKnowledgeBase = (notes) => {
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
    // Prefer "unexpected" connections — they make the most creative ideas
    if (a.type !== b.type) return a.type === 'unexpected' ? -1 : 1;
    return b.similarity - a.similarity;
  });
};

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

// ─── Strategy 1: Cross-Pollination ──────────────────────────────────────────

const generateCrossPollinationIdeas = (notes, analysis) => {
  const ideas = [];
  const { hiddenConnections } = analysis;

  const unexpectedPairs = hiddenConnections
    .filter(c => c.type === 'unexpected')
    .slice(0, 3);

  const templates = [
    {
      generate: (noteA, noteB) => ({
        title: `${extractConcept(noteA)} meets ${extractConcept(noteB)}`,
        description: `What if you combined "${noteA.title}" with "${noteB.title}"? Build a tool that bridges these two worlds — unexpected combinations often create the most innovative products. Think about what problems exist at the intersection of these topics.`,
        type: 'cross-pollination'
      })
    },
    {
      generate: (noteA, noteB) => ({
        title: `${extractConcept(noteA)}-Powered ${extractConcept(noteB)} Platform`,
        description: `Use your knowledge from "${noteA.title}" to reimagine how "${noteB.title}" works. This cross-domain approach creates unique solutions that others in either field haven't thought of.`,
        type: 'cross-pollination'
      })
    },
    {
      generate: (noteA, noteB) => ({
        title: `The ${extractConcept(noteA)} × ${extractConcept(noteB)} Experiment`,
        description: `An experimental project that fuses "${noteA.title}" with "${noteB.title}". Sometimes the best ideas come from smashing two seemingly unrelated concepts together. Prototype it in a weekend hackathon.`,
        type: 'cross-pollination'
      })
    }
  ];

  unexpectedPairs.forEach((conn, i) => {
    const template = templates[i % templates.length];
    const result = template.generate(conn.noteA, conn.noteB);
    const allTags = [...new Set([...(conn.noteA.tags || []), ...(conn.noteB.tags || [])])];

    ideas.push({
      id: `cross-${i}`,
      ...result,
      technologies: allTags.slice(0, 5),
      relatedNoteIds: [conn.noteA.id, conn.noteB.id],
      confidence: 75 + Math.round(conn.similarity * 40),
      reasoning: `NLP found a hidden connection (${Math.round(conn.similarity * 100)}% similarity) between these notes.`
    });
  });

  return ideas;
};

// ─── Strategy 2: Gap Analysis ───────────────────────────────────────────────

const generateGapAnalysisIdeas = (notes, analysis) => {
  const ideas = [];
  const { techProfile } = analysis;

  const gaps = [];
  if (techProfile.frontend > 3 && techProfile.backend < 2) gaps.push({ gap: 'backend', has: 'frontend' });
  if (techProfile.backend > 3 && techProfile.frontend < 2) gaps.push({ gap: 'frontend', has: 'backend' });
  if (techProfile.frontend > 2 && techProfile.database < 1) gaps.push({ gap: 'database', has: 'frontend' });
  if (techProfile.ai < 1 && techProfile.frontend > 2) gaps.push({ gap: 'ai', has: 'web-dev' });
  if (techProfile.devops < 1 && (techProfile.frontend > 2 || techProfile.backend > 2)) gaps.push({ gap: 'devops', has: 'development' });

  const gapProjects = {
    'backend': {
      title: 'Build a Real-Time API with WebSockets',
      description: 'Your frontend skills are strong but backend is underrepresented. Build a real-time collaborative tool (like a shared whiteboard or live code editor) to level up your backend game. WebSockets + Node.js is a powerful combo recruiters love.',
      technologies: ['node', 'websockets', 'express', 'redis']
    },
    'frontend': {
      title: 'Interactive Data Dashboard with Animations',
      description: 'You know backend well but could strengthen frontend. Build a beautiful, interactive analytics dashboard with animated charts, drag-and-drop widgets, and responsive design. Great for learning modern CSS and React patterns.',
      technologies: ['react', 'd3.js', 'css-animations', 'framer-motion']
    },
    'database': {
      title: 'Multi-Database Comparison Playground',
      description: 'You build UIs but haven\'t explored databases deeply. Create an interactive app that lets users run the same query across SQL, MongoDB, and Neo4j — see performance differences, data models, and tradeoffs visually.',
      technologies: ['postgresql', 'mongodb', 'neo4j', 'react']
    },
    'ai': {
      title: 'AI Content Analyzer & Smart Summarizer',
      description: 'Add AI superpowers to your toolkit! Build a tool that summarizes articles, extracts key topics, detects sentiment, and generates mind maps from any text. Use OpenAI API — easier than you think and hugely impressive.',
      technologies: ['openai-api', 'react', 'node', 'nlp']
    },
    'devops': {
      title: 'One-Click Deploy Dashboard',
      description: 'Level up with DevOps by building a platform that auto-deploys GitHub repos with one click. Learn Docker, CI/CD, and cloud hosting by building the very tool that automates them.',
      technologies: ['docker', 'github-api', 'aws', 'node']
    }
  };

  gaps.slice(0, 2).forEach((gap, i) => {
    const project = gapProjects[gap.gap];
    if (project) {
      ideas.push({
        id: `gap-${i}`,
        ...project,
        relatedNoteIds: notes.slice(0, 2).map(n => n.id),
        confidence: 78,
        type: 'gap-analysis',
        reasoning: `Your ${gap.has} skills are strong, but ${gap.gap} is a gap worth filling.`
      });
    }
  });

  return ideas;
};

// ─── Strategy 3: Trend Fusion ───────────────────────────────────────────────

const generateTrendFusionIdeas = (notes, analysis) => {
  const ideas = [];
  const { skills, topKeywords, domains } = analysis;

  const trends = [
    {
      trend: 'AI Agents',
      match: (s) => s.some(x => ['ai', 'python', 'node', 'javascript'].includes(x)),
      idea: {
        title: 'AI Agent Builder — Visual Workflow Automation',
        description: 'AI agents are the hottest trend in tech right now. Build a visual tool where users chain AI agents together to automate complex workflows — like "summarize my emails → create tasks → schedule on calendar". Drag-and-drop interface makes it accessible to non-developers.',
        technologies: ['react', 'openai-api', 'node', 'websockets']
      }
    },
    {
      trend: 'AI Dev Tools',
      match: (s) => s.some(x => ['react', 'javascript', 'node', 'github'].includes(x)),
      idea: {
        title: 'AI Code Review Bot — Smarter Pull Requests',
        description: 'Build a GitHub app that reviews PRs using AI. It catches bugs, suggests improvements, explains complex code to juniors, and auto-generates test cases. Integrate with GitHub webhooks for seamless workflow. Every team needs this.',
        technologies: ['github-api', 'openai-api', 'react', 'node']
      }
    },
    {
      trend: 'Graph + AI',
      match: (s) => s.some(x => ['neo4j', 'graph', 'database'].includes(x)),
      idea: {
        title: 'Knowledge Graph AI Search Engine',
        description: 'Combine graph databases with AI for semantic search. Users ask questions in plain English, AI converts to graph queries, results show visual connections between concepts. Like having a conversation with Wikipedia.',
        technologies: ['neo4j', 'openai-api', 'react', 'd3.js']
      }
    },
    {
      trend: 'Local-First',
      match: (s) => s.some(x => ['react', 'javascript'].includes(x)),
      idea: {
        title: 'Offline-First Collaborative Notes (Zero Cloud)',
        description: 'Build a notes app that works 100% offline and syncs peer-to-peer using CRDTs — no cloud server needed. Privacy-first, blazing fast, and technically impressive. The future of software is local-first.',
        technologies: ['react', 'indexeddb', 'webrtc', 'crdt']
      }
    },
    {
      trend: 'Voice AI',
      match: () => true,
      idea: {
        title: 'Voice-to-Prototype — Speak Your App Into Existence',
        description: 'Describe an app idea by voice, and AI generates a working prototype with real components. Combines speech-to-text, AI code generation, and live preview. The ultimate demo project — shows you understand where tech is heading.',
        technologies: ['web-speech-api', 'openai-api', 'react', 'sandpack']
      }
    },
    {
      trend: 'Blockchain Utility',
      match: (s) => s.some(x => ['blockchain', 'web3', 'crypto'].includes(x)),
      idea: {
        title: 'Blockchain-Verified Developer Credentials',
        description: 'Issue tamper-proof skill certificates on blockchain. When developers complete projects or pass assessments, they earn a verifiable credential. Employers verify instantly — no more fake resumes. Bridges Web3 and real-world utility.',
        technologies: ['blockchain', 'react', 'node', 'smart-contracts']
      }
    }
  ];

  const matchedTrends = trends.filter(t => t.match(skills));

  matchedTrends.slice(0, 2).forEach((t, i) => {
    ideas.push({
      id: `trend-${i}`,
      ...t.idea,
      relatedNoteIds: findRelatedNotes(notes, t.idea.technologies),
      confidence: 82,
      type: 'trend-fusion',
      reasoning: `"${t.trend}" is a hot industry trend that aligns with your skills.`
    });
  });

  return ideas;
};

// ─── Strategy 4: Problem → Product ──────────────────────────────────────────

const generateProblemToProductIdeas = (notes, analysis) => {
  const ideas = [];
  const { domains, topKeywords } = analysis;

  const painPoints = [];
  notes.forEach(note => {
    const content = (note.title + ' ' + note.content).toLowerCase();
    const problemSignals = [
      'hard to', 'difficult', 'frustrated', 'wish there was', 'no good',
      'problem', 'annoying', 'struggle', 'waste time', 'repetitive',
      'boring', 'manual', 'tedious', 'slow', 'broken', 'need a',
      'hate', 'missing', 'lack', 'confusing', 'complicated', 'painful'
    ];

    const found = problemSignals.filter(signal => content.includes(signal));
    if (found.length > 0) {
      painPoints.push({ note, signals: found, strength: found.length });
    }
  });

  painPoints.sort((a, b) => b.strength - a.strength);

  painPoints.slice(0, 2).forEach((pp, i) => {
    const noteTitle = pp.note.title;
    const noteTags = pp.note.tags || [];

    ideas.push({
      id: `problem-${i}`,
      title: `SaaS Solution: Fix "${noteTitle}"`,
      description: `You identified a real pain point in "${noteTitle}". The best startups solve the founder's own problems. Build an MVP around this frustration — you already understand the problem deeply. Ship it, get 10 users, iterate. That's how billion-dollar companies start.`,
      technologies: [...new Set([...noteTags, 'react', 'node'])].slice(0, 5),
      relatedNoteIds: [pp.note.id],
      confidence: 85 + Math.min(pp.strength * 2, 10),
      type: 'problem-to-product',
      reasoning: `Detected ${pp.strength} problem signals in your note: "${pp.signals.slice(0, 3).join('", "')}"`
    });
  });

  // Domain-specific product ideas
  if (analysis.domains.includes('education')) {
    ideas.push({
      id: 'problem-edu',
      title: 'Peer Learning Matchmaker for Developers',
      description: 'Match developers who want to learn the same tech. Weekly pair programming sessions, shared study plans, accountability tracking, and progress leaderboards. Solves the "learning alone is hard" problem that every self-taught developer faces.',
      technologies: ['react', 'node', 'websockets', 'matching-algorithm'],
      relatedNoteIds: findRelatedNotes(notes, ['learn', 'education', 'study']),
      confidence: 80,
      type: 'problem-to-product',
      reasoning: 'Your notes show interest in education and learning.'
    });
  }

  if (analysis.domains.includes('finance')) {
    ideas.push({
      id: 'problem-fin',
      title: 'Smart Split — AI Expense Splitter for Groups',
      description: 'Goes way beyond basic splitting. AI categorizes expenses, suggests fair splits based on context, handles recurring group expenses, and settles debts with minimum transactions. UPI integration for instant settlement in India.',
      technologies: ['react', 'node', 'ai', 'upi-api'],
      relatedNoteIds: findRelatedNotes(notes, ['expense', 'money', 'finance']),
      confidence: 83,
      type: 'problem-to-product',
      reasoning: 'Your notes show interest in finance/expenses.'
    });
  }

  return ideas;
};

// ─── Strategy 5: Skill Amplifier ────────────────────────────────────────────

const generateSkillAmplifierIdeas = (notes, analysis) => {
  const ideas = [];
  const { topTags } = analysis;

  if (topTags.length === 0) return ideas;

  const strongestSkill = topTags[0].tag;
  const secondSkill = topTags[1]?.tag;

  const amplifiers = {
    'react': {
      title: 'React Visual Playground — Live Component Lab',
      description: 'An interactive playground where users edit React components live, see props/state changes visualized in real-time, and share snippets with a link. Like CodePen but smarter — AI suggests component improvements and accessibility fixes.',
      technologies: ['react', 'monaco-editor', 'sandpack', 'openai-api']
    },
    'javascript': {
      title: 'Algorithm Cinema — Animated Visualizations',
      description: 'Beautiful, cinematic visualizations of algorithms. Sorting, pathfinding, tree traversals — all rendered with smooth animations. Users can step through, adjust speed, and input their own data. Educational and mesmerizing.',
      technologies: ['javascript', 'd3.js', 'canvas-api', 'web-animations']
    },
    'python': {
      title: 'Python Automation Hub with Visual Pipeline Builder',
      description: 'A web UI where users visually build Python automation pipelines. Web scraping → data cleaning → email report — all drag-and-drop. Runs on schedule. Like Zapier but for developers who want more control.',
      technologies: ['python', 'flask', 'celery', 'react']
    },
    'node': {
      title: 'API Marketplace — Build, Document & Monetize APIs',
      description: 'A platform where developers build APIs, auto-generate beautiful docs, set rate limits, and charge for access. Like a solo developer\'s RapidAPI. Handles auth, billing, and analytics out of the box.',
      technologies: ['node', 'express', 'swagger', 'stripe']
    },
    'neo4j': {
      title: 'Visual Graph Query Builder with AI',
      description: 'Draw nodes and relationships on a canvas, and the app generates Cypher queries. Non-technical users can explore graph data visually. AI suggests interesting patterns and queries you haven\'t thought of.',
      technologies: ['neo4j', 'react', 'd3.js', 'openai-api']
    },
    'blockchain': {
      title: 'Blockchain Explorer with AI Narration',
      description: 'A blockchain explorer that doesn\'t show raw hex data — AI explains each transaction in plain English. "This wallet swapped 2 ETH for USDC on Uniswap, likely taking profits." Makes Web3 accessible to everyone.',
      technologies: ['blockchain', 'react', 'openai-api', 'web3.js']
    },
    'ai': {
      title: 'AI Model Arena — Head-to-Head Comparisons',
      description: 'Test the same prompt across GPT-4, Claude, Gemini, and open-source models side by side. Compare speed, quality, cost, and reasoning. Community voting ranks results. The ultimate AI benchmark tool.',
      technologies: ['react', 'node', 'openai-api', 'multiple-llm-apis']
    },
    'go': {
      title: 'Go Microservice Generator & Dashboard',
      description: 'A CLI + web dashboard that scaffolds production-ready Go microservices. Auto-generates boilerplate, Docker configs, CI/CD pipelines, API docs, health checks, and Prometheus metrics. Ship in minutes, not days.',
      technologies: ['go', 'docker', 'grpc', 'prometheus']
    },
    'css': {
      title: 'CSS Battle Arena — Real-Time Design Challenges',
      description: 'Competitive CSS challenges where developers race to replicate designs pixel-perfectly. Real-time scoring with visual diff, global leaderboards, and weekly tournaments. Learn CSS by competing — addictive and educational.',
      technologies: ['css', 'react', 'websockets', 'canvas']
    }
  };

  if (amplifiers[strongestSkill]) {
    ideas.push({
      id: 'amplify-1',
      ...amplifiers[strongestSkill],
      relatedNoteIds: notes.filter(n => n.tags?.includes(strongestSkill)).slice(0, 3).map(n => n.id),
      confidence: 88,
      type: 'skill-amplifier',
      reasoning: `${capitalize(strongestSkill)} is your strongest skill (${topTags[0].count} notes). This project showcases deep mastery.`
    });
  }

  if (secondSkill && amplifiers[secondSkill] && secondSkill !== strongestSkill) {
    ideas.push({
      id: 'amplify-2',
      ...amplifiers[secondSkill],
      relatedNoteIds: notes.filter(n => n.tags?.includes(secondSkill)).slice(0, 3).map(n => n.id),
      confidence: 82,
      type: 'skill-amplifier',
      reasoning: `${capitalize(secondSkill)} is your second strongest skill. This deepens your expertise.`
    });
  }

  return ideas;
};

// ─── Strategy 6: Portfolio Standouts ────────────────────────────────────────

const generatePortfolioIdeas = (notes, analysis) => {
  const ideas = [];
  const { techProfile, skills } = analysis;

  if (analysis.totalNotes < 4) return ideas;

  const portfolioProjects = [
    {
      match: () => techProfile.frontend > 2 && techProfile.backend > 1,
      idea: {
        title: 'Real-Time Collaborative Whiteboard',
        description: 'Multiple users draw, add sticky notes, and brainstorm together in real-time. WebSocket sync, infinite canvas, shape tools, and export to PDF. This single project proves full-stack mastery, real-time architecture, and product thinking. Recruiters remember this.',
        technologies: ['react', 'canvas-api', 'websockets', 'node'],
        confidence: 90
      }
    },
    {
      match: () => techProfile.ai > 0 || skills.includes('ai'),
      idea: {
        title: 'AI Meeting Notes — Auto Summary & Action Items',
        description: 'Record meetings, AI transcribes, extracts action items, identifies decisions, and sends summaries to Slack. Shows you can build production-grade AI products, not just demos. Top-tier portfolio piece.',
        technologies: ['whisper-api', 'openai-api', 'react', 'node'],
        confidence: 91
      }
    },
    {
      match: () => techProfile.database > 0 || techProfile.frontend > 1,
      idea: {
        title: 'Developer Life Dashboard — GitHub × Habits × Goals',
        description: 'Track your developer life holistically — commits, learning hours, languages used, habits, goals. Beautiful animated charts, AI-generated weekly reports, and streak tracking. Shows data skills + self-improvement mindset.',
        technologies: ['react', 'd3.js', 'github-api', 'node'],
        confidence: 85
      }
    }
  ];

  portfolioProjects.forEach((pp, i) => {
    if (pp.match()) {
      ideas.push({
        id: `portfolio-${i}`,
        ...pp.idea,
        relatedNoteIds: notes.slice(0, 2).map(n => n.id),
        type: 'portfolio-standout',
        reasoning: 'This type of project consistently impresses in developer portfolios and interviews.'
      });
    }
  });

  return ideas.slice(0, 1);
};

// ─── Strategy 7: Micro-SaaS ────────────────────────────────────────────────

const generateMicroSaaSIdeas = (notes, analysis) => {
  const ideas = [];
  const { skills, domains, topKeywords } = analysis;

  const microSaasIdeas = [
    {
      match: () => skills.some(s => ['react', 'node', 'javascript'].includes(s)),
      idea: {
        title: 'Waitlist Builder — Launch Landing Pages in 60 Seconds',
        description: 'Indie hackers need landing pages fast. Build a tool that generates beautiful waitlist pages with email capture, referral tracking, social proof counters, and auto-updates. Charge $5/month. Simple to build, recurring revenue potential.',
        technologies: ['react', 'node', 'email-api', 'stripe'],
        confidence: 84
      }
    },
    {
      match: () => skills.some(s => ['ai', 'openai', 'python', 'node'].includes(s)),
      idea: {
        title: 'AI README Generator — Beautiful Docs in One Click',
        description: 'Paste a GitHub URL, AI analyzes the codebase and generates a professional README with setup instructions, API docs, architecture diagrams, badges, and even screenshots. Free for public repos, paid for private.',
        technologies: ['github-api', 'openai-api', 'react', 'node'],
        confidence: 86
      }
    },
    {
      match: () => analysis.domains.includes('social') || topKeywords.some(k => k.word === 'india' || k.word === 'indian'),
      idea: {
        title: 'Jugaad Jobs — Hyperlocal Gig Board for India',
        description: 'A simple, WhatsApp-friendly job board for tier-2/3 cities. Electricians, tutors, delivery — post and find gigs via WhatsApp chatbot + lightweight web app. Massive untapped market with real social impact.',
        technologies: ['whatsapp-api', 'node', 'react', 'mongodb'],
        confidence: 80
      }
    }
  ];

  microSaasIdeas.forEach((ms, i) => {
    if (ms.match()) {
      ideas.push({
        id: `saas-${i}`,
        ...ms.idea,
        relatedNoteIds: findRelatedNotes(notes, ms.idea.technologies),
        type: 'micro-saas',
        reasoning: 'Small enough to build solo in weeks, practical enough to monetize.'
      });
    }
  });

  return ideas.slice(0, 1);
};

// ─── Strategy 8: Community & Open Source ────────────────────────────────────

const generateCommunityIdeas = (notes, analysis) => {
  const ideas = [];
  const { topTags } = analysis;

  if (topTags.length >= 2) {
    const primary = topTags[0].tag;
    const secondary = topTags[1].tag;

    ideas.push({
      id: 'community-1',
      title: `${capitalize(primary)} + ${capitalize(secondary)} Developer Toolkit`,
      description: `Create a curated open-source toolkit and "awesome list" for the ${primary} + ${secondary} ecosystem. Include boilerplates, best practices, common patterns, a project generator CLI, and a companion website. Open source projects build your reputation faster than anything else.`,
      technologies: [primary, secondary, 'cli', 'github'],
      relatedNoteIds: notes.filter(n =>
        n.tags?.includes(primary) || n.tags?.includes(secondary)
      ).slice(0, 3).map(n => n.id),
      confidence: 76,
      type: 'community',
      reasoning: `Open source in ${primary} + ${secondary} builds credibility, GitHub stars, and professional connections.`
    });
  }

  return ideas;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const extractConcept = (note) => {
  const words = note.title.split(/\s+/).filter(w => w.length > 2);
  return words.slice(0, 3).join(' ');
};

const findRelatedNotes = (notes, keywords) => {
  return notes
    .filter(n => {
      const content = (n.title + ' ' + n.content + ' ' + (n.tags || []).join(' ')).toLowerCase();
      return keywords.some(kw => content.includes(kw.toLowerCase()));
    })
    .slice(0, 3)
    .map(n => n.id);
};

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

const isProject = (content) => {
  const indicators = ['build', 'create', 'develop', 'app', 'platform', 'website', 'tool', 'system', 'project', 'prototype', 'mvp'];
  return indicators.some(ind => content.includes(ind));
};

const isProblemStatement = (content) => {
  const indicators = ['problem', 'issue', 'challenge', 'difficult', 'hard', 'struggle', 'pain', 'frustrat', 'annoying', 'broken', 'slow'];
  return indicators.some(ind => content.includes(ind));
};

const isInterestArea = (content) => {
  const indicators = ['learn', 'explore', 'interested', 'curious', 'want to', 'future', 'excited', 'try', 'experiment'];
  return indicators.some(ind => content.includes(ind));
};

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

const deduplicateIdeas = (ideas) => {
  const seen = new Map();
  return ideas.filter(idea => {
    const key = idea.title.toLowerCase().replace(/[^a-z]/g, '').substring(0, 30);
    if (seen.has(key)) return false;
    seen.set(key, true);
    return true;
  });
};

const scoreAndRankIdeas = (ideas, analysis) => {
  return ideas.map(idea => {
    let score = idea.confidence || 70;

    // Boost for more related notes
    score += Math.min(idea.relatedNoteIds.length * 3, 12);

    // Boost for matching strong skills
    const strongTags = analysis.topTags.slice(0, 5).map(t => t.tag);
    const matchingTags = idea.technologies.filter(t =>
      strongTags.includes(t.toLowerCase())
    ).length;
    score += matchingTags * 4;

    // Boost cross-pollination (most creative)
    if (idea.type === 'cross-pollination') score += 6;

    // Boost problem-to-product (most practical)
    if (idea.type === 'problem-to-product') score += 5;

    // Boost portfolio standouts (most impressive)
    if (idea.type === 'portfolio-standout') score += 4;

    // Boost trend fusion (most timely)
    if (idea.type === 'trend-fusion') score += 3;

    idea.confidence = Math.min(Math.round(score), 97);
    return idea;
  }).sort((a, b) => b.confidence - a.confidence);
};

const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

module.exports = { generateIdeas };
