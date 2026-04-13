// Modular idea generator - takes notes and creates 6 project suggestions
// Flow: Analyze notes -> Generate ideas from all strategies -> Remove duplicates -> Score and rank -> Format for display

const { analyzeYourNotes, findHiddenConnections } = require('./helpers/analyzeYourNotes');
const { deduplicateIdeas, scoreAndRankIdeas, formatAsSuggestion } = require('./helpers/rankAndScore');

// Strategy generators (one per idea type)
const { generateConnectRelatedIdeas } = require('./ideaTypes/connectRelatedIdeas');
const { generateFindGaps } = require('./ideaTypes/findGaps');
const { generateSpotTrends } = require('./ideaTypes/spotTrends');
const { generateTurnProblemsIntoProducts } = require('./ideaTypes/turnProblemsIntoProducts');
const { generateBoostTopSkills } = require('./ideaTypes/boostTopSkills');
const { generateShowcasePortfolio } = require('./ideaTypes/showcasePortfolio');
const { generateQuickStartups } = require('./ideaTypes/quickStartups');
const { generateBuildCommunity } = require('./ideaTypes/buildCommunity');

/**
 * Main entry point: Generate 6 compelling project ideas
 * @param {Array} notes - User's notes (each note has: id, title, content, tags)
 * @param {Object} userAnalysis - Optional pre-computed analysis (for performance)
 * @returns {Promise<Array>} - 6 formatted idea suggestions
 */
const generateIdeas = async (notes, userAnalysis = null) => {
  try {
    // Step 1: Analyze knowledge base (what does the user know? what are they building?)
    const analysis = userAnalysis || analyzeYourNotes(notes);

    // Step 2: Generate ideas from all 8 strategies
    const allIdeas = [];
    allIdeas.push(...generateConnectRelatedIdeas(notes, analysis));
    allIdeas.push(...generateFindGaps(notes, analysis));
    allIdeas.push(...generateSpotTrends(notes, analysis));
    allIdeas.push(...generateTurnProblemsIntoProducts(notes, analysis));
    allIdeas.push(...generateBoostTopSkills(notes, analysis));
    allIdeas.push(...generateShowcasePortfolio(notes, analysis));
    allIdeas.push(...generateQuickStartups(notes, analysis));
    allIdeas.push(...generateBuildCommunity(notes, analysis));

    // Step 3: Remove exact duplicates (same title + description)
    const deduped = deduplicateIdeas(allIdeas);

    // Step 4: Score and rank by relevance
    const scored = scoreAndRankIdeas(deduped, analysis);

    // Step 5: Format for display (add context, make human-readable)
    const formatted = scored.slice(0, 6).map(formatAsSuggestion);

    return formatted;
  } catch (error) {
    console.error('Error generating ideas:', error);
    throw error;
  }
};

module.exports = { generateIdeas };
