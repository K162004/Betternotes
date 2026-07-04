const express = require('express');
const router = express.Router();
const generateEmbedding = require('../utils/embedder');
const getCollection = require('../utils/chromaClient');
const axios = require('axios');

router.post('/', async (req, res) => {
  try {
    const { question } = req.body;
    console.log(`❓ Question: ${question}`);

    // Step 1 - Embed the question
    const questionEmbedding = await generateEmbedding(question);

    // Step 2 - Search ChromaDB for similar chunks
    const collection = await getCollection();
    const results = await collection.query({
      queryEmbeddings: [questionEmbedding],
      nResults: 2,
    });

    const relevantChunks = results.documents[0];
    console.log('Found chunks:', relevantChunks);

    // Step 3 - Build context from chunks
    const context = relevantChunks
      .map(chunk => chunk.substring(0, 300))
      .join('\n');

    // Step 4 - Set streaming headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.write(`data: ${JSON.stringify({ type: 'chunks', relevantChunks })}\n\n`);

    // Step 5 - Stream Ollama response
    const ollamaResponse = await axios.post(
      'http://localhost:11434/api/generate',
      {
        model: 'phi3:mini',
        prompt: `<|system|>
        You are a note retrieval assistant. Your ONLY job is to answer based on the notes provided.
        STRICT RULES:
        1. ONLY use information explicitly stated in the notes below.
        2. If the question asks about something NOT explicitly mentioned in the notes, respond with EXACTLY: "I could not find this in your notes."
        3. Do NOT infer, guess, or add any information beyond what is written.
        4. Do NOT answer questions about "types" or "categories" unless explicitly listed in the notes.
        <|end|>
        <|user|>
      Notes:
      ${context}

      Question: ${question}
      <|end|>
      <|assistant|>`,
        stream: true,
        options: {
          num_predict: 150,
          temperature: 0.1,
          top_k: 10,
          top_p: 0.5,
        }
      },
      { responseType: 'stream' }
    );

    // Step 6 - Forward tokens to client
    ollamaResponse.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.response) {
            res.write(`data: ${JSON.stringify({ type: 'token', token: parsed.response })}\n\n`);
          }
          if (parsed.done) {
            res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
            res.end();
          }
        } catch (e) {}
      }
    });

    ollamaResponse.data.on('error', (err) => {
      console.error('Stream error:', err);
      res.end();
    });

  } catch (error) {
    res.status(500).json({
      message: '❌ Error processing question',
      error: error.message
    });
  }
});

module.exports = router;