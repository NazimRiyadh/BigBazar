import { catchAsyncErrors } from "../middlewares/catchAsyncMiddleware.js";
import db from "../database/db.js";
import { getEmbedding, reformulateQuery, streamGroundedResponse } from "../utils/geminiService.js";
import { searchSimilarProducts, upsertProductVector } from "../utils/pineconeService.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";

// Using native pgvector for similarity search

/**
 * Main Chat Endpoint — RAG Pipeline
 * POST /api/chat
 *
 * Flow: Query → Embed → Retrieve → Augment → Generate
 */
export const chat = catchAsyncErrors(async (req, res, next) => {
  const { message, history = [] } = req.body;
  if (!message) return next(new ErrorHandler("Message is required", 400));

  // Set up Server-Sent Events (SSE) headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // Tell client that streaming has started

  try {
    // 1. Query Reformulation (Intent recognition based on history)
    const standaloneQuery = await reformulateQuery(history, message);

    // 2. Generate embedding for the standalone query via Gemini
    const queryEmbedding = await getEmbedding(standaloneQuery);

    // 3. Search Pinecone for similar products
    const ranked = await searchSimilarProducts(queryEmbedding, 5);

    // Send recommendations first as a special event
    const recommendations = ranked.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      similarity: parseFloat(p.score).toFixed(4),
    }));
    res.write(`event: recommendations\ndata: ${JSON.stringify(recommendations)}\n\n`);

    // 5. Augment: Build grounded context from top results
    const context = ranked.length > 0 
      ? ranked.map(p => 
          `- ${p.name}: ${p.description} (Price: $${p.price}, Category: ${p.category})`
        ).join("\n")
      : "No relevant products found in our inventory.";

    // 6. Generate: Stream AI response grounded in context
    await streamGroundedResponse(history, message, context, res);
  } catch (error) {
    console.error("Chat Stream Error:", error);
    res.write(`event: error\ndata: ${JSON.stringify({ message: "Internal Server Error during streaming" })}\n\n`);
    res.end();
  }
});

/**
 * Batch Indexing Endpoint (Admin only)
 * POST /api/batch-index
 * 
 * Generates embeddings for all products that haven't been indexed yet.
 */
export const batchIndex = catchAsyncErrors(async (req, res, next) => {
  // Fetch all products from Postgres
  const { rows: products } = await db.query(
    "SELECT id, name, description, price, category FROM products"
  );

  let successCount = 0;
  for (const product of products) {
    try {
      const text = `${product.name} ${product.description}`;
      const embedding = await getEmbedding(text);
      
      await upsertProductVector(product.id, embedding, {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
      });
      
      successCount++;
    } catch (err) {
      console.error(`Failed to index product ${product.id}:`, err.message);
    }
  }

  res.status(200).json({
    success: true,
    message: `Successfully indexed ${successCount} out of ${products.length} products to Pinecone.`,
  });
});
