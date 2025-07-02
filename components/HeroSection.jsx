import React from 'react';

export default function HeroSection() {
  return (
    <section className="relative isolate flex flex-col items-center justify-center min-h-[60vh] py-24 sm:py-32 md:py-40 overflow-hidden bg-gradient-to-br from-[#0d0d1a] via-[#090a20] to-[#000]">
      {/* Starfield backdrop placeholder; add starfield.svg in /public for effect */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-black bg-opacity-40" />

      <h1 className="text-5xl md:text-6xl font-extrabold text-gradient text-center mb-6">
        DreamForge – forge your own dreams
      </h1>
      <p className="max-w-xl mx-auto text-center text-gray-400 mb-8">
        What will you dream up?
      </p>
      <div className="mt-8 flex gap-4">
        <a
          href="#uploader"
          className="rounded-md bg-fuchsia-600/80 hover:bg-fuchsia-600 text-white px-6 py-3 text-lg font-semibold shadow-lg backdrop-blur-sm transition"
        >
          Try It Now
        </a>
        <a
          href="/usage"
          className="rounded-md border border-cyan-400/70 hover:bg-cyan-400 hover:text-black px-6 py-3 text-lg font-semibold text-cyan-300 transition"
        >
          Analytics
        </a>
      </div>
    </section>
  );
} 