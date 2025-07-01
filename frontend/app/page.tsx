'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiAlertCircle, FiCheckCircle, FiXCircle, FiLoader, FiInfo, FiClock, FiBarChart2, FiAward, FiCalendar, FiGlobe, FiBookOpen, FiMoon, FiSun } from 'react-icons/fi';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

const currentDate = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

const volumeNumber = "Vol. MMXXIV";
const issueNumber = "No. 42";
const price = "FIVE CENTS";

export default function Home() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check system preference for dark mode
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && url && !loading) {
      analyzeNews();
    }
  };

  const analyzeNews = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      setShowResults(false);
      
      const response = await api.post('/analyze', { url });
      setResult(response.data);
      setShowResults(true);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCredibilityColor = (score) => {
    if (score >= 0.7) return 'text-emerald-400';
    if (score >= 0.4) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <main className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-[#F5F3E8] text-gray-900'
    }`}>
      <div className={`absolute inset-0 bg-[url('/noise.png')] pointer-events-none ${
        isDarkMode ? 'opacity-[0.02]' : 'opacity-[0.08]'
      }`} />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="max-w-7xl mx-auto px-4 py-8 relative"
      >
        {/* Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className={`fixed top-4 right-4 p-3 rounded-full transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          } shadow-lg`}
        >
          {isDarkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
        </button>

        {/* Top Bar */}
        <div className={`flex justify-between items-center mb-4 text-xs tracking-widest border-b pb-2 transition-colors duration-300 ${
          isDarkMode ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-300'
        }`}>
          <div className="flex items-center gap-4">
            <FiGlobe className="w-3 h-3" />
            <span className="font-serif italic">INTERNATIONAL EDITION</span>
          </div>
          <div className="flex items-center gap-4">
            <FiCalendar className="w-3 h-3" />
            <span className="font-serif">{currentDate}</span>
          </div>
          <div className="font-serif">{price}</div>
        </div>

        {/* Masthead */}
        <header className="text-center mb-16 relative">
          <div className={`absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 -ml-4 -mt-4 transition-colors duration-300 ${
            isDarkMode ? 'border-gray-700' : 'border-gray-300'
          }`} />
          <div className={`absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 -mr-4 -mt-4 transition-colors duration-300 ${
            isDarkMode ? 'border-gray-700' : 'border-gray-300'
          }`} />
          
          <div className={`flex justify-between items-center mb-6 text-sm tracking-widest transition-colors duration-300 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`w-12 h-px transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
              }`} />
              {volumeNumber}
            </div>
            <div className="text-xs font-serif italic">{issueNumber}</div>
            <div className="flex items-center gap-2">
              Est. 2024
              <span className={`w-12 h-px transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
              }`} />
            </div>
          </div>
          
          <div className={`border-y-[3px] border-double py-12 my-8 relative transition-colors duration-300 ${
            isDarkMode ? 'border-gray-700' : 'border-gray-300'
          }`}>
            <div className={`absolute -left-4 top-1/2 -translate-y-1/2 transform -rotate-90 text-xs tracking-widest transition-colors duration-300 ${
              isDarkMode ? 'text-gray-600' : 'text-gray-400'
            }`}>
              SINCE 2024
            </div>
            <div className={`absolute -right-4 top-1/2 -translate-y-1/2 transform rotate-90 text-xs tracking-widest transition-colors duration-300 ${
              isDarkMode ? 'text-gray-600' : 'text-gray-400'
            }`}>
              DAILY NEWS
            </div>
            <div className={`uppercase text-sm tracking-[0.3em] mb-4 font-serif italic transition-colors duration-300 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>The</div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="font-serif text-8xl mb-4 tracking-tight leading-none"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              TRUTH DETECTOR
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className={`uppercase text-sm tracking-[0.3em] font-light flex items-center justify-center gap-2 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-500'
              }`}
            >
              <span className={`w-16 h-px transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
              }`} />
              AI-Powered News Analysis & Verification
              <span className={`w-16 h-px transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
              }`} />
            </motion.div>
          </div>
          
          <div className={`flex justify-center gap-12 text-sm uppercase tracking-wider transition-colors duration-300 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            <div className="flex items-center gap-2">
              <FiBookOpen className="w-4 h-4" />
              Edition α
            </div>
            <div className={`transition-colors duration-300 ${
              isDarkMode ? 'text-gray-700' : 'text-gray-300'
            }`}>•</div>
            <div className="font-serif italic">Powered by Azure AI</div>
            <div className={`transition-colors duration-300 ${
              isDarkMode ? 'text-gray-700' : 'text-gray-300'
            }`}>•</div>
            <div>Daily Publication</div>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-32">
          {/* Left Column */}
          <div className="md:col-span-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mb-16 relative"
            >
              <div className={`absolute -left-4 -top-4 bottom-4 w-px transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
              }`} />
              <div className={`absolute -left-4 -top-4 w-4 h-px transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
              }`} />
              <h2 className="font-serif text-5xl mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Verify Your News</h2>
              <p className={`mb-12 text-lg font-serif leading-relaxed transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Enter a news article URL below to analyze its credibility using our advanced AI system. 
                Our algorithm examines multiple factors including sentiment, source reliability, and content authenticity.
              </p>
              <div className="space-y-8">
                <div className={`relative group transition-colors duration-300 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-lg`}>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="ENTER NEWS ARTICLE URL"
                    className={`w-full bg-transparent border-2 px-6 py-6 text-xl focus:outline-none transition-all placeholder:uppercase tracking-wider ${
                      isDarkMode 
                        ? 'border-gray-700 focus:border-gray-600 placeholder:text-gray-700'
                        : 'border-gray-200 focus:border-gray-400 placeholder:text-gray-300'
                    }`}
                  />
                  <div className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-serif italic transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-600' : 'text-gray-400'
                  }`}>Press Enter ↵</div>
                </div>
                <button
                  onClick={analyzeNews}
                  disabled={loading || !url}
                  className={`group w-full px-12 py-6 text-xl uppercase tracking-wider transition-all border-2 ${
                    loading || !url
                      ? isDarkMode 
                        ? 'text-gray-700 border-gray-800 cursor-not-allowed'
                        : 'text-gray-300 border-gray-200 cursor-not-allowed'
                      : isDarkMode
                        ? 'text-gray-100 border-gray-100 hover:bg-gray-100 hover:text-gray-900'
                        : 'text-gray-900 border-gray-900 hover:bg-gray-900 hover:text-white'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <FiLoader className="animate-spin" />
                      Analyzing Article
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      <FiSearch className="group-hover:scale-110 transition-transform" />
                      Analyze Article
                    </span>
                  )}
                </button>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`border-l-4 border-rose-500 p-8 text-xl font-serif mb-16 transition-colors duration-300 ${
                    isDarkMode ? 'bg-rose-950/30 text-rose-400' : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-2">
                    <FiAlertCircle className="w-6 h-6" />
                    <span className="font-bold">Error Notice</span>
                  </div>
                  {error}
                </motion.div>
              )}

              {showResults && result && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-16"
                >
                  <div className={`relative p-12 shadow-xl transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <div className={`absolute -left-4 top-0 bottom-0 w-1 transition-colors duration-300 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                    }`} />
                    <motion.div 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="font-serif text-7xl mb-8 leading-tight"
                      style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                      {result.is_fake ? 'FAKE NEWS ALERT' : 'VERIFIED NEWS'}
                    </motion.div>
                    <motion.div 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className={`text-2xl font-serif ${
                        result.is_fake 
                          ? isDarkMode ? 'text-rose-400' : 'text-rose-600'
                          : isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                      }`}
                    >
                      {result.is_fake 
                        ? 'Our analysis indicates potential misinformation'
                        : 'This article meets our credibility standards'}
                    </motion.div>
                    <div className={`mt-8 font-serif leading-relaxed transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {result.is_fake 
                        ? 'Exercise caution when sharing this content. We recommend cross-referencing with other reliable sources.'
                        : 'This article demonstrates good journalistic practices and aligns with trusted news sources.'}
                    </div>
                  </div>

                  {result.source_url && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className={`border-t pt-8 transition-colors duration-300 ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}
                    >
                      <div className={`uppercase mb-4 tracking-wider text-sm flex items-center gap-2 transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        <FiInfo className="w-4 h-4" />
                        Source Information
                      </div>
                      <a
                        href={result.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-xl font-serif transition-colors break-all ${
                          isDarkMode 
                            ? 'hover:text-emerald-400' 
                            : 'hover:text-emerald-600'
                        }`}
                      >
                        {result.source_url}
                      </a>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - Analysis Details */}
          {showResults && result && (
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className={`md:col-span-4 space-y-12 border-l pl-8 transition-colors duration-300 ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <div>
                <div className={`font-serif text-3xl mb-8 pb-4 border-b-2 border-double transition-colors duration-300 ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-300'
                }`} style={{ fontFamily: 'Playfair Display, serif' }}>Analysis Details</div>
                <div className="space-y-12">
                  <div className={`relative p-6 shadow-lg transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <div className={`uppercase mb-2 tracking-wider text-sm flex items-center gap-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      <FiAward className="w-4 h-4" />
                      Credibility Score
                    </div>
                    <div className="font-serif text-6xl mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {(result.credibility_score * 100).toFixed(0)}
                      <span className={`text-3xl transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-600' : 'text-gray-400'
                      }`}>%</span>
                    </div>
                    <div className={`h-1 rounded-full overflow-hidden transition-colors duration-300 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.credibility_score * 100}%` }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className={`h-full ${
                          result.credibility_score >= 0.7 
                            ? isDarkMode ? 'bg-emerald-400' : 'bg-emerald-500'
                            : result.credibility_score >= 0.4 
                              ? isDarkMode ? 'bg-amber-400' : 'bg-amber-500'
                              : isDarkMode ? 'bg-rose-400' : 'bg-rose-500'
                        }`}
                      />
                    </div>
                    <div className={`mt-2 text-sm font-serif italic transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {result.credibility_score >= 0.7 
                        ? 'High credibility - Trusted source'
                        : result.credibility_score >= 0.4
                        ? 'Medium credibility - Exercise discretion'
                        : 'Low credibility - Potential misinformation'}
                    </div>
                  </div>

                  <div className={`p-6 shadow-lg transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <div className={`uppercase mb-2 tracking-wider text-sm flex items-center gap-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      <FiBarChart2 className="w-4 h-4" />
                      Sentiment Analysis
                    </div>
                    <div className="font-serif text-4xl capitalize mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{result.sentiment}</div>
                    <div className={`text-sm font-serif italic transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      The emotional tone and bias detected in the article content
                    </div>
                  </div>

                  <div className={`p-6 shadow-lg transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <div className={`uppercase mb-2 tracking-wider text-sm flex items-center gap-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      <FiClock className="w-4 h-4" />
                      Analysis Confidence
                    </div>
                    <div className="font-serif text-4xl mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {(result.confidence * 100).toFixed(0)}
                      <span className={`text-2xl transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-600' : 'text-gray-400'
                      }`}>%</span>
                    </div>
                    <div className={`h-1 rounded-full overflow-hidden transition-colors duration-300 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence * 100}%` }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className={`h-full ${
                          isDarkMode ? 'bg-blue-400' : 'bg-blue-500'
                        }`}
                      />
                    </div>
                    <div className={`mt-2 text-sm font-serif italic transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      Confidence level in our analysis results
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className={`fixed bottom-0 left-0 w-full text-center border-t py-8 backdrop-blur-sm transition-colors duration-300 ${
            isDarkMode 
              ? 'border-gray-800 bg-gray-900/80' 
              : 'border-gray-200 bg-[#F5F3E8]/80'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className={`uppercase tracking-wider text-sm font-serif transition-colors duration-300 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              Powered by Azure AI & Machine Learning • Copyright © {new Date().getFullYear()} • All Rights Reserved
            </div>
          </div>
        </motion.footer>
      </motion.div>
    </main>
  );
} 