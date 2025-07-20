import React, { useState } from 'react';
import axios from 'axios';

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, { ...userMessage, type: 'user' }]);

    try {
      const response = await axios.post('https://compliance-ai-backend.onrender.com/api/chat', { message: input });
      const assistantMessage = { role: 'assistant', content: response.data.reply };
      setMessages(prev => [...prev, { ...assistantMessage, type: 'assistant' }]);
      setInput('');
    } catch (err) {
      console.error('Chat error:', err);
    }
  };

  return (
    <div className="PageContainer Chatbot">
      <h2>Compliance Chatbot</h2>

      <div className="ChatWindow">
        {messages.map((msg, idx) => (
          <div key={idx} className={`Message ${msg.type}`}>
            {msg.content}
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="ChatForm">
        <input
          type="text"
          placeholder="Ask something about the ABPI Code..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chatbot;
