'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Home() {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyzeNews = async (input: { url?: string; text?: string }) => {
    try {
      setLoading(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/analyze`, input);
      setResult(response.data);
      toast.success('Analysis completed!');
    } catch (error) {
      toast.error('Error analyzing news');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-6xl font-bold mb-8 text-center">
            Fake News Detection
          </h1>
          <p className="text-xl text-gray-400 text-center mb-12">
            Analyze news articles and URLs to determine their credibility
          </p>

          <div className="bg-gray-900 rounded-lg p-8 mb-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Enter URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/article"
                    className="flex-1 bg-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => analyzeNews({ url })}
                    disabled={loading || !url}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 px-6 py-2 rounded-lg flex items-center gap-2"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                    Analyze URL
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-900 text-gray-400">OR</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Enter Article Text
                </label>
                <div className="flex gap-2">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste article text here..."
                    className="flex-1 bg-gray-800 rounded-lg px-4 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => analyzeNews({ text })}
                    disabled={loading || !text}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 px-6 py-2 rounded-lg flex items-center gap-2"
                  >
                    <DocumentTextIcon className="w-5 h-5" />
                    Analyze Text
                  </button>
                </div>
              </div>
            </div>
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 rounded-lg p-8"
            >
              <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Credibility Score:</span>
                  <div className="flex-1 h-2 bg-gray-700 rounded-full">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${result.credibility_score * 100}%`,
                        backgroundColor: result.credibility_score > 0.6 ? '#22c55e' : result.credibility_score > 0.3 ? '#eab308' : '#ef4444'
                      }}
                    />
                  </div>
                  <span className="text-lg font-semibold">
                    {Math.round(result.credibility_score * 100)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Classification:</span>
                  <span className={`ml-2 text-lg font-semibold ${result.is_fake ? 'text-red-500' : 'text-green-500'}`}>
                    {result.is_fake ? 'Fake News' : 'Real News'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Sentiment:</span>
                  <span className={`ml-2 text-lg font-semibold ${
                    result.sentiment === 'positive' ? 'text-green-500' :
                    result.sentiment === 'negative' ? 'text-red-500' :
                    'text-yellow-500'
                  }`}>
                    {result.sentiment.charAt(0).toUpperCase() + result.sentiment.slice(1)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Confidence:</span>
                  <span className="ml-2 text-lg font-semibold">
                    {Math.round(result.confidence * 100)}%
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </main>
  );
} 