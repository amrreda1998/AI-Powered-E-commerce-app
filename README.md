# AI-Powered E-Commerce App

A modern, full-stack e-commerce web application leveraging AI-powered semantic search for an enhanced shopping experience.

---

## 🚀 Overview
This project is a production-ready e-commerce platform built with Node.js, TypeScript, React, and TailwindCSS. It features advanced AI-driven semantic search using Pinecone and transformer-based embeddings, a beautiful and responsive UI, and a modular, scalable architecture.

---

## 🌟 Current Features

### Frontend
- **Modern UI/UX**: Responsive, visually appealing design with gradients, glassmorphism, and smooth animations (TailwindCSS)
- **Authentication**: Mock Google OAuth login flow (real OAuth planned)
- **Products Page**: Grid layout, semantic search bar, product cards with images, price, category, and details
- **Semantic Search**: Search for products using natural language queries (e.g., "wireless headphones for music")
- **Loading & Empty States**: Polished loading indicators and empty state screens
- **User Profile**: Avatar and welcome message in navigation

### Backend
- **Node.js + Express API**: RESTful endpoints for authentication, product fetch, and semantic search
- **Semantic Search Engine**: Pinecone vector database with transformer-based embeddings (all-MiniLM-L6-v2, padded to 1024 dims)
- **Product Catalog**: 35+ tech-focused products with verified Unsplash images and metadata
- **Mock Authentication**: Simulated Google OAuth and JWT verification endpoints
- **Stable Embedding Model**: Uses @xenova/transformers for reliable, offline embedding generation
- **CORS**: Configured for frontend-backend communication

### DevOps & Security
- **.env Support**: All secrets and API keys stored in environment variables
- **.gitignore**: Sensitive files and node_modules excluded
- **Vite**: Fast React development and build

---

## 🛣️ Roadmap / Future Features
- **Real Google OAuth**: Secure, production-ready authentication
- **Protected Routes**: Restrict access to products and checkout for logged-in users only
- **Shopping Cart**: Add to cart, view cart, and checkout flow
- **Product Detail Pages**: Dedicated pages for each product with reviews and recommendations
- **Filters & Sorting**: Faceted search, price/category filters, and sorting options
- **User Profiles**: Order history, saved items, and profile management
- **Order Management**: Place, view, and track orders
- **Admin Dashboard**: Product management, analytics, and moderation
- **Unit & Integration Tests**: Robust test coverage for frontend and backend
- **Performance Optimizations**: Embedding model caching, API rate limiting, and lazy loading
- **Accessibility Improvements**: WCAG-compliant design and keyboard navigation
- **Mobile App**: React Native or PWA version

---

## 🛠️ Tech Stack
- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: Pinecone (semantic search), MongoDB (users/products, planned)
- **AI/ML**: @xenova/transformers (all-MiniLM-L6-v2)
- **Authentication**: Mock Google OAuth (real OAuth planned)

---

## 📝 Getting Started

1. **Clone the repo**
2. **Install dependencies** (run in both `backend` and `frontend` folders):
   ```bash
   npm install
   ```
3. **Set up environment variables** in `.env` files (see `.env.example`)
4. **Seed the database** with products:
   ```bash
   cd backend
   npm run seed
   ```
5. **Start the backend**:
   ```bash
   npm run dev
   ```
6. **Start the frontend**:
   ```bash
   cd ../frontend
   npm run dev
   ```
7. **Visit** [http://localhost:5176](http://localhost:5176)

---

## 🤝 Contributing
Pull requests are welcome! Please open issues for feature requests or bug reports.

---

## 📄 License
MIT

---

## 👀 Screenshots
*Add screenshots of the UI here for a visual overview!*

---

## 📅 Last Updated
August 5, 2025
