const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const chunkText = require('../utils/chunker');
const generateEmbedding = require('../utils/embedder');
const getCollection = require('../utils/chromaClient');

// POST - Save a new note
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;

    // Step 1 - Split content into chunks
    const chunks = chunkText(content);
    console.log(`📝 Note split into ${chunks.length} chunks`);

    // Step 2 - Get ChromaDB collection
    const collection = await getCollection();

    // Step 3 - Generate embeddings for each chunk
    const chunkDocs = [];
    for (let index = 0; index < chunks.length; index++) {
      const chunk = chunks[index];
      const chromaId = `chunk_${Date.now()}_${index}`;

      console.log(`🔢 Generating embedding for chunk ${index + 1}...`);
      const embedding = await generateEmbedding(chunk);

      // Step 4 - Store embedding in ChromaDB
      await collection.add({
        ids: [chromaId],
        embeddings: [embedding],
        documents: [chunk],
        metadatas: [{ title, chunkIndex: index }]
      });

      console.log(`✅ Chunk ${index + 1} stored in ChromaDB`);

      chunkDocs.push({
        chunkIndex: index,
        chunkText: chunk,
        chromaId: chromaId,
      });
    }

    // Step 5 - Save note with chunks to MongoDB
    const note = new Note({
      title,
      content,
      chunks: chunkDocs
    });
    await note.save();

    res.status(201).json({
      message: '✅ Note saved with embeddings!',
      totalChunks: chunks.length,
      note
    });

  } catch (error) {
    res.status(500).json({
      message: '❌ Error saving note',
      error: error.message
    });
  }
});

// GET - Get all notes
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find();
    res.json(notes);
  } catch (error) {
    res.status(500).json({
      message: '❌ Error fetching notes',
      error: error.message
    });
  }
});

// DELETE - Delete a note by ID (also removes chunks from ChromaDB)
router.delete('/:id', async (req, res) => {
  try {
    // Step 1 - Find the note first to get chunk IDs
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Step 2 - Delete chunks from ChromaDB
    if (note.chunks && note.chunks.length > 0) {
      const getCollection = require('../utils/chromaClient');
      const collection = await getCollection();
      const chromaIds = note.chunks.map(chunk => chunk.chromaId);
      await collection.delete({ ids: chromaIds });
      console.log(`🗑️ Deleted ${chromaIds.length} chunks from ChromaDB`);
    }

    // Step 3 - Delete note from MongoDB
    await Note.findByIdAndDelete(req.params.id);

    res.json({ message: '✅ Note and embeddings deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: '❌ Error deleting note', error: error.message });
  }
});

// PUT - Update a note by ID
router.put('/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    const chunkText = require('../utils/chunker');
    const generateEmbedding = require('../utils/embedder');
    const getCollection = require('../utils/chromaClient');

    // Step 1 - Find existing note
    const existingNote = await Note.findById(req.params.id);
    if (!existingNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Step 2 - Delete old chunks from ChromaDB
    if (existingNote.chunks && existingNote.chunks.length > 0) {
      const collection = await getCollection();
      const oldChromaIds = existingNote.chunks.map(c => c.chromaId);
      await collection.delete({ ids: oldChromaIds });
    }

    // Step 3 - Re-chunk and re-embed new content
    const chunks = chunkText(content);
    const collection = await getCollection();
    const chunkDocs = [];

    for (let index = 0; index < chunks.length; index++) {
      const chunk = chunks[index];
      const chromaId = `chunk_${Date.now()}_${index}`;
      const embedding = await generateEmbedding(chunk);

      await collection.add({
        ids: [chromaId],
        embeddings: [embedding],
        documents: [chunk],
        metadatas: [{ title, chunkIndex: index }]
      });

      chunkDocs.push({ chunkIndex: index, chunkText: chunk, chromaId });
    }

    // Step 4 - Update note in MongoDB
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content, chunks: chunkDocs },
      { new: true }
    );

    res.json({ message: '✅ Note updated successfully!', note: updatedNote });

  } catch (error) {
    res.status(500).json({ message: '❌ Error updating note', error: error.message });
  }
});

module.exports = router;