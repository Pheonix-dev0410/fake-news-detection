'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiAlertCircle, FiCheckCircle, FiXCircle, FiLoader, FiInfo, FiClock, FiBarChart2 } from 'react-icons/fi';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';

// Create an axios instance with custom config
const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

const MAX_HISTORY = 5;

export default function Home() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setAnalysisProgress(prev => (prev >= 90 ? 90 : prev + 10));
      }, 500);
      return () => clearInterval(interval);
    } else {
      setAnalysisProgress(0);
    }
  }, [loading]);

  const analyzeNews = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      console.log('Sending request to analyze URL:', url);
      const response = await api.post('/analyze', { url });

      console.log('Response:', response.data);
      setResult(response.data);
      setAnalysisHistory(prev => [response.data, ...prev].slice(0, MAX_HISTORY));
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
      setAnalysisProgress(100);
      setTimeout(() => setAnalysisProgress(0), 500);
    }
  };

  const getCredibilityColor = (score) => {
    if (score >= 0.7) return 'bg-green-500';
    if (score >= 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCredibilityText = (score) => {
    if (score >= 0.7) return 'High Credibility';
    if (score >= 0.4) return 'Medium Credibility';
    return 'Low Credibility';
  };

  const getSentimentEmoji = (sentiment) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return '😊';
      case 'negative': return '😟';
      case 'neutral': return '😐';
      case 'mixed': return '🤔';
      default: return '';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Fake News Detection
          </h1>
          <p className="text-gray-400 text-lg">
            Enter a news article URL to analyze its credibility and authenticity
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-6 shadow-2xl mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter news article URL"
                className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <FiLoader className="animate-spin text-blue-500 w-5 h-5" />
                </motion.div>
              )}
            </div>
            <button
              onClick={analyzeNews}
              disabled={loading || !url}
              className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${
                loading || !url
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <FiSearch className="w-5 h-5" />
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4"
            >
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${analysisProgress}%` }}
                  className="h-full bg-blue-500"
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="text-center text-sm text-gray-400 mt-2">
                Analyzing article...
              </div>
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center gap-3 p-4 mb-8 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400"
            >
              <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-800 rounded-xl p-8 shadow-2xl mb-8"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                Analysis Results
                {result.is_fake ? (
                  <Tippy content="This article may contain misleading information" theme="light">
                    <span><FiXCircle className="text-red-500 w-6 h-6" /></span>
                  </Tippy>
                ) : (
                  <Tippy content="This article appears to be credible" theme="light">
                    <span><FiCheckCircle className="text-green-500 w-6 h-6" /></span>
                  </Tippy>
                )}
              </h2>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400 flex items-center gap-2">
                      Credibility Score
                      <Tippy content="Based on comparison with trusted news sources" theme="light">
                        <span><FiInfo className="text-gray-500 w-4 h-4" /></span>
                      </Tippy>
                    </span>
                    <span className="font-medium">
                      {(result.credibility_score * 100).toFixed(1)}% - {getCredibilityText(result.credibility_score)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.credibility_score * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full ${getCredibilityColor(result.credibility_score)}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Tippy content="The emotional tone of the article" theme="light">
                    <div className="bg-gray-700/50 rounded-lg p-4 cursor-help">
                      <span className="text-gray-400 block mb-1">Sentiment</span>
                      <span className="text-lg font-semibold capitalize flex items-center gap-2">
                        {result.sentiment} {getSentimentEmoji(result.sentiment)}
                      </span>
                    </div>
                  </Tippy>

                  <Tippy content="How confident we are in our analysis" theme="light">
                    <div className="bg-gray-700/50 rounded-lg p-4 cursor-help">
                      <span className="text-gray-400 block mb-1">Confidence</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">
                          {(result.confidence * 100).toFixed(1)}%
                        </span>
                        <div className="flex-1 h-2 bg-gray-600 rounded-full">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${result.confidence * 100}%` }}
                            className="h-full bg-blue-500 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </Tippy>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <span className="text-gray-400 block mb-1">Final Verdict</span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-lg font-semibold ${
                      result.is_fake ? 'text-red-400' : 'text-green-400'
                    }`}
                  >
                    {result.is_fake ? 'Likely Fake News' : 'Likely Authentic News'}
                  </motion.span>
                  <p className="text-gray-400 mt-2 text-sm">
                    {result.is_fake 
                      ? "This article shows signs of potential misinformation. Please verify with other sources."
                      : "This article appears to be from a credible source and aligns with trusted news reports."}
                  </p>
                </div>

                {result.source_url && (
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <span className="text-gray-400 block mb-1">Source</span>
                    <a
                      href={result.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors break-all"
                    >
                      {result.source_url}
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {analysisHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800/50 rounded-xl p-6"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FiClock className="w-5 h-5" />
              Recent Analysis History
            </h3>
            <div className="space-y-4">
              {analysisHistory.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-700/30 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {item.is_fake ? (
                      <FiXCircle className="text-red-500 w-5 h-5" />
                    ) : (
                      <FiCheckCircle className="text-green-500 w-5 h-5" />
                    )}
                    <div className="truncate">
                      <div className="text-sm text-gray-300 truncate max-w-[300px]">
                        {item.source_url}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(item.analyzed_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${item.is_fake ? 'text-red-400' : 'text-green-400'}`}>
                      {item.is_fake ? 'Fake' : 'Real'}
                    </span>
                    <div className="h-1.5 w-12 bg-gray-600 rounded-full">
                      <div
                        className={`h-full rounded-full ${getCredibilityColor(item.credibility_score)}`}
                        style={{ width: `${item.credibility_score * 100}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
} 