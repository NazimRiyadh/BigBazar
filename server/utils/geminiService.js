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
    console.log(`Debug: Model gemini-embedding-001 returned vector of length ${result.embedding.values.length}`);
    return result.embedding.values;
  } catch (error) {
    console.error("Gemini Embedding Error:", error);
    throw new Error("Failed to generate vector embeddings.");
  }
};

/**
 * Reformulates the latest user query into a standalone search query based on chat history.
 */
export const reformulateQuery = async (history, latestMessage) => {
  if (!history || history.length === 0) return latestMessage;

  const systemPrompt = `
    You are an AI assistant tasked with reformulating user queries for an e-commerce search engine.
    Given the chat history and the latest user message, rewrite the latest message into a standalone search query that can be understood without the context.
    If the latest message is already a standalone query, just return it exactly as is.
    DO NOT answer the user's question. ONLY return the reformulated search query.
  `;

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map(msg => ({ role: msg.role, content: msg.content })),
    { role: "user", content: `Latest message: ${latestMessage}\nRewrite it:` }
  ];

  try {
    const response = await axios.post(`${OLLAMA_URL}/api/chat`, {
      model: CHAT_MODEL,
      messages,
      stream: false,
    });
    // Remove quotes if the LLM wrapped the output in quotes
    return response.data.message.content.trim().replace(/^"|"$/g, '');
  } catch (error) {
    console.error("Query Reformulation Error:", error.message);
    return latestMessage; // Fallback to original
  }
};

/**
 * Streams an AI response grounded strictly in the provided context using Server-Sent Events (SSE).
 * Uses local Ollama (Qwen 2.5 7B) for unlimited, quota-free generation.
 */
export const streamGroundedResponse = async (history, query, context, res) => {
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

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []).map(msg => ({ role: msg.role, content: msg.content })),
      { role: "user", content: query },
    ];

    const response = await axios.post(`${OLLAMA_URL}/api/chat`, {
      model: CHAT_MODEL,
      messages,
      stream: true,
    }, {
      responseType: 'stream' // Crucial for receiving chunks in axios
    });

    response.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.message && parsed.message.content) {
            res.write(`data: ${JSON.stringify({ text: parsed.message.content })}\n\n`);
          }
        } catch (e) {
          console.error("Error parsing Ollama chunk:", e.message);
        }
      }
    });

    response.data.on('end', () => {
      res.write('event: end\ndata: {}\n\n');
      res.end();
    });

    response.data.on('error', (err) => {
      console.error("Ollama stream error:", err);
      res.write('event: error\ndata: {"message": "Stream error"}\n\n');
      res.end();
    });

  } catch (error) {
    console.error("Ollama Chat Error:", error.message);
    res.write('event: error\ndata: {"message": "Failed to generate AI response."}\n\n');
    res.end();
  }
};
