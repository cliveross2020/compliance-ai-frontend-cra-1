import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ABPISearch from './ABPISearch'; // Import the ABPI Search component
import GlobalCodeComparator from './GlobalCodeComparator';  // Import the Global Code Comparator component
import './index.css'; // optional

// Example of using environment variables
const backendUrl = process.env.REACT_APP_BACKEND_URL; // Ensure correct env variable for backend
const openAIKey = process.env.REACT_APP_OPENAI_KEY;   // Ensure correct env variable for OpenAI key

console.log("Backend URL: ", backendUrl);
console.log("OpenAI Key: ", openAIKey);

// Render the app and components
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    {/* Add the ABPISearch and GlobalCodeComparator components */}
    <ABPISearch />
    <GlobalCodeComparator />
  </React.StrictMode>
);
