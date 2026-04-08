const { GoogleGenerativeAI } = require('@google/generative-ai');

let geminiClient;
let model;

if (process.env.GEMINI_API_KEY) {
  geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = geminiClient.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

const SYSTEM_PROMPT = `You are a no-nonsense idea coach inside a note-taking app. The user has just written a rough idea from their notes.

Your job:
- Be honest. If something like this already exists, say so clearly.
- Then focus on: what's the realistic unique angle for THIS person given their context?
- Keep responses short, plain, and conversational. No buzzwords, no corporate language, no lists of 7 things. Write like a smart friend giving advice.
- Never pad responses with filler phrases like "Great idea!" or "Absolutely!" Just get to the point.

Actions:

EXPLAIN: In 2-3 plain sentences, what does this idea actually do and who would use it?

BUILD: What's the simplest version of this that someone could actually ship? Give 3 concrete steps — no jargon.

RISKS: Be honest — what are the 2 real reasons this might not work? Be specific, not generic.

DIFFERENTIATE: Name 2-3 apps or products that already do something similar. Then say exactly what angle could make this person's version different — based on their specific context, not generic advice.

REFINE: Rewrite the idea as one clear sentence that explains what it does and who it's for. No buzzwords.`;

/**
 * Process user message with Idea Weaver AI
 * @param {string} actionType - Type of action (EXPLAIN, BUILD, RISKS, SIMILAR, REFINE)
 * @param {string} ideaContent - The idea or note content
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<string>} AI response
 */
const weaveIdea = async (actionType, ideaContent, conversationHistory = []) => {
  if (!model) {
    throw new Error('Gemini API not configured. Please set GEMINI_API_KEY.');
  }

  const validActions = ['EXPLAIN', 'BUILD', 'RISKS', 'DIFFERENTIATE', 'REFINE'];
  if (!validActions.includes(actionType)) {
    throw new Error(`Invalid action type. Must be one of: ${validActions.join(', ')}`);
  }

  try {
    // Create a simple prompt without chat history for action-based requests
    const prompt = `${SYSTEM_PROMPT}\n\nAction: ${actionType}\n\nIdea/Note: ${ideaContent}`;
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return responseText;
  } catch (error) {
    console.error('Error in Idea Weaver:', error);
    throw error;
  }
};

/**
 * Chat with Idea Weaver - multi-turn conversation
 * @param {string} userMessage - User's message
 * @param {Array} conversationHistory - Array of previous messages
 * @param {string} currentIdea - Current idea being discussed (for context)
 * @returns {Promise<string>} AI response
 */
const chatWithWeaver = async (userMessage, conversationHistory = [], currentIdea = '') => {
  if (!model) {
    throw new Error('Gemini API not configured.');
  }

  try {
    const context = currentIdea ? `\n\nCurrent Idea Context: ${currentIdea}` : '';
    
    // Build the full prompt including conversation history
    let fullPrompt = `${SYSTEM_PROMPT}${context}\n\nYou are having a creative conversation helping the user develop, refine, and validate their ideas.\n\n`;
    
    // Add conversation history
    conversationHistory.forEach(msg => {
      if (msg.role === 'user') {
        fullPrompt += `User: ${msg.content}\n\n`;
      } else {
        fullPrompt += `Assistant: ${msg.content}\n\n`;
      }
    });
    
    // Add current user message
    fullPrompt += `User: ${userMessage}\n\nAssistant:`;
    
    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();

    return responseText;
  } catch (error) {
    console.error('Error chatting with Weaver:', error);
    throw error;
  }
};

module.exports = {
  weaveIdea,
  chatWithWeaver,
  SYSTEM_PROMPT
};
