import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
import { pipeline, env } from "@xenova/transformers";

// Load environment variables
dotenv.config();

// Configure transformers to allow model downloads
env.allowRemoteModels = true;
env.allowLocalModels = true;

// Initialize the embedding pipeline
let embedder: any = null;

// Initialize the sentence transformer model for embeddings
const initializeEmbedder = async () => {
  if (!embedder) {
    console.log("🤖 Loading all-MiniLM-L6-v2 model (reliable & tested)...");
    try {
      // Use all-MiniLM-L6-v2 model for semantic embeddings (384 dimensions)
      embedder = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2"
      );
      console.log("✅ all-MiniLM-L6-v2 model loaded successfully!");
    } catch (error) {
      console.error("❌ Failed to load MiniLM-L6 transformer model:", error);
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
    // We need to pad or truncate to 1024 dimensions for our Pinecone index
    const paddedEmbedding = new Array(1024).fill(0);
    for (let i = 0; i < Math.min(embedding.length, 1024); i++) {
      paddedEmbedding[i] = embedding[i];
    }

    return paddedEmbedding;
  } catch (error) {
    console.error("Error generating MiniLM-L6 embedding:", error);
    // Fallback to a zero vector if embedding fails
    return new Array(1024).fill(0);
  }
};

// Product data for seeding - updated with working images and accurate products
const products = [
  {
    id: "prod-1",
    chunk_text:
      "Sony WH-1000XM4 Wireless Bluetooth Headphones with industry-leading active noise cancellation, premium sound quality, and 30-hour battery life. Perfect for music lovers, commuters, and professionals who need crystal clear audio.",
    category: "Electronics",
    name: "Sony WH-1000XM4 Headphones",
    price: 299.99,
    imageUrl:
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-2",
    chunk_text:
      "Apple Watch Series 9 with advanced health monitoring, GPS tracking, sleep analysis, and comprehensive workout detection. Ideal for athletes, fitness enthusiasts, and health-conscious individuals.",
    category: "Electronics",
    name: "Apple Watch Series 9",
    price: 399.99,
    imageUrl:
      "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-3",
    chunk_text:
      "Premium Organic Cotton T-Shirt made from 100% GOTS-certified sustainable organic cotton, ultra-soft comfortable fabric, available in multiple colors. Perfect for casual wear and environmentally conscious shoppers.",
    category: "Clothing",
    name: "Organic Cotton Premium Tee",
    price: 34.99,
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-4",
    chunk_text:
      "Hydro Flask Stainless Steel Water Bottle with TempShield double-wall vacuum insulation, keeps drinks cold for 24 hours or hot for 12 hours. BPA-free, leak-proof design perfect for active lifestyles.",
    category: "Lifestyle",
    name: "Hydro Flask Water Bottle",
    price: 44.99,
    imageUrl:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-5",
    chunk_text:
      "Anker PowerWave Wireless Charging Pad with fast 15W charging technology, Qi-compatible with all modern smartphones, LED indicator lights, sleek minimalist design for desk or nightstand.",
    category: "Electronics",
    name: "Anker Wireless Charger",
    price: 29.99,
    imageUrl:
      "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-6",
    chunk_text:
      "Manduka PRO Yoga Mat with premium non-slip surface, extra thick 6mm cushioning for joint protection, eco-friendly natural rubber materials, perfect for yoga, pilates, meditation, and home workouts.",
    category: "Fitness",
    name: "Manduka PRO Yoga Mat",
    price: 89.99,
    imageUrl:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-7",
    chunk_text:
      "JBL Flip 6 Portable Bluetooth Speaker with powerful 360-degree sound, IP67 waterproof design, 12-hour battery life, perfect for outdoor adventures, beach trips, and pool parties.",
    category: "Electronics",
    name: "JBL Flip 6 Bluetooth Speaker",
    price: 129.99,
    imageUrl:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-8",
    chunk_text:
      "Ninja Programmable Coffee Maker with built-in timer, thermal carafe, auto-shutoff, and customizable brew strength control. Perfect for coffee enthusiasts who want barista-quality coffee at home.",
    category: "Kitchen",
    name: "Ninja Coffee Maker",
    price: 149.99,
    imageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-9",
    chunk_text:
      "BenQ ScreenBar LED Monitor Light with adjustable brightness, multiple color temperatures, USB-C charging, touch controls, and asymmetric design for optimal screen lighting while working or studying.",
    category: "Home Office",
    name: "BenQ ScreenBar Monitor Light",
    price: 109.99,
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-10",
    chunk_text:
      "Nike Air Zoom Pegasus 40 Running Shoes with advanced React foam cushioning, breathable Flyknit upper, lightweight design, and superior grip for all terrains. Ideal for runners and active individuals.",
    category: "Footwear",
    name: "Nike Air Zoom Pegasus 40",
    price: 139.99,
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-11",
    chunk_text:
      "Rain Design mStand Laptop Stand with ergonomic design, adjustable height and angle, premium aluminum construction, excellent heat dissipation, compatible with all laptop sizes for better posture and productivity.",
    category: "Home Office",
    name: "Rain Design mStand",
    price: 59.99,
    imageUrl:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-12",
    chunk_text:
      "The Ordinary Complete Skincare Set with vitamin C serum, hyaluronic acid moisturizer, gentle niacinamide cleanser, and broad-spectrum SPF sunscreen. Complete routine for healthy, glowing skin and anti-aging benefits.",
    category: "Beauty",
    name: "The Ordinary Skincare Set",
    price: 89.99,
    imageUrl:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-13",
    chunk_text:
      "Samsung Galaxy Buds Pro 2 True Wireless Earbuds with active noise cancellation, 360 Audio, IPX7 water resistance, and 8-hour battery life. Perfect for music, calls, and workouts with premium sound quality.",
    category: "Electronics",
    name: "Samsung Galaxy Buds Pro 2",
    price: 199.99,
    imageUrl:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-14",
    chunk_text:
      "Levi's 501 Original Fit Jeans made from premium denim with classic straight leg cut, button fly, and timeless styling. Available in multiple washes and sizes for the perfect casual look.",
    category: "Clothing",
    name: "Levi's 501 Original Jeans",
    price: 89.99,
    imageUrl:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-15",
    chunk_text:
      "Instant Pot Duo 7-in-1 Electric Pressure Cooker with slow cooker, rice cooker, steamer, sauté, yogurt maker, and warmer functions. 6-quart capacity perfect for families and meal prep.",
    category: "Kitchen",
    name: "Instant Pot Duo 7-in-1",
    price: 79.99,
    imageUrl:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-16",
    chunk_text:
      "Adidas Ultraboost 22 Running Shoes with responsive Boost midsole, Primeknit upper, Continental rubber outsole, and energy-returning technology for maximum comfort and performance.",
    category: "Footwear",
    name: "Adidas Ultraboost 22",
    price: 179.99,
    imageUrl:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-17",
    chunk_text:
      "Kindle Paperwhite E-reader with 6.8-inch glare-free display, waterproof design, adjustable warm light, and weeks of battery life. Perfect for reading anywhere with access to millions of books.",
    category: "Electronics",
    name: "Kindle Paperwhite",
    price: 139.99,
    imageUrl:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-18",
    chunk_text:
      "Patagonia Better Sweater Fleece Jacket made from recycled polyester with full-zip design, stand-up collar, and zippered handwarmer pockets. Perfect for outdoor adventures and casual wear.",
    category: "Clothing",
    name: "Patagonia Better Sweater",
    price: 119.99,
    imageUrl:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-19",
    chunk_text:
      "Vitamix A3500 Ascent Series Blender with variable speed control, pulse feature, self-cleaning program, and wireless connectivity. Professional-grade blending for smoothies, soups, and more.",
    category: "Kitchen",
    name: "Vitamix A3500 Blender",
    price: 449.99,
    imageUrl:
      "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-20",
    chunk_text:
      "Herman Miller Aeron Chair with ergonomic design, breathable mesh material, adjustable lumbar support, and tilt mechanism. The gold standard for office seating and productivity.",
    category: "Home Office",
    name: "Herman Miller Aeron Chair",
    price: 1395.00,
    imageUrl:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-21",
    chunk_text:
      "Allbirds Tree Runners Sneakers made from eucalyptus tree fiber with merino wool lining, sugarcane-based sole, and machine-washable design. Sustainable and comfortable everyday shoes.",
    category: "Footwear",
    name: "Allbirds Tree Runners",
    price: 98.00,
    imageUrl:
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-22",
    chunk_text:
      "Dyson V15 Detect Cordless Vacuum with laser dust detection, powerful suction, up to 60 minutes runtime, and advanced filtration system. Perfect for deep cleaning carpets and hard floors.",
    category: "Home & Garden",
    name: "Dyson V15 Detect Vacuum",
    price: 749.99,
    imageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-23",
    chunk_text:
      "AirPods Pro 2nd Generation with Active Noise Cancellation, Transparency mode, Spatial Audio, and MagSafe charging case. Up to 6 hours of listening time with ANC on, perfect for music and calls.",
    category: "Electronics",
    name: "AirPods Pro 2nd Gen",
    price: 249.00,
    imageUrl:
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-24",
    chunk_text:
      "GoPro HERO12 Black Action Camera with 5.3K video recording, HyperSmooth stabilization, waterproof design, and voice control. Perfect for adventure sports, travel, and content creation.",
    category: "Electronics",
    name: "GoPro HERO12 Black",
    price: 399.99,
    imageUrl:
      "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-25",
    chunk_text:
      "MacBook Pro 14-inch with M3 Pro chip, 18GB unified memory, 512GB SSD storage, Liquid Retina XDR display, and up to 18 hours battery life. Perfect for developers, designers, and creative professionals.",
    category: "Electronics",
    name: "MacBook Pro 14-inch M3",
    price: 1999.00,
    imageUrl:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-26",
    chunk_text:
      "iPad Pro 12.9-inch with M2 chip, 128GB storage, Wi-Fi 6E, USB-C with Thunderbolt, and Apple Pencil support. Ideal for digital art, note-taking, and productivity on the go.",
    category: "Electronics",
    name: "iPad Pro 12.9-inch M2",
    price: 1099.00,
    imageUrl:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-27",
    chunk_text:
      "Logitech MX Master 3S Wireless Mouse with ultra-precise 8K DPI sensor, quiet clicks, USB-C fast charging, and multi-device connectivity. Perfect for productivity and creative work.",
    category: "Electronics",
    name: "Logitech MX Master 3S",
    price: 99.99,
    imageUrl:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-28",
    chunk_text:
      "Mechanical Gaming Keyboard with Cherry MX switches, RGB backlighting, programmable keys, and aluminum frame construction. Perfect for gaming, coding, and typing enthusiasts.",
    category: "Electronics",
    name: "Mechanical Gaming Keyboard",
    price: 149.99,
    imageUrl:
      "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-29",
    chunk_text:
      "Dell UltraSharp 27-inch 4K Monitor with USB-C hub, 99% sRGB color accuracy, height-adjustable stand, and daisy-chain connectivity. Ideal for designers and developers.",
    category: "Electronics",
    name: "Dell UltraSharp 27-inch 4K",
    price: 599.99,
    imageUrl:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-30",
    chunk_text:
      "Nintendo Switch OLED Console with 7-inch OLED screen, enhanced audio, 64GB internal storage, and Joy-Con controllers. Perfect for gaming at home or on the go with exclusive Nintendo titles.",
    category: "Electronics",
    name: "Nintendo Switch OLED",
    price: 349.99,
    imageUrl:
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-31",
    chunk_text:
      "Webcam 4K Ultra HD with auto-focus, built-in microphone, 90-degree field of view, and USB plug-and-play connectivity. Perfect for video calls, streaming, and content creation.",
    category: "Electronics",
    name: "4K Ultra HD Webcam",
    price: 89.99,
    imageUrl:
      "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-32",
    chunk_text:
      "Meta Quest 3 VR Headset with mixed reality capabilities, 4K+ display, hand tracking, and wireless PC connectivity. Perfect for gaming, virtual meetings, and immersive experiences.",
    category: "Electronics",
    name: "Meta Quest 3 VR Headset",
    price: 499.99,
    imageUrl:
      "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-33",
    chunk_text:
      "Arduino Uno R3 Microcontroller Board with USB cable, 14 digital pins, 6 analog inputs, and extensive community support. Perfect for electronics prototyping and STEM education.",
    category: "Electronics",
    name: "Arduino Uno R3",
    price: 27.60,
    imageUrl:
      "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-34",
    chunk_text:
      "SanDisk Extreme Pro 1TB Portable SSD with up to 2000MB/s read speeds, USB-C connectivity, IP55 water and dust resistance. Perfect for photographers, videographers, and content creators.",
    category: "Electronics",
    name: "SanDisk Extreme Pro 1TB SSD",
    price: 179.99,
    imageUrl:
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop&auto=format",
  },
  {
    id: "prod-35",
    chunk_text:
      "Blue Yeti USB Microphone with broadcast-quality sound, four pickup patterns, real-time headphone monitoring, and plug-and-play setup. Perfect for podcasting, streaming, and voice recording.",
    category: "Electronics",
    name: "Blue Yeti USB Microphone",
    price: 99.99,
    imageUrl:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=400&fit=crop&auto=format",
  },
];

