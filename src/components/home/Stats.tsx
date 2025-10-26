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
 *    Stats section component with animated counters
 * =================================================
 **/

import React from "react";
import { useScrollAnimation, getAnimationClasses } from "../../utils/hooks/useScrollAnimation";

const stats = [
  {
    id: 1,
    value: "Zero",
    label: "Configuration",
    description: "Start building immediately",
    gradient: "from-green-500 to-emerald-600"
  },
  {
    id: 2,
    value: "Native",
    label: "Performance",
    description: "Compiled to machine code",
    gradient: "from-cyan-500 to-blue-600"
  },
  {
    id: 3,
    value: "AES-256",
    label: "Encryption",
    description: "Built-in security standard",
    gradient: "from-blue-500 to-indigo-600"
  },
  {
    id: 4,
    value: "100%",
    label: "Open Source",
    description: "Apache 2.0 License",
    gradient: "from-amber-500 to-orange-600"
  }
];

const Stats: React.FC = () => {
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
            Built with <span className="text-sb-amber">Modern</span> Technology
          </h2>

          <p
            className={`text-lg md:text-xl max-w-2xl mx-auto ${
              getAnimationClasses(isVisible, 'fadeUp', 100)
            }`}
            style={{ color: "var(--text-secondary)" }}
          >
            Core features that make OstrichDB unique
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => {
            const delay = 200 + (index * 100);

            return (
              <div
                key={stat.id}
                className={`relative group ${
                  getAnimationClasses(isVisible, 'fadeUpScale', delay)
                }`}
              >
                {/* Card with gradient border effect */}
                <div className="relative h-full">
                  {/* Gradient border */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} rounded-2xl opacity-50 group-hover:opacity-100 blur-sm group-hover:blur transition-all duration-500`}></div>

                  {/* Card content */}
                  <div
                    className="relative rounded-2xl p-8 h-full backdrop-blur-sm border border-opacity-20 hover:border-opacity-40 transition-all duration-500"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      borderColor: "var(--border-color)"
                    }}
                  >
                    {/* Value */}
                    <div className={`text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>
                      {stat.value}
                    </div>

                    {/* Label */}
                    <div
                      className="text-xl font-semibold mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {stat.label}
                    </div>

                    {/* Description */}
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {stat.description}
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

export default Stats;
