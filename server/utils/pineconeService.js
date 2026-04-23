import { Pinecone } from "@pinecone-database/pinecone";

let pineconeClient = null;

export const getPineconeClient = () => {
  if (!pineconeClient) {
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey || apiKey === "YOUR_PINECONE_API_KEY_HERE") {
      console.warn("PINECONE_API_KEY is not configured properly in config.env.");
      return null;
    }
    pineconeClient = new Pinecone({ apiKey });
  }
  return pineconeClient;
};

export const getIndex = () => {
  const pc = getPineconeClient();
  if (!pc) return null;
  const indexName = process.env.PINECONE_INDEX_NAME || "bigbazar";
  return pc.index(indexName);
};

/**
 * Upserts a single product vector with its metadata into Pinecone.
 */
export const upsertProductVector = async (id, vector, metadata) => {
  try {
    const index = getIndex();
    if (!index) return false;

    // Convert string fields to standard format for metadata filtering if necessary
    const formattedMetadata = {
      name: metadata.name || "",
      description: metadata.description || "",
      price: parseFloat(metadata.price) || 0,
      category: metadata.category || "",
    };

    await index.upsert({
      records: [
        {
          id: String(id),
          values: Array.from(vector),
          metadata: formattedMetadata,
        },
      ],
    });
    return true;
  } catch (error) {
    console.error("Pinecone Upsert Error:", error.message);
    return false;
  }
};

/**
 * Queries Pinecone for similar products based on the query vector.
 */
export const searchSimilarProducts = async (queryVector, topK = 5) => {
  try {
    const index = getIndex();
    if (!index) return [];

    const results = await index.query({
      vector: queryVector,
      topK: topK,
      includeMetadata: true,
    });

    if (!results.matches) return [];

    return results.matches.map(match => ({
      id: match.id,
      score: match.score,
      name: match.metadata.name,
      description: match.metadata.description,
      price: match.metadata.price,
      category: match.metadata.category,
    }));
  } catch (error) {
    console.error("Pinecone Search Error:", error.message);
    return [];
  }
};
