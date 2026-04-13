// Find unexpected connections between topics in notes

const { extractConcept } = require('../helpers/utilities');

/**
 * Find unexpected connections between your notes
 * Example: "React + Finance" → "AI-Powered Expense Splitter"
 */
const generateConnectRelatedIdeas = (notes, analysis) => {
  const ideas = [];
  const { hiddenConnections } = analysis;

  const unexpectedPairs = hiddenConnections
    .filter(c => c.type === 'unexpected')
    .slice(0, 3);

  const templates = [
    {
      generate: (noteA, noteB) => ({
        title: `${extractConcept(noteA)} meets ${extractConcept(noteB)}`,
        description: `What if you combined "${noteA.title}" with "${noteB.title}"? Build a tool that bridges these two worlds. Unexpected combinations often create the most innovative products. Think about what problems exist at the intersection of these topics.`,
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
        description: `An experimental project that fuses "${noteA.title}" with "${noteB.title}". Sometimes the best ideas come from smashing two seemingly unrelated concepts together.`,
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
      reasoning: `Found a hidden connection (${Math.round(conn.similarity * 100)}% similarity) between these notes.`
    });
  });

  return ideas;
};

module.exports = { generateConnectRelatedIdeas };
