const express = require('express');
const router = express.Router();
const { weaveIdea, chatWithWeaver } = require('../utils/ideaWeaverService');


router.post('/action', async (req, res) => {
  const { actionType, ideaContent } = req.body;

  if (!actionType || !ideaContent) {
    return res.status(400).json({ 
      error: 'Missing required fields: actionType, ideaContent' 
    });
  }

  try {
    console.log(`Weaving idea with action: ${actionType}`);
    const response = await weaveIdea(actionType, ideaContent, []);

    res.json({
      success: true,
      action: actionType,
      response: response
    });
  } catch (error) {
    console.error('Error in weaver action:', error.message);
    res.status(500).json({
      error: error.message || 'Failed to weave idea'
    });
  }
});


router.post('/chat', async (req, res) => {
  const { userMessage, conversationHistory = [], currentIdea = '' } = req.body;

  if (!userMessage) {
    return res.status(400).json({ 
      error: 'User message is required' 
    });
  }

  try {
    console.log('Starting chat with Weaver...');
    const response = await chatWithWeaver(userMessage, conversationHistory, currentIdea);

    const updatedHistory = [
      ...conversationHistory,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: response }
    ];

    res.json({
      success: true,
      message: response,
      conversationHistory: updatedHistory
    });
  } catch (error) {
    console.error('Error in weaver chat:', error.message);
    res.status(500).json({
      error: error.message || 'Failed to chat with Weaver'
    });
  }
});

module.exports = router;
