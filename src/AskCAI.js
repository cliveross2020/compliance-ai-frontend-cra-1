import React, { useState } from 'react';
import './AskCAI.css';

const AskCAI = () => {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { role: 'user', content: query };
    setChatHistory((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch('https://compliance-ai-backend.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      const answer = data.answer || 'No response from CAI.';
      const botMessage = { role: 'assistant', content: answer };

      setChatHistory((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('❌ Error:', error);
      const errorMsg = { role: 'assistant', content: '❌ Sorry, something went wrong connecting to CAI.' };
      setChatHistory((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setQuery('');
    }
  };

  return (
    <div className="ask-cai-container">
      <h1>🧠 Ask CAI</h1>
      <p className="ask-cai-subtitle">Instant answers based on the ABPI Code of Practice.</p>

      <form onSubmit={handleSubmit} className="ask-cai-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about clauses, requirements, or scenarios..."
          className="ask-cai-input"
          disabled={loading}
        />
        <button type="submit" className="ask-cai-button" disabled={loading}>
          {loading ? 'Thinking...' : 'Ask'}
        </button>
      </form>

      <div className="ask-cai-chatbox">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`ask-cai-msg ${msg.role}`}>
            <strong>{msg.role === 'user' ? 'You' : 'CAI'}:</strong> {msg.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AskCAI;
