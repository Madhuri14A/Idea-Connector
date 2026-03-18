const express = require('express');
const { v4: uuidv4 } = require('uuid');
const driver = require('../config/neo4j');

const router = express.Router();

router.get('/', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {email: $userId})
       MATCH (n:Note)
       WHERE (u)-[:CREATED]->(n) OR NOT (n)<-[:CREATED]-()
       OPTIONAL MATCH (n)-[r:RELATES_TO]-(c:Note) 
       RETURN n, collect({note: c, strength: r.strength}) as connections 
       ORDER BY n.createdAt DESC`,
      { userId: req.userId }
    );
    
    const notes = result.records.map(record => ({
      ...record.get('n').properties,
      connections: record.get('connections')
        .filter(c => c.note !== null)
        .map(c => ({
          note: c.note.properties,
          strength: c.strength
        }))
    }));
    
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  } finally {
    await session.close();
  }
});

router.get('/search/query', async (req, res) => {
  const { q, tags, sort = 'recent' } = req.query;
  const session = driver.session();
  
  try {
    let query = `MATCH (n:Note)`;
    let params = {};
    let whereConditions = [];

    if (q && q.trim()) {
      params.searchTerm = `(?i).*${q}.*`;
      whereConditions.push(`(n.title =~ $searchTerm OR n.content =~ $searchTerm)`);
    }

    if (tags && tags.trim()) {
      const tagArray = tags.split(',').map(t => t.trim().toLowerCase());
      params.tagArray = tagArray;
      whereConditions.push(`ANY(tag IN n.tags WHERE toLower(tag) IN $tagArray)`);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    if (sort === 'oldest') {
      query += ` RETURN n ORDER BY n.createdAt ASC`;
    } else if (sort === 'alphabetical') {
      query += ` RETURN n ORDER BY n.title ASC`;
    } else {
      query += ` RETURN n ORDER BY n.createdAt DESC`;
    }

    const result = await session.run(query, params);
    const notes = result.records.map(record => record.get('n').properties);
    
    res.json(notes);
  } catch (error) {
    console.error('Error searching notes:', error);
    res.status(500).json({ error: 'Failed to search notes' });
  } finally {
    await session.close();
  }
});

router.get('/:id/related', async (req, res) => {
  const { id } = req.params;
  const session = driver.session();
  
  try {

    const targetResult = await session.run(
      `MATCH (n:Note) WHERE n.id = $id RETURN n`,
      { id }
    );
    
    if (targetResult.records.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    const targetNote = targetResult.records[0].get('n').properties;

    const allNotesResult = await session.run(
      `MATCH (n:Note) RETURN n`
    );
    
    const allNotes = allNotesResult.records.map(r => r.get('n').properties);

    const { findSimilarNotes } = require('../utils/similarity');
    
    const relatedNotes = findSimilarNotes(targetNote, allNotes, 0.08); // Threshold for short notes with tags

    const topRelated = relatedNotes.slice(0, 5).map(({noteId, similarity}) => {
      const note = allNotes.find(n => n.id === noteId);
      return {
        id: noteId,
        title: note.title,
        similarity: similarity
      };
    });
    
    res.json(topRelated);
  } catch (error) {
    console.error('Error finding related notes:', error);
    res.status(500).json({ error: 'Failed to find related notes' });
  } finally {
    await session.close();
  }
});

router.get('/:id', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (n:Note {id: $id})
       OPTIONAL MATCH (n)-[r:RELATES_TO]-(c:Note)
       RETURN n, collect({note: c, strength: r.strength}) as connections`,
      { id: req.params.id }
    );
    
    if (result.records.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    const record = result.records[0];
    const note = {
      ...record.get('n').properties,
      connections: record.get('connections').filter(c => c.note !== null)
    };
    
    res.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  } finally {
    await session.close();
  }
});

router.post('/', async (req, res) => {
  const { title, content, tags = [] } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  
  const session = driver.session();
  try {
    const id = uuidv4();
    const result = await session.run(
      `MATCH (u:User {email: $userId})
       CREATE (n:Note {
        id: $id,
        title: $title,
        content: $content,
        tags: $tags,
        createdAt: datetime(),
        updatedAt: datetime()
       })
       CREATE (u)-[:CREATED]->(n)
       RETURN n`,
      { id, title, content, tags, userId: req.userId }
    );
    
    const note = result.records[0].get('n').properties;
    
    const allNotesResult = await session.run(`MATCH (n:Note) RETURN n`);
    const allNotes = allNotesResult.records.map(r => r.get('n').properties);
    
    const { findSimilarNotes } = require('../utils/similarity');
    const similarNotes = findSimilarNotes(note, allNotes, 0.08);
    
   
    for (let sim of similarNotes) {
      await session.run(
        `MATCH (a:Note), (b:Note)
         WHERE a.id = $id1 AND b.id = $id2
         MERGE (a)-[rel:RELATES_TO {strength: $strength}]-(b)`,
        { id1: note.id, id2: sim.noteId, strength: sim.similarity }
      );
    }
    
    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  } finally {
    await session.close();
  }
});

router.put('/:id', async (req, res) => {
  const { title, content, tags } = req.body;
  const session = driver.session();
  
  try {
    const result = await session.run(
      `MATCH (n:Note {id: $id})
       SET n.title = COALESCE($title, n.title),
           n.content = COALESCE($content, n.content),
           n.tags = COALESCE($tags, n.tags),
           n.updatedAt = datetime()
       RETURN n`,
      { id: req.params.id, title, content, tags }
    );
    
    if (result.records.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    const note = result.records[0].get('n').properties;
    res.json(note);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  } finally {
    await session.close();
  }
});

router.delete('/:id', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (n:Note {id: $id})
       DETACH DELETE n
       RETURN n`,
      { id: req.params.id }
    );
    
    if (result.records.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  } finally {
    await session.close();
  }
});

router.post('/rebuild/connections', async (req, res) => {
  const session = driver.session();
  try {

    await session.run(`MATCH (n:Note)-[r:RELATES_TO]-(m:Note) DELETE r`);

    const allNotesResult = await session.run(`MATCH (n:Note) RETURN n`);
    const allNotes = allNotesResult.records.map(r => r.get('n').properties);
    
    const { findSimilarNotes } = require('../utils/similarity');

    for (let note of allNotes) {
      const similarNotes = findSimilarNotes(note, allNotes, 0.08);
      
      for (let sim of similarNotes) {
        await session.run(
          `MATCH (a:Note), (b:Note)
           WHERE a.id = $id1 AND b.id = $id2
           MERGE (a)-[rel:RELATES_TO {strength: $strength}]-(b)`,
          { id1: note.id, id2: sim.noteId, strength: sim.similarity }
        );
      }
    }
    
    res.json({ message: 'All connections rebuilt successfully', notesProcessed: allNotes.length });
  } catch (error) {
    console.error('Error rebuilding connections:', error);
    res.status(500).json({ error: 'Failed to rebuild connections' });
  } finally {
    await session.close();
  }
});

module.exports = router;
