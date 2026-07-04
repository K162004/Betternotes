import { useState, useRef, useEffect } from 'react';
import { askQuestionStream } from '../api';


const STORAGE_KEY = 'betternotes_chat_history';

function Chat({ notes }) {
  const [messages, setMessages] = useState(() => {
    // Load chat history from localStorage on first render
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef(null);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (questionText) => {
    const question = (questionText || input).trim();
    if (!question || isThinking) return;

    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setInput('');
    setIsThinking(true);
    setMessages((prev) => [...prev, { role: 'bot', text: '' }]);

    try {
      await askQuestionStream(
        question,
        (token) => {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              text: updated[updated.length - 1].text + token,
            };
            return updated;
          });
        },
        () => {},
        () => setIsThinking(false)
      );
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'bot',
          text: 'Something went wrong. Is your backend running?',
        };
        return updated;
      });
      setIsThinking(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Clear all chat history?')) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="main-panel">
      <div className="chat-header">
        <div className="chat-header-row">
          <div>
            <h1>Chat with your notes</h1>
            <p>Ask anything — answers come only from notes you've saved.</p>
          </div>
          {messages.length > 0 && (
            <button className="clear-chat-btn" onClick={handleClearChat} title="Clear chat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="chat-scroll" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18c0-2 1-3 3-3s3 1 3 3M12 3a6 6 0 0 0-6 6c0 2 1 3 2 4l1 2h6l1-2c1-1 2-2 2-4a6 6 0 0 0-6-6z" />
              </svg>
            </div>
            <h2>Ask anything about your notes</h2>
            {notes.length > 0 ? (
              <>
                <p>You have {notes.length} note{notes.length > 1 ? 's' : ''} — try asking:</p>
                <div className="suggestions">
                  {notes.slice(0, 3).map((note, i) => (
                    <button
                      key={i}
                      className="suggestion-btn"
                      onClick={() => handleSend(`Tell me about ${note.title}`)}
                    >
                     💡 Tell me about {note.title}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p>Add your first note using the <strong>+ New Note</strong> button to get started.</p>
            )}
          </div>
        ) : (
          messages.map((msg, i) => (
            <div className={`msg-row ${msg.role}`} key={i}>
              <div className={`msg-avatar ${msg.role}`}>
                {msg.role === 'bot' ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18c0-2 1-3 3-3s3 1 3 3M12 3a6 6 0 0 0-6 6c0 2 1 3 2 4l1 2h6l1-2c1-1 2-2 2-4a6 6 0 0 0-6-6z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
                  </svg>
                )}
              </div>
              <div>
                <div className="msg-bubble">
                  {msg.role === 'bot' && msg.text === '' && isThinking ? (
                    <div className="typing-dots">
                      <span></span><span></span><span></span>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="chat-input-bar">
        <div className="chat-input-wrap">
          <input
            type="text"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="send-btn" onClick={() => handleSend()} disabled={isThinking}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;