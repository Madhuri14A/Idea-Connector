const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

const extractKeywords = (text, topN = 10) => {
  const words = tokenizer.tokenize(text.toLowerCase());

  const stopwords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'is', 'are', 'was', 'be', 'been', 'being',
    'with', 'this', 'that', 'it', 'as', 'by', 'from', 'use', 'using', 'used', 'can', 'will', 'have', 'has', 'had',
    'not', 'do', 'does', 'did', 'so', 'if', 'its', 'my', 'your', 'we', 'they', 'i', 'he', 'she', 'you', 'us', 'our',
    'which', 'who', 'what', 'when', 'where', 'how', 'about', 'into', 'up', 'out', 'like', 'than', 'more', 'also',
    'get', 'set', 'make', 'made', 'new', 'add', 'note', 'notes', 'project', 'create', 'creates', 'creating', 'created',
    'build', 'builds', 'building', 'built', 'work', 'works', 'working', 'worked', 'need', 'needs', 'needed',
    'just', 'one', 'two', 'three', 'first', 'some', 'any', 'all', 'each', 'no', 'yes', 'then', 'now', 'after',
    'before', 'should', 'would', 'could', 'may', 'might', 'want', 'let', 'run', 'runs', 'running', 'see', 'know',
    'way', 'time', 'thing', 'things', 'type', 'types', 'different', 'used', 'help', 'allows', 'allow', 'support',
    'include', 'includes', 'including', 'provides', 'provide', 'feature', 'features', 'system', 'platform', 'tool',
    'implement', 'implemented', 'implementing', 'example', 'simple', 'basic', 'similar', 'same', 'well', 'also'
  ]);

  // Filter BEFORE stemming — so 'creating' matches 'create' in the stoplist
  const rawFiltered = words.filter(w => !stopwords.has(w) && w.length > 2);
  const stemmed = rawFiltered.map(w => stemmer.stem(w));
  
  
  const freqMap = {};
  stemmed.forEach(word => {
    freqMap[word] = (freqMap[word] || 0) + 1;
  });
  
  return Object.entries(freqMap)
    .map(([word, count]) => ({ word, score: count }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
};

const getCosineSimilarity = (text1, text2) => {
  const keywords1 = extractKeywords(text1, 20);
  const keywords2 = extractKeywords(text2, 20);
  
  const vec1 = {};
  const vec2 = {};
  keywords1.forEach(({word, score}) => vec1[word] = score);
  keywords2.forEach(({word, score}) => vec2[word] = score);
  
  let dotProduct = 0;
  const words = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
  
  words.forEach(word => {
    dotProduct += (vec1[word] || 0) * (vec2[word] || 0);
  });
  
  const mag1 = Math.sqrt(Object.values(vec1).reduce((sum, v) => sum + v * v, 0));
  const mag2 = Math.sqrt(Object.values(vec2).reduce((sum, v) => sum + v * v, 0));
  
  if (mag1 === 0 || mag2 === 0) return 0;
  
  return dotProduct / (mag1 * mag2);
};

const findSimilarNotes = (targetNote, allNotes, threshold = 0.4) => {
  const targetText = `${targetNote.title} ${targetNote.content} ${(targetNote.tags || []).join(' ')}`;
  
  return allNotes
    .filter(note => note.id !== targetNote.id)
    .map(note => {
      const noteText = `${note.title} ${note.content} ${(note.tags || []).join(' ')}`;
      const similarity = getCosineSimilarity(targetText, noteText);
      return { 
        noteId: note.id, 
        similarity: Math.round(similarity * 100) / 100 // Round to 2 decimals
      };
    })
    .filter(({similarity}) => similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity);
};

module.exports = { 
  extractKeywords, 
  getCosineSimilarity, 
  findSimilarNotes 
};
