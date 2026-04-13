// Build impressive portfolio projects that demonstrate your skills

const portfolioExamples = require('../ideaExamples/portfolioExamples');

/**
 * Create impressive portfolio projects that wow recruiters
 * Example: Real-time collab whiteboard (full-stack + real-time = wow factor)
 */
const generateShowcasePortfolio = (notes, analysis) => {
  const ideas = [];
  const { techProfile, skills } = analysis;

  if (analysis.totalNotes < 4) return ideas;

  const portfolioProjects = portfolioExamples.filter(pp => pp.match(techProfile, skills));

  portfolioProjects.forEach((pp, i) => {
    ideas.push({
      id: `portfolio-${i}`,
      ...pp.idea,
      relatedNoteIds: notes.slice(0, 2).map(n => n.id),
      type: 'portfolio-standout',
      reasoning: 'This type of project consistently impresses in developer portfolios and interviews.'
    });
  });

  return ideas.slice(0, 1);
};

module.exports = { generateShowcasePortfolio };
