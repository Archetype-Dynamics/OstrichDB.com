/**
 * =================================================
 * Author: Kasi Reeves
 * GitHub: @Kasirocswell
 * Contributors:
 *           @SchoolyB
 *           @GaleSSalazar
 *
 * License: Apache License 2.0 (see LICENSE file for details)
 * Copyright (c) 2025-Present Archetype Dynamics, Inc.
 * File Description:
 *    Contains the Features component with staggered grid animations.
 * =================================================
 **/

import React from "react";
import { useScrollAnimation, getAnimationClasses } from "../../utils/hooks/useScrollAnimation";

const features = [
  {
    id: 1,
    emoji: "🗣️",
    name: "Natural Language Queries",
    description: "Make queurying data as easy as asking a question. No SQL, no syntax, just results."
  },
  {
    id: 2,
    emoji: "💪",
    name: "Strongly Typed Records",
    description: "Every Record must have an explicit type at creation time not runtime."
  },
  {
    id: 3,
    emoji: "🔒",
    name: "Secure by Default",
    description: "Built-in AES-256 encryption per Collection. No enterprise upsells required."
  },
  {
    id: 4,
    emoji: "⚡",
    name: "Native Performance",
    description: "Written in Odin, compiled to native code. No VM overhead, no JavaScript bottlenecks. Just pure speed."
  }
];

const Features: React.FC = () => {
  const { elementRef, isVisible } = useScrollAnimation({
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  return (
    <section 
      ref={elementRef}
      className="py-12 md:py-16 lg:py-20 xl:py-24" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight ${
              getAnimationClasses(isVisible, 'fadeUp', 0)
            }`}
            style={{ color: "var(--text-primary)" }}
          >
            Why <span className="gradient-text">Ostrich</span>
            <span>DB</span> Is Different
          </h2>

          <p 
            className={`text-lg ${getAnimationClasses(isVisible, 'fadeUp', 100)}`}
            style={{ color: "var(--text-secondary)" }}
          >
            Security, Structure, Safety, & Speed
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const delay = 200 + (index * 100);
            
            return (
              <div
    key={feature.id}
    className={`bg-gradient-to-br p-px rounded-lg group cursor-pointer min-h-[260px] relative ${
      getAnimationClasses(isVisible, 'fadeUp', delay)
    }`}
    style={{
      background: 'radial-gradient(circle at center, rgba(224, 138, 44, 0.5) 0%, rgba(224, 138, 44, 0.2) 50%, transparent 70%)'
    }}
  >
    {/* Amber backlight glow effect */}
    <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out">
      <div 
        className="absolute inset-0 rounded-lg blur-xl"
        style={{
          background: 'radial-gradient(circle at center, rgba(224, 138, 44, 0.3) 0%, rgba(224, 138, 44, 0.1) 50%, transparent 70%)',
          transform: 'scale(1.1)'
        }}
      ></div>
    </div>
      
    {/* Main card content */}
    <div
      className="rounded-lg p-10 h-full transition-all duration-500 ease-in-out relative overflow-hidden z-10"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      {/* Default state - Emoji + Title */}
      <div className="group-hover:opacity-0 group-hover:transform group-hover:-translate-y-4 transition-all duration-500 ease-in-out flex flex-col items-center justify-center h-full">
        <div className="text-6xl mb-6">
          {feature.emoji}
        </div>
        <h3
          className="text-xl font-medium text-center"
          style={{ color: "var(--text-primary)" }}
        >
          {feature.name}
        </h3>
      </div>
      
      {/* Hover state - Emoji and description */}
      <div className="absolute inset-10 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-in-out flex flex-col items-center justify-center">
        <div className="text-4xl mb-6">{feature.emoji}</div>
      
      <p 
        className="text-xl leading-relaxed text-center"
        style={{ color: "var(--text-secondary)" }}
      >
        {feature.description}
      </p>
    </div>
  </div>
</div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;