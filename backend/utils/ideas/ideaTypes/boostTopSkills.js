// Create showcase projects for your strongest skills

const skillExamples = require('../ideaExamples/skillExamples');

/**
 * Double down on your strongest skill
 * Example: You're great at React → Build React-specific showcase project
 */
const generateBoostTopSkills = (notes, analysis) => {
  const ideas = [];
  const { topTags } = analysis;

  if (topTags.length === 0) return ideas;

  const strongestSkill = topTags[0].tag;
  const secondSkill = topTags[1]?.tag;

  if (skillExamples[strongestSkill]) {
    ideas.push({
      id: 'amplify-1',
      ...skillExamples[strongestSkill],
      relatedNoteIds: notes.filter(n => n.tags?.includes(strongestSkill)).slice(0, 3).map(n => n.id),
      confidence: 88,
      type: 'skill-amplifier',
      reasoning: `${strongestSkill.toUpperCase()} is your strongest skill (${topTags[0].count} notes). This project showcases deep mastery.`
    });
  }

  if (secondSkill && skillExamples[secondSkill] && secondSkill !== strongestSkill) {
    ideas.push({
      id: 'amplify-2',
      ...skillExamples[secondSkill],
      relatedNoteIds: notes.filter(n => n.tags?.includes(secondSkill)).slice(0, 3).map(n => n.id),
      confidence: 82,
      type: 'skill-amplifier',
      reasoning: `${secondSkill.toUpperCase()} is your second strongest skill. This deepens your expertise.`
    });
  }

  return ideas;
};

module.exports = { generateBoostTopSkills };
