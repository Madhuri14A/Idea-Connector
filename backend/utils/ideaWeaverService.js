const { GoogleGenerativeAI } = require('@google/generative-ai');

let geminiClient;
let model;

if (process.env.GEMINI_API_KEY) {
  geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = geminiClient.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

const ACTION_PROMPT = `You are a no-nonsense idea coach inside a note-taking app. The user has just written a rough idea from their notes.

Your job:
- Be honest. If something like this already exists, say so clearly.
- Then focus on: what's the realistic unique angle for THIS person given their context?
- Keep responses short, plain, and conversational. No buzzwords, no corporate language, no lists of 7 things. Write like a smart friend giving advice.
- Never pad responses with filler phrases like "Great idea!" or "Absolutely!" Just get to the point.
- Do not use markdown, asterisks, bold text, or decorative formatting. Plain text only.
- Do not add headings unless the user explicitly asks for a structured answer.

Actions:

EXPLAIN: In 2-3 plain sentences, what does this idea actually do and who would use it?

BUILD: What's the simplest version of this that someone could actually ship? Give 3 concrete steps — no jargon.

RISKS: Be honest — what are the 2 real reasons this might not work? Be specific, not generic.

DIFFERENTIATE: Name 2-3 apps or products that already do something similar. Then say exactly what angle could make this person's version different — based on their specific context, not generic advice.

REFINE: Rewrite the idea as one clear sentence that explains what it does and who it's for. No buzzwords.`;

const CHAT_PROMPT = `You are a no-nonsense idea coach inside a note-taking app.

Rules for chat:
- Reply like a normal person, not like a feature menu.
- Keep replies short by default: usually 1-3 sentences.
- If the user sends a greeting like "hi", "hello", or "hey", respond in one short friendly sentence only.
- Do not mention EXPLAIN, BUILD, RISKS, DIFFERENTIATE, or REFINE unless the user explicitly asks for them.
- No headings, no bullet lists, no long intros unless the user asks for detail.
- If the user asks a bigger question, still stay concise and practical.
- Always aim to be helpful, honest, and direct. No fluff or corporate speak. Just real advice.
- Do not waste tokens, answer straightly with limited important and necessary information.
- Do not use markdown, asterisks, bold text, or decorative formatting. Plain text only.`;

const isQuotaOrTemporaryError = (error) => {
  const msg = String(error?.message || '').toLowerCase();
  const status = Number(error?.status || error?.response?.status || 0);
  return (
    status === 429 ||
    status === 503 ||
    msg.includes('quota') ||
    msg.includes('too many requests') ||
    msg.includes('rate limit') ||
    msg.includes('service unavailable')
  );
};

const localFallbackReply = (userMessage = '', currentIdea = '') => {
  const msg = String(userMessage).trim().toLowerCase();
  const isGreeting = /^(hi|hey|hello|hii|heyy)\b/.test(msg);

  if (isGreeting) {
    return 'Hey. AI is temporarily unavailable due to quota. You can still use Suggestions and try chat again later.';
  }

  if (!currentIdea) {
    return 'AI is temporarily unavailable due to quota. Try again later, or use Suggestions for now.';
  }

  return 'AI is temporarily unavailable due to quota. For now, focus on one small next step for this idea: define your main user and the first feature they need most.';
};

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
    const prompt = `${ACTION_PROMPT}\n\nAction: ${actionType}\n\nIdea/Note: ${ideaContent}`;
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return responseText;
  } catch (error) {
    console.error('Error in Idea Weaver:', error);
    if (isQuotaOrTemporaryError(error)) {
      return 'AI shortcut is temporarily unavailable due to quota. Please try again later.';
    }
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
    let fullPrompt = `${CHAT_PROMPT}${context}\n\nYou are having a short conversation helping the user develop, refine, and validate their ideas.\n\n`;
    
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
    if (isQuotaOrTemporaryError(error)) {
      return localFallbackReply(userMessage, currentIdea);
    }
    throw error;
  }
};

module.exports = {
  weaveIdea,
  chatWithWeaver,
  ACTION_PROMPT,
  CHAT_PROMPT
};
