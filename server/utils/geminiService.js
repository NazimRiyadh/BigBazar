import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

let genAI;
const getGenAI = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables.");
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

const OLLAMA_URL = "http://localhost:11434";
const CHAT_MODEL = "qwen2.5:7b";

/**
 * Generates vector embeddings using Gemini gemini-embedding-001.
 * Returns an array of floating point numbers.
 */
export const getEmbedding = async (text) => {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: "gemini-embedding-001" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Gemini Embedding Error:", error);
    throw new Error("Failed to generate vector embeddings.");
  }
};

/**
 * Generates an AI response grounded strictly in the provided context.
 * Uses local Ollama (Qwen 2.5 7B) for unlimited, quota-free generation.
 */
export const getGroundedResponse = async (query, context) => {
  try {
    const systemPrompt = `
      ROLE: You are the BigBazar AI Shopping Assistant.
      STRICT RULES:
      1. Answer ONLY using the provided Product Context below.
      2. If the answer is not in the context, say: "I'm sorry, I couldn't find specific products matching that in our current inventory."
      3. Never mention competitors or prices not listed in the context.
      4. If multiple products fit, summarize their differences (e.g., price vs features).
      5. Always maintain a professional, helpful tone.
      
      PRODUCT CONTEXT:
      ${context}
    `;

    const response = await axios.post(`${OLLAMA_URL}/api/chat`, {
      model: CHAT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
      stream: false,
    });

    return response.data.message.content;
  } catch (error) {
    console.error("Ollama Chat Error:", error.message);
    throw new Error("Failed to generate AI response.");
  }
};
