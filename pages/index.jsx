import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { 
  Brain, 
  Zap, 
  BarChart3, 
  Target, 
  Shield, 
  Download,
  ArrowRight,
  Sparkles,
  Code,
  Globe
} from 'lucide-react';

import Layout from '../components/Layout';
import PromptForm from '../components/PromptForm';
import ResultOverlay from '../components/ResultOverlay';
import HeroSection from '../components/HeroSection.jsx';
import FeatureCard from '../components/FeatureCard';
import StatsSection from '../components/StatsSection';
import TestimonialSection from '../components/TestimonialSection';

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

  const features = [
    {
      icon: Brain,
      title: 'Smart AI Planning',
      description: 'Anthropic AI automatically selects the optimal analysis method for your specific prompt, ensuring the most accurate and relevant results every time.',
      gradientFrom: 'from-purple-500',
      gradientTo: 'to-pink-500',
      features: [
        'Intelligent skill routing',
        'Context-aware processing',
        'Automatic optimization'
      ]
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Powered by optimized Moondream Cloud API with enterprise-grade infrastructure delivering sub-second response times for real-time applications.',
      gradientFrom: 'from-yellow-500',
      gradientTo: 'to-orange-500',
      features: [
        'Sub-second processing',
        'Global CDN distribution',
        'Auto-scaling infrastructure'
      ]
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Comprehensive tracking and monitoring with real-time dashboards, usage insights, and performance metrics to optimize your vision AI workflow.',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-cyan-500',
      features: [
        'Real-time dashboards',
        'Usage optimization',
        'Performance insights'
      ]
    },
    {
      icon: Target,
      title: 'Visual Precision',
      description: 'Interactive bounding boxes, point annotations, and visual overlays provide pixel-perfect accuracy for object detection and localization tasks.',
      gradientFrom: 'from-green-500',
      gradientTo: 'to-emerald-500',
      features: [
        'Pixel-perfect accuracy',
        'Interactive overlays',
        'Multi-object tracking'
      ]
    },
    {
      icon: Shield,
      title: 'Enterprise Ready',
      description: 'Production-grade reliability with fallback systems, error handling, and 99.9% uptime SLA. Built for mission-critical applications.',
      gradientFrom: 'from-red-500',
      gradientTo: 'to-pink-500',
      features: [
        '99.9% uptime SLA',
        'Automated fallbacks',
        'Enterprise security'
      ]
    },
    {
      icon: Download,
      title: 'Seamless Integration',
      description: 'Export results in multiple formats, comprehensive API documentation, and SDK support for rapid integration into existing workflows.',
      gradientFrom: 'from-indigo-500',
      gradientTo: 'to-purple-500',
      features: [
        'Multiple export formats',
        'Comprehensive APIs',
        'SDK libraries'
      ]
    }
  ];

  return (
    <>
      <Head>
        <title>DreamForge - AI-Powered Vision Analysis</title>
        <meta name="description" content="Transform your vision with production-grade VLM platform powered by Moondream and Anthropic AI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
          {/* Hero Section */}
          <HeroSection />

          {/* Progress Overlay */}
          {loading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/60">
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

          {/* Main Playground Section */}
          <section id="full-playground" className="px-4 sm:px-6 lg:px-8 py-20 relative">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 mb-6">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-300">AI-Powered Analysis</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                  Full Analysis{' '}
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                    Playground
                  </span>
                </h2>
                
                <p className="text-xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                  Upload any image and harness advanced AI prompts for comprehensive analysis including 
                  object detection, point localization, visual Q&A, and intelligent captioning.
                </p>
              </div>
              
              <PromptForm onSubmit={handleSubmit} loading={loading} />
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/50 to-transparent" />
            
            <div className="max-w-6xl mx-auto relative">
              <div className="text-center mb-16">
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 mb-6">
                  <Code className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-300">Enterprise Features</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                  Production-Ready{' '}
                  <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Vision AI
                  </span>
                </h2>
                
                <p className="text-xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                  Built with enterprise-grade architecture, advanced AI orchestration, and 
                  best-in-class developer experience for mission-critical applications.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <FeatureCard
                    key={index}
                    {...feature}
                    onClick={() => {
                      // Could navigate to specific feature pages
                      console.log(`Navigate to ${feature.title} details`);
                    }}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <StatsSection />

          {/* Testimonials Section */}
          <TestimonialSection />

          {/* CTA Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20" />
            
            <div className="max-w-4xl mx-auto text-center relative">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 mb-6">
                <Globe className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Get Started Today</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Ready to Transform{' '}
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  Your Vision?
                </span>
              </h2>
              
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-10 leading-relaxed">
                Join thousands of developers and enterprises building the future with DreamForge's 
                advanced vision AI platform. Start analyzing images in seconds.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <a 
                  href="#full-playground"
                  className="group inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-cyan-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
                >
                  <span>Try Free Demo</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                
                <a 
                  href="/usage"
                  className="group inline-flex items-center space-x-2 px-8 py-4 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] hover:border-white/[0.2] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>View Analytics</span>
                </a>
              </div>
              
              <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  <span>Production ready</span>
                </div>
              </div>
            </div>
          </section>

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
                background: 'rgba(17, 24, 39, 0.95)',
                color: '#f3f4f6',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.75rem',
                backdropFilter: 'blur(16px)',
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
      </Layout>
    </>
  );
} 