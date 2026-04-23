import { catchAsyncErrors } from "../middlewares/catchAsyncMiddleware.js";
import db from "../database/db.js";
import { getEmbedding, getGroundedResponse } from "../utils/geminiService.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";

/**
 * Cosine similarity between two vectors.
 * Returns a value between -1 and 1 (1 = identical).
 */
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Main Chat Endpoint — RAG Pipeline
 * POST /api/chat
 *
 * Flow: Query → Embed → Retrieve → Augment → Generate
 */
export const chat = catchAsyncErrors(async (req, res, next) => {
  const { message } = req.body;
  if (!message) return next(new ErrorHandler("Message is required", 400));

  // 1. Generate query embedding via Gemini
  const queryEmbedding = await getEmbedding(message);

  // 2. Retrieve all products with embeddings
  const { rows: allProducts } = await db.query(
    `SELECT id, name, description, price, category, stock, embedding
     FROM products 
     WHERE embedding IS NOT NULL AND stock > 0`
  );

  // 3. Rank by cosine similarity (app-layer vector search)
  const ranked = allProducts
    .map(p => ({
      ...p,
      similarity: cosineSimilarity(queryEmbedding, p.embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5); // Top 5

  // 4. Augment: Build grounded context from top results
  const context = ranked.length > 0 
    ? ranked.map(p => 
        `- ${p.name}: ${p.description} (Price: $${p.price}, Category: ${p.category})`
      ).join("\n")
    : "No relevant products found in our inventory.";

  // 5. Generate: AI response grounded in context
  const aiResponse = await getGroundedResponse(message, context);

  res.status(200).json({
    success: true,
    response: aiResponse,
    recommendations: ranked.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      similarity: parseFloat(p.similarity).toFixed(4),
    })),
  });
});

/**
 * Batch Indexing Endpoint (Admin only)
 * POST /api/batch-index
 * 
 * Generates embeddings for all products that haven't been indexed yet.
 */
export const batchIndex = catchAsyncErrors(async (req, res, next) => {
  const { rows: products } = await db.query(
    "SELECT id, name, description FROM products WHERE embedding IS NULL"
  );

  let successCount = 0;
  for (const product of products) {
    try {
      const text = `${product.name} ${product.description}`;
      const embedding = await getEmbedding(text);
      
      await db.query("UPDATE products SET embedding = $1 WHERE id = $2", [
        JSON.stringify(embedding),
        product.id,
      ]);
      successCount++;
    } catch (err) {
      console.error(`Failed to index product ${product.id}:`, err.message);
    }
  }

  res.status(200).json({
    success: true,
    message: `Successfully indexed ${successCount} out of ${products.length} products.`,
  });
});
