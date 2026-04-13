// Find gaps - skills you want to learn or areas missing from your portfolio

const { findRelatedNotes } = require('../helpers/utilities');
const gapExamples = require('../ideaExamples/gapExamples');

/**
 * Find what you're missing in your skill stack
 * Example: Strong frontend but weak backend → Build real-time API
 */
const generateFindGaps = (notes, analysis) => {
  const ideas = [];
  const { techProfile } = analysis;

  const gaps = [];
  if (techProfile.frontend > 3 && techProfile.backend < 2) gaps.push({ gap: 'backend', has: 'frontend' });
  if (techProfile.backend > 3 && techProfile.frontend < 2) gaps.push({ gap: 'frontend', has: 'backend' });
  if (techProfile.frontend > 2 && techProfile.database < 1) gaps.push({ gap: 'database', has: 'frontend' });
  if (techProfile.ai < 1 && techProfile.frontend > 2) gaps.push({ gap: 'ai', has: 'web-dev' });
  if (techProfile.devops < 1 && (techProfile.frontend > 2 || techProfile.backend > 2)) gaps.push({ gap: 'devops', has: 'development' });

  gaps.slice(0, 2).forEach((gap, i) => {
    const project = gapExamples[gap.gap];
    if (project) {
      ideas.push({
        id: `gap-${i}`,
        ...project,
        relatedNoteIds: findRelatedNotes(notes, [gap.gap, 'learn', 'skill']),
        confidence: 78,
        type: 'gap-analysis',
        reasoning: `Your ${gap.has} skills are strong, but ${gap.gap} is a gap worth filling.`
      });
    }
  });

  return ideas;
};

module.exports = { generateFindGaps };
