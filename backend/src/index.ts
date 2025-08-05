import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Pinecone } from "@pinecone-database/pinecone";
import { pipeline, env } from "@xenova/transformers";
import { mockProducts } from "./mock-data/products.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/ai-ecommerce"
    );
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Pinecone initialization
let pinecone: Pinecone;
const initPinecone = async () => {
  try {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || "",
    });
    console.log("Pinecone initialized successfully");
  } catch (error) {
    console.error("Pinecone initialization error:", error);
  }
};

// Configure transformers to allow model downloads
env.allowRemoteModels = true;
env.allowLocalModels = true;

// Initialize the embedding pipeline
let embedder: any = null;

// Initialize the sentence transformer model for embeddings
const initializeEmbedder = async () => {
  if (!embedder) {
    console.log(
      "🤖 Loading all-MiniLM-L6-v2 model for API (reliable & tested)..."
    );
    try {
      embedder = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2"
      );
      console.log("✅ API all-MiniLM-L6-v2 model loaded successfully!");
    } catch (error) {
      console.error(
        "❌ Failed to load API MiniLM-L6 transformer model:",
        error
      );
      throw error;
    }
  }
  return embedder;
};

// Generate semantic embeddings using transformers.js
const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const model = await initializeEmbedder();

    // Generate embeddings using the transformer model
    const output = await model(text, { pooling: "mean", normalize: true });

    // Extract the embedding vector
    const embedding = Array.from(output.data);

    // The all-MiniLM-L6-v2 model produces 384-dimensional embeddings
    // Pad to 1024 dimensions for Pinecone index compatibility
    const paddedEmbedding = new Array(1024).fill(0);
    for (let i = 0; i < Math.min(embedding.length, 1024); i++) {
      paddedEmbedding[i] = embedding[i];
    }

    return paddedEmbedding;
  } catch (error) {
    console.error("Error generating MiniLM-L6 API embedding:", error);
    // Fallback to a zero vector if embedding fails
    return new Array(1024).fill(0);
  }
};

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Get all products from Pinecone
app.get("/api/products", async (req, res) => {
  try {
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME || "products");

    // Query all products from Pinecone (using a dummy vector to get all records)
    const queryResults = await index.namespace("products").query({
      topK: 50, // Get up to 50 products
      includeMetadata: true,
      includeValues: false,
      vector: new Array(1024).fill(0), // Dummy vector to retrieve all products
    });

    // Transform Pinecone results to our product format
    const products =
      queryResults.matches?.map((match) => ({
        id: match.id,
        name: match.metadata?.name || "",
        description: match.metadata?.chunk_text || "",
        category: match.metadata?.category || "",
        price: match.metadata?.price || 0,
        imageUrl: match.metadata?.imageUrl || "",
      })) || [];

    res.json(products);
  } catch (error) {
    console.error("Failed to fetch products from Pinecone:", error);
    // Fallback to mock products if Pinecone fails
    res.json(mockProducts);
  }
});

// Google OAuth mock endpoint
app.post("/api/auth/google", (req, res) => {
  // In a real implementation, you would verify the Google token
  // For now, we'll simulate a successful login
  const mockUser = {
    id: "user123",
    name: "Test User",
    email: "test@example.com",
    avatar: "TU",
  };

  res.json({
    user: mockUser,
    token: "mock-jwt-token",
  });
});

// Token verification endpoint
app.get("/api/auth/verify", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  // In a real implementation, you would verify the JWT token
  // For now, we'll simulate a successful verification
  const mockUser = {
    id: "user123",
    name: "Test User",
    email: "test@example.com",
    avatar: "TU",
  };

  res.json({ user: mockUser });
});

// Semantic search endpoint
app.post("/api/search", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query);

    // Use Pinecone for semantic search with vector embedding
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME || "products");

    const searchResults = await index.namespace("products").query({
      topK: 10,
      includeMetadata: true,
      includeValues: false,
      vector: queryEmbedding,
    });

    // Transform Pinecone results to our product format
    const products =
      searchResults.matches?.map((match) => ({
        id: match.id,
        name: match.metadata?.name || "",
        description: match.metadata?.chunk_text || "",
        category: match.metadata?.category || "",
        price: match.metadata?.price || 0,
        imageUrl: match.metadata?.imageUrl || "",
        score: match.score || 0,
      })) || [];

    res.json({ products });
  } catch (error) {
    console.error("Pinecone search error:", error);

    // Fallback to simple text-based search if Pinecone fails
    const { query } = req.body;
    const filteredProducts = mockProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
    );

    res.json({ products: filteredProducts });
  }
});

// Start server
// Only start server if not in Vercel serverless
if (process.env.VERCEL !== "1") {
  (async () => {
    await connectDB();
    await initPinecone();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })();
}

export default app;
