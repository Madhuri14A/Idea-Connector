// Spot emerging tech trends and suggest projects that combine them

const { findRelatedNotes } = require('../helpers/utilities');
const trendExamples = require('../ideaExamples/trendExamples');

/**
 * Suggest hot industry trends that match your skills
 * Example: You know React → AI Agents are trending → Build AI agent builder
 */
const generateSpotTrends = (notes, analysis) => {
  const ideas = [];
  const { skills } = analysis;

  const trends = trendExamples.filter(t => t.match(skills));

  trends.slice(0, 2).forEach((t, i) => {
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

module.exports = { generateSpotTrends };
