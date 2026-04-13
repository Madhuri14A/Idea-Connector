// Remove duplicate ideas and score them by relevance

/**
 * Remove duplicate ideas (same title)
 */
const deduplicateIdeas = (ideas) => {
  const seen = new Map();
  return ideas.filter(idea => {
    const key = idea.title.toLowerCase().replace(/[^a-z]/g, '').substring(0, 30);
    if (seen.has(key)) return false;
    seen.set(key, true);
    return true;
  });
};

/**
 * Score and rank ideas by relevance to your notes
 */
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

/**
 * Format idea as a "Suggestion" for display
 * (adds user-friendly prefix and clean description)
 */
const formatAsSuggestion = (idea) => {
  const hasConnection = Array.isArray(idea.relatedNoteIds) && idea.relatedNoteIds.length >= 2;

  let suggestionType = 'Improvement';
  if (hasConnection) {
    suggestionType = 'Connection';
  } else if (idea.type === 'gap-analysis') {
    suggestionType = 'Missing Piece';
  }

  const cleanDescription = String(idea.description || '')
    .replace(/\b(weekend hackathon|recruiters love|DNA|cross-domain approach|innovative products?)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const prefix = hasConnection
    ? 'These notes are contextually related. Try combining them this way:'
    : suggestionType === 'Missing Piece'
      ? 'Your notes suggest a gap. A practical next step:'
      : 'Based on your notes, here is a practical improvement:';

  return {
    ...idea,
    type: 'suggestion',
    suggestionType,
    title: hasConnection ? `Connect: ${idea.title}` : `Improve: ${idea.title}`,
    description: `${prefix} ${cleanDescription}`.trim()
  };
};

module.exports = {
  deduplicateIdeas,
  scoreAndRankIdeas,
  formatAsSuggestion
};
