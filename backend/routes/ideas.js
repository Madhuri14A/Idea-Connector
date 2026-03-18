
const express = require('express');
const router = express.Router();
const driver = require('../config/neo4j');
const { generateIdeas } = require('../utils/ideaGenerator');
const { generateAIEnhancedIdeas, enhanceIdea } = require('../utils/geminiService');

router.get('/generate', async (req, res) => {
  const session = driver.session();
  
  try {

    const result = await session.run(`
      MATCH (u:User {email: $userId})
      MATCH (u)-[:CREATED]->(n:Note)
      OPTIONAL MATCH (n)-[r:RELATES_TO]-(c:Note)
      RETURN n, collect({note: c, strength: r.strength}) as connections
      ORDER BY n.createdAt DESC
    `, { userId: req.userId });
    
    const notes = result.records.map(record => ({
      ...record.get('n').properties,
      connections: record.get('connections').filter(c => c.note !== null)
    }));

    const localIdeas = generateIdeas(notes);

    const ideas = await generateAIEnhancedIdeas(notes, localIdeas);
    
    res.json({ ideas });
  } catch (error) {
    console.error('Error generating ideas:', error);
    res.status(500).json({ error: 'Failed to generate ideas' });
  } finally {
    await session.close();
  }
});

router.post('/enhance', async (req, res) => {
  const session = driver.session();
  const { idea } = req.body;

  if (!idea) {
    return res.status(400).json({ error: 'Idea is required' });
  }

  try {
    const result = await session.run(`
      MATCH (u:User {email: $userId})
      MATCH (n:Note)
      WHERE (u)-[:CREATED]->(n)
      RETURN n
    `, { userId: req.userId });

    const notes = result.records.map(record => record.get('n').properties);
    const enhancedIdea = await enhanceIdea(idea, notes);

    res.json({ idea: enhancedIdea });
  } catch (error) {
    console.error('Error enhancing idea:', error);
    res.status(500).json({ error: 'Failed to enhance idea' });
  } finally {
    await session.close();
  }
});

module.exports = router;