const seedPineconeData = async () => {
  try {
    console.log("🌱 Starting Pinecone data seeding...");

    // Initialize Pinecone
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || "",
    });

    // Get the index
    const indexName = process.env.PINECONE_INDEX_NAME || "products";
    const index = pinecone.index(indexName);

    console.log(`📍 Connected to Pinecone index: ${indexName}`);

    // Check if index exists and get stats
    try {
      const stats = await index.describeIndexStats();
      console.log(`📊 Current index stats:`, stats);
      
      // Clear existing data in the products namespace
      if (stats.namespaces?.products?.recordCount && stats.namespaces.products.recordCount > 0) {
        console.log('🗑️ Clearing existing products from namespace...');
        await index.namespace('products').deleteAll();
        console.log('✅ Namespace cleared successfully!');
        
        // Wait a moment for the deletion to propagate
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.log("⚠️ Could not get index stats, proceeding with seeding...");
    }

    // Generate embeddings and upsert products to Pinecone
    console.log("🧠 Generating embeddings for products...");

    const productsWithEmbeddings = await Promise.all(
      products.map(async (product) => {
        const text = `${product.name} ${product.chunk_text} ${product.category}`;
        const embedding = await generateEmbedding(text);
        return {
          id: product.id,
          values: embedding,
          metadata: {
            name: product.name || "",
            chunk_text: product.chunk_text || "",
            category: product.category || "",
            price: product.price || 0,
            imageUrl: product.imageUrl || "",
          },
        };
      })
    );

    console.log("📤 Upserting products with embeddings to Pinecone...");
    const upsertResponse = await index
      .namespace("products")
      .upsert(productsWithEmbeddings);

    console.log("✅ Upsert response:", upsertResponse);

    // Wait a moment for the data to be indexed
    console.log("⏳ Waiting for indexing to complete...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Verify the data was uploaded
    const stats = await index.describeIndexStats();
    console.log("📊 Updated index stats:", stats);

    // Test a sample search with generated embedding
    console.log("🔍 Testing semantic search...");
    const queryText = "wireless headphones for music";
    const queryEmbedding = await generateEmbedding(queryText);

    const searchResults = await index.namespace("products").query({
      topK: 3,
      includeMetadata: true,
      includeValues: false,
      vector: queryEmbedding,
    });

    console.log("🎯 Sample search results:");
    searchResults.matches?.forEach((match, i) => {
      console.log(`${i + 1}. ${match.id} (score: ${match.score?.toFixed(3)})`);
      console.log(`   Name: ${match.metadata?.name}`);
      console.log(
        `   Text: ${String(match.metadata?.chunk_text || "").substring(
          0,
          100
        )}...`
      );
      console.log("");
    });

    console.log("🎉 Pinecone seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding Pinecone data:", error);
    process.exit(1);
  }
};

// Run the seeding function
seedPineconeData();
