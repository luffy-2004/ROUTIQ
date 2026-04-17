import express from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const localFlashcards = (topic) => {
  const safeTopic = topic || 'study topic';
  return [
    { question: `What is the main idea of ${safeTopic}?`, answer: `The main idea of ${safeTopic} is to understand core concepts and practice regularly.` },
    { question: `How can I study ${safeTopic} effectively?`, answer: `Review your notes, break the material into smaller pieces, and test yourself often.` },
    { question: `Why is ${safeTopic} important?`, answer: `It helps you build knowledge and improve retention for future learning or exams.` },
    { question: `What should I focus on first in ${safeTopic}?`, answer: `Start with the fundamental concepts and work your way toward the more advanced topics.` },
    { question: `How do I remember ${safeTopic} better?`, answer: `Use active recall, spaced repetition, and explain it aloud to yourself.` },
  ];
};

router.post("/generate", async (req, res) => {
  const { topic } = req.body;

  if (!genAI) {
    return res.json(localFlashcards(topic));
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `Create 5 study flashcards about "${topic}". 
    Return ONLY a raw JSON array of objects with "question" and "answer" keys. 
    Example: [{"question": "What is CPU?", "answer": "Central Processing Unit"}]
    Do not include markdown formatting or backticks.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleanJson = text.replace(/```json|```/g, "").trim();
    const flashcards = JSON.parse(cleanJson);

    res.json(flashcards);
  } catch (error) {
    console.error("Flashcard Route Error:", error);
    res.json(localFlashcards(topic));
  }
});

export default router;