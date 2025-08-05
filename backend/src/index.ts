import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// import mongoose from "mongoose";
import { Pinecone } from "@pinecone-database/pinecone";
import { generateEmbedding } from "./mock-data/embeddings.js";
import { mockProducts } from "./mock-data/backup_products.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// // MongoDB connection
// const connectDB = async () => {
//   try {
//     await mongoose.connect(
//       process.env.MONGODB_URI || "mongodb://localhost:27017/ai-ecommerce"
//     );
//     console.log("MongoDB connected successfully");
//   } catch (error) {
//     console.error("MongoDB connection error:", error);
//     process.exit(1);
//   }
// };

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || "",
});

const index = pinecone.index(process.env.PINECONE_INDEX_NAME || "products");

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
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}`);
  console.log(`🔍 Search endpoint: http://localhost:${PORT}/api/search`);
  console.log(`📦 Products endpoint: http://localhost:${PORT}/api/products`);
});

export default app;
