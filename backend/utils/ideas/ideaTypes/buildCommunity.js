// Build community - create projects that help others learn what you know

/**
 * Create open-source projects to build reputation and community
 * Example: React + AI toolkit → GitHub stars + professional credibility
 */
const generateBuildCommunity = (notes, analysis) => {
  const ideas = [];
  const { topTags } = analysis;

  if (topTags.length >= 2) {
    const primary = topTags[0].tag;
    const secondary = topTags[1].tag;

    ideas.push({
      id: 'community-1',
      title: `${primary.charAt(0).toUpperCase() + primary.slice(1)} + ${secondary.charAt(0).toUpperCase() + secondary.slice(1)} Developer Toolkit`,
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

module.exports = { generateBuildCommunity };
