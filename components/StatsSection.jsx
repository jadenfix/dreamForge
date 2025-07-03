import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Zap, Users, Globe } from 'lucide-react';

function AnimatedCounter({ end, duration = 2000, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / duration;

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, isVisible]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

function StatCard({ icon: Icon, value, label, gradient, delay = 0 }) {
  return (
    <div 
      className="group relative p-8 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-white/[0.08] dark:to-white/[0.02] border border-gray-200 dark:border-white/[0.05] backdrop-blur-xl hover:from-gray-200 hover:to-gray-100 dark:hover:from-white/[0.12] dark:hover:to-white/[0.04] transition-all duration-500 hover:scale-105"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background gradient effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`} />
      
      <div className="relative">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        {/* Value */}
        <div className="text-3xl font-bold text-gray-800 dark:text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all duration-300">
          {value}
        </div>
        
        {/* Label */}
        <div className="text-gray-600 dark:text-gray-400 text-sm font-medium group-hover:text-gray-800 dark:group-hover:text-gray-300 transition-colors duration-300">
          {label}
        </div>
      </div>
      
      {/* Subtle pulse effect */}
      <div className="absolute inset-0 rounded-2xl bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300" />
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent" />
      
      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 mb-6">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">Platform Statistics</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Trusted by{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>
          
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Join the growing community of developers, researchers, and enterprises 
            building the future with advanced vision AI technology.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard
            icon={Zap}
            value={<AnimatedCounter end={50000} suffix="+" />}
            label="Images Analyzed"
            gradient="from-yellow-500 to-orange-500"
            delay={0}
          />
          
          <StatCard
            icon={Users}
            value={<AnimatedCounter end={1200} suffix="+" />}
            label="Active Users"
            gradient="from-blue-500 to-purple-500"
            delay={100}
          />
          
          <StatCard
            icon={Globe}
            value={<AnimatedCounter end={99} suffix=".9%" />}
            label="Uptime"
            gradient="from-green-500 to-emerald-500"
            delay={200}
          />
          
          <StatCard
            icon={TrendingUp}
            value={<AnimatedCounter end={250} suffix="ms" />}
            label="Avg Response Time"
            gradient="from-purple-500 to-pink-500"
            delay={300}
          />
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>All systems operational • Real-time analytics available</span>
          </div>
        </div>
      </div>
    </section>
  );
} 