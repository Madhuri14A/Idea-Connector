// Quick micro-SaaS ideas you could build and monetize

const { findRelatedNotes } = require('../helpers/utilities');
const microSaasExamples = require('../ideaExamples/microSaasExamples');

/**
 * Build small SaaS ideas you can ship solo and monetize quickly
 * Example: Waitlist builder ($5/month, passive income)
 */
const generateQuickStartups = (notes, analysis) => {
  const ideas = [];
  const { skills, domains, topKeywords } = analysis;

  const matchedIdeas = microSaasExamples.filter(idea => idea.match(skills, domains, topKeywords));

  matchedIdeas.forEach((ms, i) => {
    ideas.push({
      id: `saas-${i}`,
      ...ms.idea,
      relatedNoteIds: findRelatedNotes(notes, ms.idea.technologies),
      type: 'micro-saas',
      reasoning: 'Small enough to build solo in weeks, practical enough to monetize.'
    });
  });

  return ideas.slice(0, 1);
};

module.exports = { generateQuickStartups };
