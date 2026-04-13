// Turn frustrations and pain points into startup ideas

const { findRelatedNotes, capitalize } = require('../helpers/utilities');
const problemExamples = require('../ideaExamples/problemExamples');

/**
 * Find pain points in your notes and turn them into startup ideas
 * Example: "I wish there was X" → Build and sell X as a SaaS
 */
const generateTurnProblemsIntoProducts = (notes, analysis) => {
  const ideas = [];
  const { domains } = analysis;

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
      description: `You identified a real pain point in "${noteTitle}". The best startups solve the founder's own problems. Build an MVP around this frustration - you already understand the problem deeply. Ship it, get 10 users, iterate. That's how billion-dollar companies start.`,
      technologies: [...new Set([...noteTags, 'react', 'node'])].slice(0, 5),
      relatedNoteIds: [pp.note.id],
      confidence: 85 + Math.min(pp.strength * 2, 10),
      type: 'problem-to-product',
      reasoning: `Detected ${pp.strength} problem signals: "${pp.signals.slice(0, 3).join('", "')}"`
    });
  });

  // Add domain-specific problem ideas
  const domainProblems = problemExamples.filter(p => domains.includes(p.domain));
  domainProblems.slice(0, 1).forEach(p => {
    ideas.push({
      ...p.idea,
      relatedNoteIds: findRelatedNotes(notes, p.keywords),
      confidence: 83,
      type: 'problem-to-product',
      reasoning: `Your notes show interest in ${p.domain}.`
    });
  });

  return ideas;
};

module.exports = { generateTurnProblemsIntoProducts };
