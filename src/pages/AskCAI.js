import React, { useState } from 'react';
import './AskCAI.css';
import logo from '../assets/cai-logo.png';

const AskCAI = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    const userMessage = { role: 'user', content: query };

    try {
      const res = await fetch('https://compliance-ai-app.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });

      const data = await res.json();
      const botMessage = {
        role: 'assistant',
        content: data.reply || 'No answer received.'
      };

      setChatHistory((prev) => [...prev, userMessage, botMessage]);
      setResponse(data.reply);
      setQuery('');
    } catch (err) {
      console.error('Chat error:', err);
      setResponse('❌ Error connecting to CAI.');
    }

    setLoading(false);
  };

  return (
    <div className="ask-cai-container">
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <img src={logo} alt="Compliance AI Logo" style={{ width: '32px', height: '32px' }} />
        Ask CAI
      </h1>
      <p className="ask-cai-subtitle">Instant compliance answers powered by GPT and the ABPI Code.</p>

      <form onSubmit={handleSubmit} className="ask-cai-form">
        <input
          type="text"
          value={query}
          placeholder="Ask about clauses, requirements, or scenarios..."
          onChange={(e) => setQuery(e.target.value)}
          className="ask-cai-input"
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
