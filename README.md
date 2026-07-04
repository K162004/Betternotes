# 🧠 BetterNotes — AI Chatbot for Smart Note Retrieval

An AI-powered chatbot that helps users store notes and retrieve information through natural language conversations.

## 📌 Features
- Add, edit, and delete notes
- AI-powered semantic search using embeddings
- Streaming chat responses word by word
- Answers strictly based on saved notes only
- Search notes by title in sidebar

## 🛠️ Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | Node.js / Express |
| Database | MongoDB |
| Vector Store | ChromaDB |
| Embeddings | Ollama (nomic-embed-text) |
| AI Model | Ollama (phi3:mini) |

## 🚀 How to Run Locally

### Prerequisites
- Node.js
- Python + ChromaDB (`pip install chromadb`)
- MongoDB
- Ollama with models: `phi3:mini` and `nomic-embed-text`

### Steps

**1. Start ChromaDB**
```bash
chroma run
```

**2. Start Backend**
```bash
cd backend
node server.js
```

**3. Start Frontend**
```bash
cd frontend
npm run dev
```

**4. Open browser**
http://localhost:5173/

## 📁 Project Structure
betternotes/
├── backend/
│   ├── models/        # MongoDB schemas
│   ├── routes/        # API routes (notes, chat)
│   ├── utils/         # Chunker, embedder, ChromaDB client
│   ├── db.js          # MongoDB connection
│   └── server.js      # Express server
└── frontend/
└── src/
├── components/ # Sidebar, Chat, AddNoteModal
├── App.jsx
├── api.js
└── index.css

## 👩‍💻 Developed By
Students — B.Tech CSE, RCERT Chandrapur (DBATU)  
Internship Project @ Aaiechain
