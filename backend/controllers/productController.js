// Impor model Sequelize dan Operator
const { Product, Category } = require('../models');
const { Op } = require('sequelize');

require('dotenv').config(); // Memuat semua variabel dari file .env 

// Inisialisasi OpenAI dan Pinecone tetap sama
const { OpenAI } = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const pineconeIndex = pinecone.index(process.env.PINECONE_INDEX_NAME || "fashong");
const embeddingModel = "text-embedding-3-small";

const getAllProducts = async (req, res) => {
    try {
        console.log("Starting getAllProducts with Sequelize...");

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const offset = (page - 1) * limit; // Sequelize menggunakan 'offset' bukan 'skip'

        console.log(`Fetching products - Page: ${page}, Limit: ${limit}, Offset: ${offset}`);

        // Menggunakan findAndCountAll untuk mendapatkan data dan total dalam satu query
        const { count, rows } = await Product.findAndCountAll({
            limit: limit,
            offset: offset,
            include: [{
                model: Category,
                as: 'category',
            }],
            order: [
                ['createdAt', 'DESC'] // Sintaks order di Sequelize
            ],
            distinct: true, // Penting untuk count yang akurat saat menggunakan include
        });

        console.log(`✅ Found ${rows.length} products, Total: ${count}`);

        res.status(200).json({
            data: rows,
            pagination: {
                totalProducts: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                limit: limit,
            },
        });

    } catch (error) {
        console.error("❌ Error in getAllProducts:", error);
        res.status(500).json({
            message: "Terjadi kesalahan pada server.",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        // Menggunakan findByPk (Find by Primary Key) di Sequelize
        const product = await Product.findByPk(id, {
            include: [{
                model: Category,
                as: 'category',
            }],
        });

        if (!product) {
            return res.status(404).json({ message: 'Produk tidak ditemukan.' });
        }

        res.status(200).json(product);

    } catch (error) {
        console.error("Error saat mengambil produk by ID:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};

// Fungsi untuk pencarian semantik
const semanticSearch = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: "Query pencarian tidak boleh kosong." });
        }

        // 1. & 2. Logika OpenAI & Pinecone tidak berubah
        const embeddingResponse = await openai.embeddings.create({
            model: embeddingModel, input: query, dimensions: 1024,
        });
        const queryVector = embeddingResponse.data[0].embedding;
        const searchResults = await pineconeIndex.query({
            vector: queryVector, topK: 12,
        });

        const productIds = searchResults.matches.map(match => match.id);
        if (productIds.length === 0) return res.json([]);

        // 4. Ambil detail produk dari DB menggunakan Sequelize
        const productsFromDb = await Product.findAll({
            where: {
                id: {
                    [Op.in]: productIds, // Menggunakan Operator 'in'
                },
            },
            include: [{ model: Category, as: 'category' }],
        });

        // 5. Urutkan kembali hasil (logika ini tidak berubah)
        const sortedProducts = productIds.map(id =>
            productsFromDb.find(p => p.id === id)
        ).filter(p => p);

        res.json(sortedProducts);

    } catch (error) {
        console.error("Error pada pencarian semantik:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};

const aiStylist = async (req, res) => {
    try {
        const { id } = req.params;
        // Mengambil data produk menggunakan Sequelize
        const product = await Product.findByPk(id, {
            include: [{ model: Category, as: 'category' }],
        });

        if (!product) {
            return res.status(404).json({ message: "Produk tidak ditemukan." });
        }

        // Sisa logika untuk membuat prompt dan memanggil OpenAI tidak berubah.
        // Struktur objek `product.category.name` akan tetap sama.
        const prompt = `
        You are a creative and helpful fashion stylist.
        Given the following main product:
        - Name: "${product.name}"
        - Category: "${product.category.name}"
        - Description: "${product.description}"
  
        Your task is to suggest 2 complete outfit ideas that feature this product. 
        For each outfit, provide a catchy title and a list of complementary items.
        The complementary items should be general types of clothing (e.g., "slim-fit dark wash jeans", "white canvas sneakers"), not specific brand names.
  
        Respond ONLY with a valid JSON object. The JSON object must follow this structure:
        {
          "outfits": [
            {
              "title": "Outfit Idea Title 1",
              "items": ["Complementary item 1", "Complementary item 2", "Complementary item 3"]
            },
            {
              "title": "Outfit Idea Title 2",
              "items": ["Complementary item A", "Complementary item B", "Complementary item C"]
            }
          ]
        }
      `;

        console.log("Meminta saran dari AI Stylist...");
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        });

        const styleSuggestion = JSON.parse(response.choices[0].message.content);
        res.json(styleSuggestion);

    } catch (error) {
        console.error("Error pada AI Stylist:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};

const visualSearch = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Tidak ada gambar yang diunggah.' });
    }
    try {
        console.log("Memulai pencarian visual...");

        // 1. Ubah gambar menjadi format base64
        const base64Image = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype;

        // 2. Kirim gambar ke GPT-4o untuk mendapatkan deskripsi teks
        console.log("Meminta AI untuk mendeskripsikan gambar...");
        const visionResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Describe the main clothing item in this image in a concise but detailed manner for a semantic search. Focus on its type, color, pattern, material, and style. Example: 'A green olive bomber jacket with a silver zipper and knitted collar'." },
                        {
                            type: "image_url",
                            image_url: { url: `data:${mimeType};base64,${base64Image}` },
                        },
                    ],
                },
            ],
            max_tokens: 100,
        });

        const imageDescription = visionResponse.choices[0].message.content;
        console.log("Deskripsi dari AI:", imageDescription);

        // 3. Gunakan deskripsi tersebut untuk melakukan pencarian semantik
        const embeddingResponse = await openai.embeddings.create({
            model: embeddingModel,
            input: imageDescription,
            dimensions: 1024,
        });
        const queryVector = embeddingResponse.data[0].embedding;

        const searchResults = await pineconeIndex.query({
            vector: queryVector,
            topK: 12,
        });

        const productIds = searchResults.matches.map(match => match.id);
        if (productIds.length === 0) return res.json([]);

        // Mengambil data produk dari DB menggunakan Sequelize
        const productsFromDb = await Product.findAll({
            where: { id: { [Op.in]: productIds } },
            include: [{ model: Category, as: 'category' }],
        });

        const sortedProducts = productIds.map(id => productsFromDb.find(p => p.id === id)).filter(p => p);
        res.json(sortedProducts);

    } catch (error) {
        console.error("Error pada pencarian visual:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};

const aiChatHandler = async (req, res) => {
    try {
        const { history } = req.body;
        if (!history || history.length === 0) {
            return res.status(400).json({ reply: "History cannot be empty." });
        }

        const latestUserMessage = history[history.length - 1].text;

        // --- RETRIEVAL PHASE ---
        console.log(`[RAG] 1. Retrieval: Mencari konteks untuk query "${latestUserMessage}"`);
        const queryEmbedding = await openai.embeddings.create({
            model: embeddingModel,
            input: latestUserMessage,
            dimensions: 1024
        });
        const queryVector = queryEmbedding.data[0].embedding;

        const searchResults = await pineconeIndex.query({
            vector: queryVector,
            topK: 4,
        });

        const productIds = searchResults.matches.map(match => match.id);

        let contextText = "No relevant products found in the store for the latest user query.";
        if (productIds.length > 0) {
            // Mengambil data produk dari DB menggunakan Sequelize
            const relevantProducts = await Product.findAll({
                where: { id: { [Op.in]: productIds } },
            });
            contextText = relevantProducts.map((p, i) =>
                `Product ${i + 1}:\nID: ${p.id}\nName: ${p.name}\nDescription: ${p.description}\nPrice: ${p.price}\n`
            ).join("\n---\n");
        }
        console.log(`[RAG] 1. Retrieval: Konteks ditemukan:\n${contextText}`);

        // --- AUGMENTATION & GENERATION PHASE ---
        console.log("[RAG] 2. & 3.: Membuat prompt dengan riwayat dan memanggil LLM...");

        const formattedHistory = history.map(msg => `${msg.sender === 'user' ? 'User' : 'Revo'}: ${msg.text}`).join('\n');

        const prompt = `
      You are 'Revo', a friendly and expert shopping assistant for REVOSTYLE.
      Your goal is to have a continuous, helpful, and contextual conversation.
      Use the following CHAT HISTORY to understand the context of the conversation.
      Use the following PRODUCT CONTEXT to answer the user's latest question.

      Base your answer ONLY on the provided context. Do not make up products.
      If the user asks a follow-up question (e.g., "what about a cheaper one?"), use the CHAT HISTORY to understand what they are referring to.

      CHAT HISTORY:
      ---
      ${formattedHistory}
      ---

      PRODUCT CONTEXT (based on the latest user message):
      ---
      ${contextText}
      ---

      Respond to the latest user message as 'Revo'. Your response must be a valid JSON object with two keys:
      1. "responseText": A conversational, helpful reply in Markdown format.
      2. "recommendedProductIds": An array of product IDs from the context that you mentioned.

      YOUR JSON RESPONSE:
    `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        });

        const aiJsonResponse = JSON.parse(completion.choices[0].message.content);
        console.log(`[RAG] 3. Generation: Jawaban JSON dari AI:`, aiJsonResponse);

        console.log("11111 : ",aiJsonResponse);
        
        
        res.json({
            reply: aiJsonResponse.responseText,
            productIds: aiJsonResponse.recommendedProductIds || []
        });

    } catch (error) {
        console.error("Error in AI Chat Handler:", error);
        res.status(500).json({ reply: "Sorry, I'm having trouble thinking right now.", productIds: [] });
    }
};

module.exports = {
    getAllProducts,
    semanticSearch,
    aiStylist,
    visualSearch,
    getProductById,
    aiChatHandler
};