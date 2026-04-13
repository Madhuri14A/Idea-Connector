// Wrapper that delegates to the modular architecture
// This keeps backward compatibility with code that imports from utils/ideaGenerator.js

const { generateIdeas: generateModularIdeas } = require('./ideas/ideaGenerator');

const generateIdeas = async (notes) => {
  if (!notes || notes.length < 3) {
    return [{
      id: '1',
      title: 'Add More Notes First',
      description: 'Create at least 3-5 notes with different topics to get useful suggestions. More context helps us suggest practical improvements and meaningful note connections.',
      technologies: [],
      relatedNoteIds: [],
      confidence: 50,
      type: 'suggestion'
    }];
  }

  // Delegate to new modular system
  return generateModularIdeas(notes);
};

module.exports = { generateIdeas };
