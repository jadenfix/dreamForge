import React, { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "AI Research Lead",
    company: "TechFlow Labs",
    avatar: "SC",
    rating: 5,
    content: "DreamForge has revolutionized our computer vision workflow. The combination of Moondream and Anthropic AI provides incredibly accurate results with minimal setup. Our team's productivity has increased by 40%.",
    highlight: "40% productivity increase"
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    role: "Senior Developer",
    company: "DataVision Inc.",
    avatar: "MR",
    rating: 5,
    content: "The API is incredibly well-designed and the documentation is top-notch. We integrated DreamForge into our production pipeline in just two days. The reliability and performance are outstanding.",
    highlight: "2-day integration"
  },
  {
    id: 3,
    name: "Dr. Emily Watson",
    role: "Computer Vision Researcher",
    company: "Stanford AI Lab",
    avatar: "EW",
    rating: 5,
    content: "As a researcher, I need tools that are both powerful and flexible. DreamForge delivers on both fronts with state-of-the-art accuracy and an intuitive interface that doesn't get in the way of experimentation.",
    highlight: "State-of-the-art accuracy"
  },
  {
    id: 4,
    name: "James Park",
    role: "CTO",
    company: "VisionTech Solutions",
    avatar: "JP",
    rating: 5,
    content: "The analytics dashboard alone is worth the investment. Having real-time insights into our vision AI usage patterns has helped us optimize costs and improve performance across all our applications.",
    highlight: "Real-time insights"
  }
];

function TestimonialCard({ testimonial, isActive, onClick }) {
  return (
    <div 
      className={`cursor-pointer transition-all duration-500 ${
        isActive 
          ? 'opacity-100 scale-100' 
          : 'opacity-60 scale-95 hover:opacity-80'
      }`}
      onClick={onClick}
    >
      <div className="relative p-8 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.05] backdrop-blur-xl hover:from-white/[0.12] hover:to-white/[0.04] transition-all duration-300">
        {/* Quote icon */}
        <Quote className="w-8 h-8 text-purple-400 mb-6 opacity-50" />
        
        {/* Content */}
        <blockquote className="text-gray-200 text-lg leading-relaxed mb-6">
          "{testimonial.content}"
        </blockquote>
        
        {/* Highlight */}
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 mb-6">
          <span className="text-sm font-medium text-purple-300">{testimonial.highlight}</span>
        </div>
        
        {/* Rating */}
        <div className="flex items-center space-x-1 mb-6">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        
        {/* Author */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">{testimonial.avatar}</span>
          </div>
          <div>
            <div className="font-semibold text-white">{testimonial.name}</div>
            <div className="text-sm text-gray-400">{testimonial.role}</div>
            <div className="text-sm text-purple-300">{testimonial.company}</div>
          </div>
        </div>
        
        {/* Active indicator */}
        {isActive && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-b-2xl" />
        )}
      </div>
    </div>
  );
}

export default function TestimonialSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate testimonials
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setActiveIndex((current) => (current + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setActiveIndex((current) => (current - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-transparent" />
      
      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-6">
            <Star className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">Customer Stories</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Loved by{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Developers
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            See how teams around the world are building amazing products with DreamForge's 
            vision AI platform.
          </p>
        </div>

        {/* Main testimonial display */}
        <div className="relative mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
            <TestimonialCard 
              testimonial={testimonials[activeIndex]} 
              isActive={true}
              onClick={() => {}}
            />
          </div>
          
          {/* Navigation arrows */}
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full bg-white/[0.05] backdrop-blur-sm border border-white/[0.1] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.1] transition-all duration-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full bg-white/[0.05] backdrop-blur-sm border border-white/[0.1] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.1] transition-all duration-300"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Testimonial indicators */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveIndex(index);
                setIsAutoPlaying(false);
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === activeIndex 
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-500 scale-125' 
                  : 'bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Bottom stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.05]">
            <div className="text-2xl font-bold text-white mb-2">4.9/5</div>
            <div className="text-gray-400 text-sm">Average Rating</div>
          </div>
          
          <div className="p-6 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.05]">
            <div className="text-2xl font-bold text-white mb-2">500+</div>
            <div className="text-gray-400 text-sm">Happy Customers</div>
          </div>
          
          <div className="p-6 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.05]">
            <div className="text-2xl font-bold text-white mb-2">99.9%</div>
            <div className="text-gray-400 text-sm">Satisfaction Rate</div>
          </div>
        </div>

        {/* Auto-play indicator */}
        <div className="flex items-center justify-center mt-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className={`w-2 h-2 rounded-full ${isAutoPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
            <span>{isAutoPlaying ? 'Auto-rotating' : 'Paused'}</span>
          </div>
        </div>
      </div>
    </section>
  );
} 