import React, { useState } from 'react';
import { ArrowUpRight, ChevronRight } from 'lucide-react';

export default function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  gradientFrom, 
  gradientTo, 
  features = [],
  onClick,
  className = ''
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.05] backdrop-blur-xl transition-all duration-500 hover:from-white/[0.12] hover:to-white/[0.04] hover:border-white/[0.1] hover:shadow-2xl hover:shadow-purple-500/[0.1] hover:scale-[1.02] cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-0 group-hover:opacity-10 transition-all duration-700`} />
      
      {/* Content */}
      <div className="relative p-8">
        {/* Icon and title section */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all duration-300">
                {title}
              </h3>
            </div>
          </div>
          
          <ArrowUpRight 
            className={`w-5 h-5 text-gray-400 transition-all duration-300 ${
              isHovered ? 'translate-x-1 -translate-y-1 text-white' : ''
            }`} 
          />
        </div>
        
        {/* Description */}
        <p className="text-gray-300 text-sm leading-relaxed mb-6 group-hover:text-gray-200 transition-colors duration-300">
          {description}
        </p>
        
        {/* Feature list */}
        {features.length > 0 && (
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-2 text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300"
                style={{ 
                  transitionDelay: `${index * 50}ms` 
                }}
              >
                <ChevronRight className="w-3 h-3 text-gray-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Bottom accent line */}
        <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${gradientFrom} ${gradientTo} transition-all duration-500 ${
          isHovered ? 'w-full' : 'w-0'
        }`} />
      </div>
      
      {/* Subtle shine effect */}
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 transition-all duration-1000 ${
        isHovered ? 'translate-x-full' : '-translate-x-full'
      }`} />
    </div>
  );
} 