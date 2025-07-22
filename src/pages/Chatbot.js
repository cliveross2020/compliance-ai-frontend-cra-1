import React, { useState } from 'react';
import axios from 'axios';
import '../styles.css';

function Chatbot() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = { role: 'user', content: input };
    setMessages([...messages, newMessage]);

    try {
      const res = await axios.post('/api/chat', { message: input });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.answer }]);
    } catch (err) {
      console.error('Error:', err);
    }

    setInput('');
  };

  return (
    <div className="Main">
      <div className="PageContainer">
        <h2>Compliance Chatbot</h2>

        <div className="ChatWindow">
          {messages.map((msg, idx) => (
            <div key={idx} className={`Message ${msg.role}`}>
              {msg.content}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="ChatForm">
          <input
            type="text"
            placeholder="Ask something about the ABPI Code..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default Chatbot;
