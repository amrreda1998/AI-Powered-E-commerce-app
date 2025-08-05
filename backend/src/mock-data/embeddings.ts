import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Generate embeddings using Hugging Face Inference API
export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    // Generate embedding for text  
    const response = await fetch(
      "https://api-inference.huggingface.co/models/BAAI/bge-base-en-v1.5",
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: text,
          options: {
            wait_for_model: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HF API Error (${response.status}):`, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    
    // The API returns the embedding directly as an array
    let embedding;
    if (Array.isArray(result)) {
      // If result is directly an array of numbers
      embedding = result;
    } else if (result && Array.isArray(result[0])) {
      // If result is an array containing the embedding array
      embedding = result[0];
    } else if (result && result.embeddings) {
      // If result has an embeddings property
      embedding = result.embeddings;
    } else {
      console.error("❌ Unexpected response format:", result);
      throw new Error("Invalid embedding response format");
    }
    
    if (!embedding || !Array.isArray(embedding)) {
      console.error("❌ Invalid embedding:", embedding);
      throw new Error("Invalid embedding response format");
    }

    // The BAAI/bge-base-en-v1.5 model produces 768-dimensional embeddings
    // Pad to 1024 dimensions for Pinecone index compatibility
    const paddedEmbedding = new Array(1024).fill(0);
    for (let i = 0; i < Math.min(embedding.length, 1024); i++) {
      paddedEmbedding[i] = embedding[i];
    }

    return paddedEmbedding;
  } catch (error) {
    console.error("❌ Error generating Hugging Face embedding:", error);
    // Fallback to a zero vector if embedding fails
    return new Array(1024).fill(0);
  }
};

// Test function to verify the embedding generation works
export const testEmbedding = async () => {
  try {
    console.log("🧪 Testing Hugging Face embedding generation...");
    const testText = "This is a test sentence for embedding generation.";
    const embedding = await generateEmbedding(testText);

    console.log(`✅ Generated embedding with ${embedding.length} dimensions`);
    console.log(
      `📊 First 5 values: [${embedding
        .slice(0, 5)
        .map((v) => v.toFixed(4))
        .join(", ")}]`
    );
    console.log(
      `📊 Non-zero values: ${embedding.filter((v) => v !== 0).length}`
    );

    return embedding;
  } catch (error) {
    console.error("❌ Embedding test failed:", error);
    throw error;
  }
};

// Run test if this file is executed directly
if (process.argv[1] && process.argv[1].includes('embeddings.ts')) {
  console.log('🚀 Running embedding test...');
  testEmbedding().catch(console.error);
}
