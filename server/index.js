import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import flashcardRoutes from './routes/flashcards.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDebug = (message) => {
  try {
    fs.appendFileSync('server-debug.log', `${new Date().toISOString()} ${message}\n`);
  } catch (err) {
    console.error('Failed to write debug log:', err);
  }
};

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/flashcards", flashcardRoutes);

if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "..", "dist");
  app.use(express.static(clientBuildPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const localFallbackResponse = async (message) => {
  const normalized = message.toLowerCase();
  if (normalized.includes('study')) {
    return 'I can help with study planning, session tracking, and note-taking advice. Please ask a study-related question.';
  }
  if (normalized.includes('task')) {
    return 'Try breaking your task into smaller steps and add them through the Add Task page. I can help you prioritize if needed.';
  }
  if (normalized.includes('flashcard')) {
    return 'Use the flashcard generator to create short question-answer pairs for study review.';
  }
  return `Fallback mode active: the AI key is unavailable or invalid. Ask for study tips, task planning, or productivity advice.`;
};

const getAIResponse = async (message) => {
  const logMessage = `getAIResponse received message: ${JSON.stringify(message)}`;
  console.log(logMessage);
  logDebug(logMessage);

  if (!genAI) {
    const fallbackMsg = "Using fallback AI mode because the Gemini API key is unavailable.";
    console.log(fallbackMsg);
    logDebug(fallbackMsg);
    return localFallbackResponse(message);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-mini" });
    const prompt = `You are a helpful study assistant. Answer the user in a concise and friendly way.\nUser: ${message}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    if (!responseText) {
      throw new Error('Empty Gemini response text');
    }

    const successMsg = `Gemini response generated successfully.`;
    console.log(successMsg);
    logDebug(successMsg);
    return responseText;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    logDebug(`Gemini AI Error: ${error?.message || error}`);
    return localFallbackResponse(message);
  }
};

app.post("/api/chat", async (req, res) => {
  console.log("POST /api/chat body:", req.body);
  logDebug(`POST /api/chat body: ${JSON.stringify(req.body)}`);
  const { message } = req.body || {};

  if (!message) {
    console.error("Missing message in request body", req.body);
    logDebug(`Missing message in request body: ${JSON.stringify(req.body)}`);
    return res.status(400).json({ reply: "Bad request: message is required." });
  }

  try {
    const text = await getAIResponse(message);
    console.log("✅ AI chat response delivered");
    logDebug("AI chat response delivered");
    res.json({ reply: text });
  } catch (error) {
    console.error("❌ Chat Error:", error);
    logDebug(`Chat error: ${error?.message || error}`);
    res.status(500).json({ reply: "Connection failed. Please check the terminal." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (!apiKey) {
    console.log('Warning: GEMINI_API_KEY is not set. Chat will run in fallback mode.');
  }
});
