const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema({
  chunkIndex: Number,
  chunkText: String,
  chromaId: String,
});

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  chunks: [chunkSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Note', noteSchema);