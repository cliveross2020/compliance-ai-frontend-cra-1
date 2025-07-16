<<<<<<< HEAD
=======
// src/components/GlobalCodeComparator.jsx
>>>>>>> 2a528cc (Fix react-app-rewired install issue)
import React, { useState } from 'react';
import axios from 'axios';

const GlobalCodeComparator = () => {
  const [activity, setActivity] = useState('');
  const [stakeholder, setStakeholder] = useState('');
  const [comparison, setComparison] = useState({});

  const handleCompare = async () => {
    try {
<<<<<<< HEAD
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await axios.post(`${backendUrl}/api/compare/global`, { activity, stakeholder });
=======
      const response = await axios.post('http://localhost:8000/api/compare/global', { activity, stakeholder });
>>>>>>> 2a528cc (Fix react-app-rewired install issue)
      setComparison(response.data.comparison);
    } catch (error) {
      console.error('Error fetching comparison data:', error);
    }
  };

  return (
    <div>
      <h3>Global Code Comparator</h3>
      <div>
        <input
          type="text"
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          placeholder="Enter Activity (e.g., sponsorship)"
        />
        <input
          type="text"
          value={stakeholder}
          onChange={(e) => setStakeholder(e.target.value)}
          placeholder="Enter Stakeholder (e.g., HCP)"
        />
        <button onClick={handleCompare}>Compare</button>
      </div>

      <div>
        <h4>Comparison Results:</h4>
<<<<<<< HEAD
        {Object.keys(comparison).length > 0 ? (
=======
        {comparison ? (
>>>>>>> 2a528cc (Fix react-app-rewired install issue)
          <div>
            <h5>UK ABPI</h5>
            <p>Hospitality: {comparison.UK_ABPI?.hospitality}</p>
            <p>Threshold: {comparison.UK_ABPI?.threshold}</p>

            <h5>US PhRMA</h5>
            <p>Hospitality: {comparison.US_PhrMA?.hospitality}</p>
            <p>Threshold: {comparison.US_PhrMA?.threshold}</p>

            <h5>EU EFPIA</h5>
            <p>Hospitality: {comparison.EU_EFPIA?.hospitality}</p>
            <p>Threshold: {comparison.EU_EFPIA?.threshold}</p>
          </div>
        ) : (
          <p>No comparison data available. Please enter activity and stakeholder.</p>
        )}
      </div>
    </div>
  );
};

export default GlobalCodeComparator;
