import React from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle.jsx';

export default function Layout({ children }) {
  return (
    <>
      {/* Navigation */}
      <header className="fixed top-0 inset-x-0 z-40 bg-black/70 dark:bg-black/70 backdrop-blur-md border-b border-white/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200">
            <div className="w-8 h-8 bg-gradient-to-br from-gradient-start to-gradient-end rounded-md flex items-center justify-center">
              <span className="text-white font-extrabold">DF</span>
            </div>
            <span className="hidden md:block font-semibold text-gray-100 dark:text-gray-100 tracking-wide">DreamForge</span>
          </Link>

          {/* Links */}
          <nav className="flex items-center space-x-6 text-sm">
            <Link href="/" className="text-gray-300 hover:text-white transition-all duration-200 hover:scale-105">Home</Link>
            <Link href="/usage" className="text-gray-300 hover:text-white transition-all duration-200 hover:scale-105">Analytics</Link>
            <a href="https://moondream.ai" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-all duration-200 hover:scale-105">About Moondream</a>
            <ThemeToggle />
            <a href="https://github.com/jadenfix/dreamForge" target="_blank" rel="noopener noreferrer" className="hidden md:inline-flex items-center px-3 py-1.5 border border-white/20 rounded-md text-gray-300 hover:bg-white/10 transition-all duration-200 hover:scale-105">
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* Page content shifted by navbar height */}
      <main className="pt-16">{children}</main>
    </>
  );
} 