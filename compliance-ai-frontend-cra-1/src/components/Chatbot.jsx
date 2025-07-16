import React, { useState } from 'react';

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]); // Show user message instantly
    setInput(''); // Clear input field after sending

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL; // Access backend URL from environment variable
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }), // Sending 'message' as expected by backend
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const botMessage = { role: 'assistant', content: data.reply };
      setMessages((prev) => [...prev, botMessage]); // Add bot reply to the messages
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error communicating with chatbot.' }]); // Show error message
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="border p-2 mb-2 h-64 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
            <span className={msg.role === 'user' ? 'text-blue-500' : 'text-green-500'}>
              {msg.role === 'user' ? 'You' : 'Bot'}:
            </span> {msg.content}
          </div>
        ))}
      </div>
      <input
        className="border p-2 w-full mb-2"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask your compliance question..."
      />
      <button
        className="bg-blue-500 text-white px-4 py-2"
        onClick={handleSend}
      >
        Send
      </button>
    </div>
  );
};

export default Chatbot;
