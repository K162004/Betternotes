import axios from 'axios';

const API_BASE = 'http://localhost:5000';

export const getNotes = async () => {
  const res = await axios.get(`${API_BASE}/api/notes`);
  return res.data;
};

export const saveNote = async (title, content) => {
  const res = await axios.post(`${API_BASE}/api/notes`, { title, content });
  return res.data;
};

// Streams the chat answer word by word.
// onToken is called every time a new word arrives.
export const askQuestionStream = async (question, onToken, onChunks, onDone) => {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);
    const lines = text.split('\n').filter((l) => l.startsWith('data:'));

    for (const line of lines) {
      const data = JSON.parse(line.replace('data: ', ''));
      if (data.type === 'chunks' && onChunks) onChunks(data.relevantChunks);
      if (data.type === 'token') onToken(data.token);
      if (data.type === 'done' && onDone) onDone();
    }
  }
};

export const deleteNote = async (id) => {
  const res = await axios.delete(`${API_BASE}/api/notes/${id}`);
  return res.data;
};

export const updateNote = async (id, title, content) => {
  const res = await axios.put(`${API_BASE}/api/notes/${id}`, { title, content });
  return res.data;
};