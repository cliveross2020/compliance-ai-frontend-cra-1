// src/MaterialLibrary.jsx
import React, { useState } from 'react';
import axios from 'axios';

const MaterialLibrary = () => {
  const [product, setProduct] = useState('');
  const [indication, setIndication] = useState('');
  const [audience, setAudience] = useState('');
  const [materials, setMaterials] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/materials', {
        product,
        indication,
        audience,
      });
      setMaterials(response.data.materials);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  return (
    <div>
      <h3>Approved Material Library</h3>
      <div>
        <input
          type="text"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          placeholder="Enter product"
        />
        <input
          type="text"
          value={indication}
          onChange={(e) => setIndication(e.target.value)}
          placeholder="Enter indication"
        />
        <input
          type="text"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          placeholder="Enter audience (e.g., promotional)"
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div>
        <h4>Materials:</h4>
        {materials.length > 0 ? (
          <ul>
            {materials.map((material) => (
              <li key={material.id}>
                <h5>{material.name}</h5>
                <p>{material.description}</p>
                <p>Type: {material.type}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No materials found.</p>
        )}
      </div>
    </div>
  );
};

export default MaterialLibrary;
