import React from 'react';
import MiniPlayground from './MiniPlayground.jsx';

export default function HeroSection() {
  return (
    <section className="relative isolate min-h-[80vh] py-24 sm:py-32 md:py-40 overflow-hidden bg-gradient-to-br from-white via-purple-50 to-blue-50 dark:from-[#0d0d1a] dark:via-[#090a20] dark:to-[#000]">
      {/* Starfield backdrop placeholder; add starfield.svg in /public for effect */}
      <div className="pointer-events-none absolute inset-0 -z-10 dark:bg-black/40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold animate-gradient mb-6">
              DreamForge
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-600 dark:text-gray-300 mb-6">
              Forge your own dreams with AI vision
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-400 mb-8 max-w-xl">
              Production-grade Visual Language Model platform powered by Moondream and Anthropic AI. 
              Analyze images with natural language prompts in real-time.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="#full-playground"
                className="btn-primary btn-glow"
              >
                Get Started
              </a>
              <a
                href="/usage"
                className="btn-secondary"
              >
                View Analytics
              </a>
            </div>
            
            {/* Feature Pills */}
            <div className="mt-8 flex flex-wrap gap-2 justify-center lg:justify-start">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                Object Detection
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                Point Localization
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                Visual Q&A
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
                Smart Captioning
              </span>
            </div>
          </div>
          
          {/* Right Column - Interactive Demo */}
          <div className="flex justify-center lg:justify-end">
            <MiniPlayground />
          </div>
        </div>
      </div>
    </section>
  );
} 