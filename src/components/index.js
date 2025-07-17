import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';  // Import the global CSS file
import App from './App';  // Import the main App component

// Render the App component to the root element
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
