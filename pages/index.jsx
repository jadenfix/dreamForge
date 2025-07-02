import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import PromptForm from '../components/PromptForm';
import ResultOverlay from '../components/ResultOverlay';
import HeroSection from '../components/HeroSection.jsx';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);

  // Simulate progress bar during loading
  useEffect(() => {
    let timer;
    if (loading) {
      setProgress(0);
      timer = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) {
            return prev + Math.random() * 10;
          }
          return prev;
        });
      }, 400);
    } else {
      setProgress(100);
      const timeout = setTimeout(() => setProgress(0), 500);
      return () => clearTimeout(timeout);
    }
    return () => clearInterval(timer);
  }, [loading]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setCurrentImage(formData.image);
    
    try {
      const response = await fetch('/api/dream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Request failed');
      }

      setResult(data);
      toast.success('Analysis completed successfully!');
      
    } catch (error) {
      console.error('Dream request failed:', error);
      toast.error(error.message || 'Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

  const closeResult = () => {
    setResult(null);
    setCurrentImage(null);
  };

  return (
    <>
      <Head>
        <title>DreamForge - AI-Powered Vision Analysis</title>
        <meta name="description" content="Transform your vision with production-grade VLM platform powered by Moondream and Anthropic AI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-black text-gray-200">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/60 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-gradient-start to-gradient-end rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">DF</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">DreamForge</h1>
                  <p className="text-xs text-gray-500">Powered by Moondream & Anthropic</p>
                </div>
              </div>
              
              <nav className="hidden md:flex items-center space-x-6">
                <a 
                  href="/usage" 
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Analytics
                </a>
                <a 
                  href="https://moondream.ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  About Moondream
                </a>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Live</span>
                </div>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <HeroSection />

        {/* Progress Overlay */}
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
            <div className="relative w-72 h-72 md:w-96 md:h-96">
              {/* Nebula swirl GIF background */}
              <img src="/nebula.gif" alt="loading" className="absolute inset-0 w-full h-full object-cover rounded-full opacity-80 animate-spin-slow" />
              {/* Circular progress */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" stroke="#4f46e5" strokeWidth="10" fill="none" opacity="0.2" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="#6366f1"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={Math.PI * 2 * 45}
                  strokeDashoffset={Math.PI * 2 * 45 * (1 - progress / 100)}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-semibold text-xl">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <section className="px-4 sm:px-6 lg:px-8 -mt-24 pb-20">
          <PromptForm onSubmit={handleSubmit} loading={loading} />
        </section>

        {/* Features Grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Production-Ready Vision AI
              </h3>
              <p className="text-gray-600">
                Built with enterprise-grade architecture and best practices
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: 'Smart Planning',
                  description: 'Anthropic AI automatically selects the best analysis method for your prompt',
                  icon: '🧠',
                  color: 'border-purple-200'
                },
                {
                  title: 'Real-time Analysis',
                  description: 'Fast inference with Moondream cloud API and optimized processing',
                  icon: '⚡',
                  color: 'border-yellow-200'
                },
                {
                  title: 'Usage Analytics',
                  description: 'Comprehensive tracking, monitoring, and performance metrics',
                  icon: '📊',
                  color: 'border-blue-200'
                },
                {
                  title: 'Visual Overlays',
                  description: 'Interactive bounding boxes and point annotations on images',
                  icon: '🎯',
                  color: 'border-green-200'
                },
                {
                  title: 'Fallback System',
                  description: 'Rule-based backup when AI planning is unavailable',
                  icon: '🛡️',
                  color: 'border-red-200'
                },
                {
                  title: 'Export Results',
                  description: 'Download analysis results in JSON format for integration',
                  icon: '💾',
                  color: 'border-indigo-200'
                }
              ].map((feature, index) => (
                <div key={index} className={`p-6 bg-[#111827]/70 rounded-xl border border-white/10 hover:shadow-lg transition-shadow`}>
                  <div className="text-2xl mb-3">{feature.icon}</div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-[#0d0d1a] text-gray-400">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-gradient-start to-gradient-end rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">DF</span>
                  </div>
                  <span className="text-xl font-bold">DreamForge</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Production-grade VLM platform combining the power of Moondream and Anthropic AI 
                  for comprehensive visual intelligence.
                </p>
              </div>
              
              <div>
                <h5 className="font-semibold mb-3">Technology</h5>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>Moondream Vision API</li>
                  <li>Anthropic Claude</li>
                  <li>Next.js & React</li>
                  <li>MongoDB Atlas</li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-semibold mb-3">Features</h5>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>Object Detection</li>
                  <li>Point Localization</li>
                  <li>Visual Q&A</li>
                  <li>Smart Captioning</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
              <p>© 2024 DreamForge. Built with Next.js, Tailwind CSS, and modern AI.</p>
            </div>
          </div>
        </footer>

        {/* Result Overlay */}
        {result && (
          <ResultOverlay 
            result={result} 
            image={currentImage}
            onClose={closeResult}
          />
        )}

        {/* Toast Notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#374151',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </>
  );
} 