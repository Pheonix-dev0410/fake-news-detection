import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

// Create an axios instance with custom config
const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

function App() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Sending request to analyze URL:', url);
      const response = await api.post('/analyze', { url });

      console.log('Response:', response.data);
      setResult(response.data);
    } catch (err) {
      console.error('Error details:', err);
      if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to the analysis server. Please ensure the backend is running at http://localhost:8080');
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.');
      } else {
        setError(err.response?.data?.detail || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Fake News Detection</h1>
        <div className="input-section">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter news article URL"
            className="url-input"
          />
          <button 
            onClick={analyzeNews}
            disabled={loading || !url}
            className="analyze-button"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {result && (
          <div className="result-section">
            <h2>Analysis Results</h2>
            <div className="result-card">
              <p><strong>Credibility Score:</strong> {(result.credibility_score * 100).toFixed(1)}%</p>
              <p><strong>Sentiment:</strong> {result.sentiment}</p>
              <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(1)}%</p>
              <p><strong>Status:</strong> {result.is_fake ? 'Likely Fake' : 'Likely Real'}</p>
              {result.source_url && (
                <p><strong>Source:</strong> <a href={result.source_url} target="_blank" rel="noopener noreferrer">{result.source_url}</a></p>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App; 