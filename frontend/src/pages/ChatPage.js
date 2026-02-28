import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ChatPage = () => {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.chatAI(userMsg.text);
      setMessages((prev) => [...prev, { sender: 'ai', text: res.data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'ai', text: '(error contacting AI)' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <p>Please log in to use the chat assistant.</p>;
  }

  return (
    <div className="chat-page">
      <h2>AI Assistant</h2>
      <div className="chat-window">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.sender}`}>{m.text}</div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="chat-form">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the assistant..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatPage;
