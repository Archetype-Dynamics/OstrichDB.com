/**
 * =================================================
 * Author: Claude Code
 * GitHub: @claude-code
 * Contributors:
 *
 *
 * License: Apache License 2.0 (see LICENSE file for details)
 * Copyright (c) 2025-Present Archetype Dynamics, Inc.
 * File Description:
 *    Testimonials section component with social proof
 * =================================================
 **/

import React from "react";
import { useScrollAnimation, getAnimationClasses } from "../../utils/hooks/useScrollAnimation";

const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Senior Backend Developer",
    company: "TechCorp",
    content: "OstrichDB's natural language queries have revolutionized how our team interacts with data. What used to take complex SQL now takes a simple question.",
    rating: 5
  },
  {
    id: 2,
    name: "Marcus Johnson",
    role: "CTO",
    company: "StartupXYZ",
    content: "The hierarchical organization just makes sense. We went from 3 days of database setup to 30 minutes. Absolutely game-changing.",
    rating: 5
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Full Stack Engineer",
    company: "DataFlow Inc",
    content: "Built-in AES-256 encryption without any configuration? This is exactly what modern databases should be. Security by default is brilliant.",
    rating: 5
  }
];

const Testimonials: React.FC = () => {
  const { elementRef, isVisible } = useScrollAnimation({
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  });

  return (
    <section
      ref={elementRef}
      className="py-16 md:py-20 lg:py-24 relative overflow-hidden"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid opacity-30"></div>

      <div className="container relative z-10">
        <div className="text-center mb-16">
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight ${
              getAnimationClasses(isVisible, 'fadeUp', 0)
            }`}
            style={{ color: "var(--text-primary)" }}
          >
            Loved by <span className="text-sb-amber">Developers</span> Worldwide
          </h2>

          <p
            className={`text-lg md:text-xl max-w-2xl mx-auto ${
              getAnimationClasses(isVisible, 'fadeUp', 100)
            }`}
            style={{ color: "var(--text-secondary)" }}
          >
            See what developers are saying about OstrichDB
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => {
            const delay = 200 + (index * 100);

            return (
              <div
                key={testimonial.id}
                className={`group ${
                  getAnimationClasses(isVisible, 'fadeUpScale', delay)
                }`}
              >
                <div
                  className="relative rounded-2xl p-8 h-full backdrop-blur-sm border-2 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:border-sb-amber/50"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderColor: "var(--border-color)"
                  }}
                >
                  {/* Quote icon */}
                  <div className="text-sb-amber text-5xl mb-4 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                    "
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-sb-amber text-lg">★</span>
                    ))}
                  </div>

                  {/* Content */}
                  <p
                    className="text-base md:text-lg leading-relaxed mb-6 italic"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {testimonial.content}
                  </p>

                  {/* Author */}
                  <div className="pt-6 border-t" style={{ borderColor: "var(--border-color)" }}>
                    <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {testimonial.name}
                    </div>
                    <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>

                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-sb-amber rounded-tr-2xl"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom stats */}
        <div className={`mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto ${
          getAnimationClasses(isVisible, 'fadeUp', 600)
        }`}>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-sb-amber mb-2">1000+</div>
            <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-sb-amber mb-2">500+</div>
            <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Projects Created</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-sb-amber mb-2">4.9/5</div>
            <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-sb-amber mb-2">24/7</div>
            <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Community Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
