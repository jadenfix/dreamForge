import React, { useState } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle.jsx';
import { Menu, X } from 'lucide-react';

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      {/* Navigation */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/70 dark:bg-black/70 backdrop-blur-md border-b border-black/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200">
            <div className="w-8 h-8 bg-gradient-to-br from-gradient-start to-gradient-end rounded-md flex items-center justify-center">
              <span className="text-white font-extrabold">DF</span>
            </div>
            <span className="hidden md:block font-semibold text-gray-800 dark:text-gray-100 tracking-wide">DreamForge</span>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm">
            <Link href="/" className="text-gray-800 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200 hover:scale-105">Home</Link>
            <Link href="/usage" className="text-gray-800 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200 hover:scale-105">Analytics</Link>
            <Link href="/train" className="text-gray-800 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200 hover:scale-105">Train</Link>
            <Link href="/train-guide" className="text-gray-800 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200 hover:scale-105">Train Docs</Link>
            <a href="https://moondream.ai" target="_blank" rel="noopener noreferrer" className="text-gray-800 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200 hover:scale-105">About Moondream</a>
            <ThemeToggle />
            <a href="https://github.com/jadenfix/dreamForge" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-white/20 rounded-md text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200 hover:scale-105">
              GitHub
            </a>
          </nav>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-gray-200" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center space-y-8 md:hidden">
          <button
            className="absolute top-5 right-5 p-2 rounded-md hover:bg-white/10"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-6 h-6 text-gray-200" />
          </button>

          <Link href="/" onClick={() => setMenuOpen(false)} className="text-2xl font-semibold text-white">Home</Link>
          <Link href="/usage" onClick={() => setMenuOpen(false)} className="text-2xl font-semibold text-white">Analytics</Link>
          <Link href="/train" onClick={() => setMenuOpen(false)} className="text-2xl font-semibold text-white">Train</Link>
          <Link href="/train-guide" onClick={() => setMenuOpen(false)} className="text-2xl font-semibold text-white">Train Docs</Link>
          <a href="https://moondream.ai" target="_blank" rel="noopener noreferrer" className="text-2xl font-semibold text-white" onClick={() => setMenuOpen(false)}>
            About Moondream
          </a>
          <a href="https://github.com/jadenfix/dreamForge" target="_blank" rel="noopener noreferrer" className="text-2xl font-semibold text-white" onClick={() => setMenuOpen(false)}>
            GitHub
          </a>
          <ThemeToggle />
        </div>
      )}

      {/* Page content shifted by navbar height */}
      <main className="pt-16">{children}</main>
    </>
  );
} 