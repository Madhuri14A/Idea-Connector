const { GoogleGenerativeAI } = require('@google/generative-ai');

let geminiClient;
let model;

if (process.env.GEMINI_API_KEY) {
  geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = geminiClient.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

const SYSTEM_PROMPT = `You are the 'Idea Weaver' AI for a creativity app. You will receive a user's random note and an 'Action Type'. Respond in a clear, professional, yet encouraging tone.

Actions:

EXPLAIN: Break down the concept into 3 simple pillars. Use analogies.

BUILD: Provide a high-level 3-step technical roadmap (Frontend, Backend, Data).

RISKS: Identify 2 market risks and 1 technical challenge.

SIMILAR: Suggest 2 existing companies or open-source projects that share this DNA.

REFINE: Take the raw note and rewrite it as a 2-sentence 'Elevator Pitch'.

Format: Always start with a bold heading of the action (e.g., Building Strategy).`;

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

  const validActions = ['EXPLAIN', 'BUILD', 'RISKS', 'SIMILAR', 'REFINE'];
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
