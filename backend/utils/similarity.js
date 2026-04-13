const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

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

const normalizeTokens = (text = '') => {
  const words = tokenizer.tokenize(String(text).toLowerCase());
  return words
    .filter(w => !stopwords.has(w) && w.length > 2)
    .map(w => stemmer.stem(w));
};

const getNGrams = (tokens, n = 2) => {
  const grams = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    grams.push(tokens.slice(i, i + n).join(' '));
  }
  return grams;
};

const getJaccardSimilarity = (itemsA = [], itemsB = []) => {
  const setA = new Set(itemsA);
  const setB = new Set(itemsB);
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  setA.forEach(item => {
    if (setB.has(item)) intersection += 1;
  });

  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
};

const extractKeywords = (text, topN = 10) => {
  const stemmed = normalizeTokens(text);
  
  
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
  const getContextSimilarity = (noteA, noteB) => {
    const titleA = noteA.title || '';
    const titleB = noteB.title || '';
    const contentA = noteA.content || '';
    const contentB = noteB.content || '';

    const titleSimilarity = getCosineSimilarity(titleA, titleB);
    const contentSimilarity = getCosineSimilarity(contentA, contentB);

    const keywordA = extractKeywords(`${titleA} ${contentA}`, 20).map(k => k.word);
    const keywordB = extractKeywords(`${titleB} ${contentB}`, 20).map(k => k.word);
    const keywordSimilarity = getJaccardSimilarity(keywordA, keywordB);

    const tokensA = normalizeTokens(`${titleA} ${contentA}`).slice(0, 140);
    const tokensB = normalizeTokens(`${titleB} ${contentB}`).slice(0, 140);
    const bigramA = getNGrams(tokensA, 2);
    const bigramB = getNGrams(tokensB, 2);
    const phraseSimilarity = getJaccardSimilarity(bigramA, bigramB);

    const tagsA = (noteA.tags || []).map(t => String(t).toLowerCase());
    const tagsB = (noteB.tags || []).map(t => String(t).toLowerCase());
    const tagSimilarity = getJaccardSimilarity(tagsA, tagsB);

    // Context first, tags last
    const score = (
      (titleSimilarity * 0.35) +
      (contentSimilarity * 0.35) +
      (phraseSimilarity * 0.20) +
      (keywordSimilarity * 0.07) +
      (tagSimilarity * 0.03)
    );

    // Debug logging (shows why notes connect or don't)
    if (process.env.DEBUG_SIMILARITY) {
      console.log(`[SIM] ${noteA.id.slice(0,8)} vs ${noteB.id.slice(0,8)}: ${score.toFixed(3)} (title:${titleSimilarity.toFixed(2)} content:${contentSimilarity.toFixed(2)} phrase:${phraseSimilarity.toFixed(2)} kw:${keywordSimilarity.toFixed(2)} tag:${tagSimilarity.toFixed(2)})`);
    }

    return score;
  };
  
  const results = allNotes
    .filter(note => note.id !== targetNote.id)
    .map(note => {
      const similarity = getContextSimilarity(targetNote, note);
      return { 
        noteId: note.id, 
        similarity: Math.round(similarity * 100) / 100 // Round to 2 decimals
      };
    })
    .filter(({similarity}) => similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity);

  // Debug: show how many connections this note got
  if (process.env.DEBUG_SIMILARITY) {
    console.log(`[SIM] Note "${targetNote.title?.slice(0,30)}" threshold=${threshold}: ${results.length} matches found`);
  }

  return results;
};

module.exports = { 
  extractKeywords, 
  getCosineSimilarity, 
  findSimilarNotes 
};
