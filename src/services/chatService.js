/**
 * Chat/Reflection Service
 *
 * Stores and retrieves simple chat messages between the user and the built-in
 * AI assistant. Each message is saved in Firestore so that the conversation
 * persists across sessions.
 */

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const COLLECTION = 'reflections';

/**
 * Retrieve all messages for a given user, ordered by creation time.
 * @param {string} userId
 * @returns {Promise<Array<{id:string,role:string,text:string,createdAt:any}>>}
 */
export const getMessages = async (userId) => {
  if (!userId) throw new Error('User ID required');
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'asc')
  );
  const snap = await getDocs(q);
  const msgs = [];
  snap.forEach(doc => {
    msgs.push({ id: doc.id, ...doc.data() });
  });
  return msgs;
};

/**
 * Add a new message (user or assistant) to Firestore.
 * @param {string} userId
 * @param {'user'|'assistant'} role
 * @param {string} text
 * @returns {Promise<object>} the saved message
 */
export const addMessage = async (userId, role, text) => {
  if (!userId) throw new Error('User ID required');
  if (!text) throw new Error('Message text required');
  const docRef = await addDoc(collection(db, COLLECTION), {
    userId,
    role,
    text,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, userId, role, text, createdAt: new Date() };
};

/**
 * Simple AI response generator. Not an actual NLP model—just picks a
 * motivational reply based on keywords or randomly.
 * @param {string} userText
 * @returns {string}
 */
export const generateAIReply = (userText) => {
  const txt = (userText || '').trim();
  const lowered = txt.toLowerCase();

  // Detect whether user asked a question (ends with ? or contains interrogative words)
  const interrogatives = /\b(how|what|why|when|where|who|which|explain|suggest|can|should)\b/i;
  const isQuestion = txt.endsWith('?') || interrogatives.test(lowered);

  // Helper to produce a short motivational closer
  const motivate = (suffix = '') => ` ${suffix} ${['Keep going—you got this! 💪','Small steps add up. ✨','Proud of you for sharing. 🙌'][Math.floor(Math.random()*3)]}`;

  if (isQuestion) {
    // Topic-specific quick answers
    if (/study|learn|revision|exam|cram/.test(lowered)) {
      return `Short answer: Use focused study sessions (25-50 min), active recall, and spaced repetition. Try: 1) Pick a specific goal for the session; 2) Use a 25–50 minute timer; 3) Test yourself afterward.` + motivate('You can build momentum with one focused session.');
    }
    if (/time|schedule|available|hours|plan/.test(lowered)) {
      return `Short answer: Prioritise your top 3 tasks and block time for them. Break longer tasks into 25–50 minute blocks with short breaks.` + motivate('Focus beats multitasking.');
    }
    if (/motivat|motivation|feel stuck|stuck/.test(lowered)) {
      return `Short answer: Start tiny—commit to 5 minutes or one small step. Celebrate the start and repeat.` + motivate('Starting is often the hardest part.');
    }

    // Generic structured answer for other questions
    return `Good question. Quick approach:\n1) Define what success looks like.\n2) Break the task into concrete next steps.\n3) Pick one small step and begin now.` + motivate('Asking the question already puts you ahead.');
  }

  // Non-question emotional responses (motivation + small practical tip)
  if (/tired|hard|struggling/.test(lowered)) {
    return `I hear you — it can be tough. Try a short break (5–10 min) and then a focused 25-minute session.` + motivate('Be kind to yourself.');
  }
  if (/stress|anxious|overwhelmed/.test(lowered)) {
    return `Take 3 deep breaths, write down the 3 most important tasks, and choose the tiniest first step.` + motivate('Small actions reduce stress.');
  }
  if (/happy|good|great|awesome/.test(lowered)) {
    return `That's wonderful to hear—celebrate it!` + motivate('Keep the momentum going.');
  }

  // Default motivational replies
  const generic = [
    "Thanks for sharing — that was meaningful. Keep going! 🌟",
    "Every reflection is progress. Small steps matter. 🙌",
    "I believe in your progress — one step at a time! 💫",
  ];
  return generic[Math.floor(Math.random() * generic.length)];
};

/**
 * Get AI reply, preferring external API if configured via environment.
 * Falls back to local heuristics when no key or on error.
 * @param {string} userText
 * @param {string} userId
 */
export const getAIReply = async (userText, userId) => {
  // External API integration removed — stay local.
  return generateAIReply(userText);
};

export default {
  getMessages,
  addMessage,
  generateAIReply,
};
