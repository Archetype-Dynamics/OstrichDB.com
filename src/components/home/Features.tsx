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
    name: "Natural Language Queries",
    description: "Make queurying data as easy as asking a question. No SQL, no syntax, just results."
  },
  {
    id: 2,
    name: "Strongly Typed Records",
    description: "Every Record must have an explicit type at creation time not runtime."
  },
  {
    id: 3,
    name: "Secure by Default",
    description: "Built-in AES-256 encryption per Collection. No enterprise upsells required."
  },
  {
    id: 4,
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
      className="py-12 md:py-16 lg:py-20 xl:py-24 relative overflow-hidden"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid opacity-30"></div>

      <div className="container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
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
            className={`text-lg md:text-xl ${getAnimationClasses(isVisible, 'fadeUp', 100)}`}
            style={{ color: "var(--text-secondary)" }}
          >
            Security, Structure, Safety, & Speed
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const delay = 200 + (index * 100);

            return (
              <div
                key={feature.id}
                className={`group cursor-pointer relative ${
                  getAnimationClasses(isVisible, 'fadeUpScale', delay)
                }`}
              >
                {/* Animated gradient background */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out">
                  <div
                    className="absolute inset-0 rounded-2xl blur-xl animate-pulse-slow"
                    style={{
                      background: 'radial-gradient(circle at center, rgba(224, 138, 44, 0.4) 0%, rgba(224, 138, 44, 0.1) 50%, transparent 70%)',
                      transform: 'scale(1.1)'
                    }}
                  ></div>
                </div>

                {/* Main card content */}
                <div
                  className="relative rounded-2xl p-12 h-full min-h-[320px] transition-all duration-700 ease-in-out border-2 group-hover:border-sb-amber/50 group-hover:shadow-2xl"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderColor: "var(--border-color)"
                  }}
                >
                  {/* Default state - Title */}
                  <div className="absolute inset-12 flex flex-col items-center justify-center text-center group-hover:opacity-0 group-hover:-translate-y-8 transition-all duration-700 ease-in-out">
                    <h3
                      className="text-2xl font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {feature.name}
                    </h3>
                  </div>

                  {/* Hover state - Title and description */}
                  <div className="absolute inset-12 opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 ease-in-out flex flex-col items-center justify-center text-center">
                    <h3
                      className="text-xl font-bold mb-4 text-sb-amber"
                    >
                      {feature.name}
                    </h3>
                    <p
                      className="text-lg leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {feature.description}
                    </p>
                  </div>

                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-sb-amber rounded-tr-2xl"></div>
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