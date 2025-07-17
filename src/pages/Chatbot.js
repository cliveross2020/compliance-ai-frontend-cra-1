// src/pages/Chatbot.js
import React, { useState } from 'react';

function Chatbot() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);

    const assistantMessage = {
      role: 'assistant',
      content: "This is a simulated GPT reply. You'll connect this to your backend.",
    };
    setMessages((prev) => [...prev, assistantMessage]);
    setInput('');
  };

  return (
    <section className="Chatbot">
      <h2>Compliance Chatbot</h2>
      <div className="ChatWindow">
        {messages.map((msg, idx) => (
          <div key={idx} className={`Message ${msg.role}`}>
            <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="ChatForm">
        <input
          type="text"
          placeholder="Ask something about ABPI Code..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </section>
  );
}

export default Chatbot;