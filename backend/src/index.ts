import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Pinecone } from '@pinecone-database/pinecone';

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
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-ecommerce');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Pinecone initialization
let pinecone: Pinecone;
const initPinecone = async () => {
  try {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || '',
    });
    console.log('Pinecone initialized successfully');
  } catch (error) {
    console.error('Pinecone initialization error:', error);
  }
};

// Product interface
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
}

// Mock products data (in a real app, this would come from MongoDB)
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 99.99,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracker with heart rate monitoring',
    price: 199.99,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop'
  },
  {
    id: '3',
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable organic cotton t-shirt in various colors',
    price: 29.99,
    category: 'Clothing',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop'
  },
  {
    id: '4',
    name: 'Stainless Steel Water Bottle',
    description: 'Insulated water bottle that keeps drinks cold for 24 hours',
    price: 24.99,
    category: 'Lifestyle',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&h=300&fit=crop'
  },
  {
    id: '5',
    name: 'Wireless Phone Charger',
    description: 'Fast wireless charging pad compatible with all Qi devices',
    price: 39.99,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1609592806596-4d8b6b0e1b8b?w=300&h=300&fit=crop'
  }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Get all products
app.get('/api/products', (req, res) => {
  res.json(mockProducts);
});

// Semantic search endpoint
app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // For now, implement simple text-based search
    // In a real implementation, you would:
    // 1. Convert query to embedding using OpenAI or similar
    // 2. Search Pinecone for similar product embeddings
    // 3. Return matching products
    
    const filteredProducts = mockProducts.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
    );

    res.json({
      query,
      results: filteredProducts,
      count: filteredProducts.length
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google OAuth endpoints (simplified for now)
app.post('/api/auth/google', (req, res) => {
  // In a real implementation, you would:
  // 1. Verify Google OAuth token
  // 2. Create or find user in database
  // 3. Return JWT token
  
  const { token } = req.body;
  
  // Mock response for now
  res.json({
    success: true,
    user: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'J'
    },
    token: 'mock-jwt-token'
  });
});

// Verify token endpoint
app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Mock verification for now
  res.json({
    valid: true,
    user: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'J'
    }
  });
});

// Start server
const startServer = async () => {
  await connectDB();
  await initPinecone();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch(console.error);
