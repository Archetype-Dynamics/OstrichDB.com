/**
 * =================================================
 * Author: Marshall A. Burns
 * GitHub: @SchoolyB
 * Contributors:
 *           
 *
 * License: Apache License 2.0 (see LICENSE file for details)
 * Copyright (c) 2025-Present Archetype Dynamics, Inc.
 * File Description:
 *    Contains the Problem/Solution component with slide left/right animation.
 * =================================================
 **/

import React, { useState } from "react";
import { useScrollAnimation, getAnimationClasses } from "../../utils/hooks/useScrollAnimation";

const ProblemSolution: React.FC = () => {
  const [activeProblem, setActiveProblem] = useState(0);
  const { elementRef, isVisible } = useScrollAnimation({
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  const problems = [
    {
      id: 0,
      title: "Complex Queries",
      problemTitle: "Aggregation Hell",
      problemDescription: "Simple data retrieval requires complex pipelines, JOINs, and nested operations that make your head spin.",
      problemTags: ["MongoDB", "PostgreSQL"],
      solutionTitle: "Intuitive Paths",
      solutionDescription: "Your data structure IS your query structure. Navigate data naturally with simple, logical paths.",
      solutionIcon: "🎯"
    },
    {
      id: 1,
      title: "Type Safety",
      problemTitle: "Runtime Surprises",
      problemDescription: "\"undefined is not a function\" errors everywhere. Schema chaos and unpredictable data types.",
      problemTags: ["MongoDB", "Supabase"],
      solutionTitle: "Explicit Types",
      solutionDescription: "Every record must have an explicit type, ensuring type safety at all times.",
      solutionIcon: "🛡️"
    },
    {
      id: 2,
      title: "Data Organization", 
      problemTitle: "Flat Structure Hell",
      problemDescription: "Everything forced into rigid tables or flat documents. Your data doesn't match how you think about it.",
      problemTags: ["Most DBs"],
      solutionTitle: "Hierarchical Design",
      solutionDescription: "Projects → Collections → Clusters → Records. Organize data exactly how you think about it.",
      solutionIcon: "🏗️"
    },
    {
      id: 3,
      title: "Setup Complexity",
      problemTitle: "Configuration Nightmare",
      problemDescription: "Hours spent on setup, connection pools, replica sets, and infrastructure instead of building features.",
      problemTags: ["MongoDB", "Most DBs"],
      solutionTitle: "Zero Configuration",
      solutionDescription: "Start building immediately. No setup, no infrastructure management. Just pure focus on your application.",
      solutionIcon: "🚀"
    }
  ];

  return (
    <section
      ref={elementRef}
      className="py-12 md:py-16 lg:py-20 xl:py-24 relative overflow-hidden"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid opacity-30"></div>

      <div className="container relative z-10">
        <div className="text-center mb-20">
          <h2
            className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${
              getAnimationClasses(isVisible, 'fadeUp', 0)
            }`}
            style={{ color: "var(--text-primary)" }}
          >
            Why Most Databases <span className="text-sb-amber">Overcomplicate</span> Everything
          </h2>

          <p
            className={`text-lg md:text-xl mb-12 max-w-3xl mx-auto ${
              getAnimationClasses(isVisible, 'fadeUp', 100)
            }`}
            style={{ color: "var(--text-secondary)" }}
          >
            MongoDB and Supabase create unnecessary complexity. OstrichDB gets back to basics with intuitive data organization.
          </p>

          <div className={`flex flex-wrap justify-center gap-4 mb-8 ${
            getAnimationClasses(isVisible, 'fadeUp', 200)
          }`}>
            {problems.map((problem, index) => (
              <button
                key={problem.id}
                onClick={() => setActiveProblem(index)}
                className={`px-6 py-3 rounded-xl transition-all duration-300 font-semibold text-base ${
                  activeProblem === index
                    ? 'bg-gradient-to-r from-sb-amber to-amber-500 text-white shadow-lg scale-105'
                    : 'hover:scale-105 border-2'
                }`}
                style={{
                  backgroundColor: activeProblem === index ? undefined : "var(--bg-secondary)",
                  color: activeProblem === index ? undefined : "var(--text-secondary)",
                  borderColor: activeProblem === index ? undefined : "var(--border-color)"
                }}
              >
                {problem.title}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10 items-center max-w-7xl mx-auto">
          {/* Problems Side - Slide from Left */}
          <div className={`space-y-6 ${
            getAnimationClasses(isVisible, 'slideLeft', 300)
          }`}>
            <div className="text-center lg:text-right mb-8">
              <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">
                Common Problems
              </h3>
              <div className="h-1 w-24 bg-gradient-to-r from-red-500 to-red-400 ml-auto rounded-full"></div>
            </div>

            <div
              className="p-8 rounded-2xl border-2 transition-all duration-500 backdrop-blur-sm hover:scale-105 hover:shadow-2xl"
              style={{
                backgroundColor: "rgba(255, 107, 107, 0.05)",
                borderColor: "rgba(255, 107, 107, 0.3)"
              }}
            >
              <div className="flex items-center gap-4 mb-4 lg:justify-end">
                <h4 className="text-2xl font-bold" style={{ color: "#ff6b6b" }}>
                  {problems[activeProblem].problemTitle}
                </h4>
              </div>

              <p
                className="mb-6 lg:text-right text-lg leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {problems[activeProblem].problemDescription}
              </p>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                {problems[activeProblem].problemTags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm"
                    style={{
                      backgroundColor: "rgba(255, 107, 107, 0.2)",
                      color: "#ff8a8a",
                      border: "1px solid rgba(255, 107, 107, 0.3)"
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* VS Divider */}
          <div className={`flex justify-center ${
            getAnimationClasses(isVisible, 'fadeUp', 400)
          }`}>
            <div className="relative">
              <div
                className="w-1 h-40 lg:w-40 lg:h-1 rounded-full"
                style={{
                  background: "linear-gradient(to right, rgba(255, 107, 107, 0.5), #e08a2c, rgba(255, 107, 107, 0.5))"
                }}
              ></div>
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full flex items-center justify-center font-bold text-xl border-4 shadow-2xl backdrop-blur-sm"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "#e08a2c",
                  color: "#e08a2c",
                  boxShadow: "0 0 30px rgba(224, 138, 44, 0.3)"
                }}
              >
                VS
              </div>
            </div>
          </div>

          {/* Solutions Side - Slide from Right */}
          <div className={`space-y-6 ${
            getAnimationClasses(isVisible, 'slideRight', 500)
          }`}>
            <div className="text-center lg:text-left mb-8">
              <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-sb-amber to-amber-400 bg-clip-text text-transparent">
                OstrichDB Solutions
              </h3>
              <div className="h-1 w-24 bg-gradient-to-r from-sb-amber to-amber-400 rounded-full"></div>
            </div>

            <div
              className="p-8 rounded-2xl border-2 transition-all duration-500 backdrop-blur-sm hover:scale-105 hover:shadow-2xl"
              style={{
                backgroundColor: "rgba(224, 138, 44, 0.05)",
                borderColor: "rgba(224, 138, 44, 0.3)"
              }}
            >
              <div className="flex items-center gap-4 mb-4">
                <h4 className="text-2xl font-bold text-sb-amber">
                  {problems[activeProblem].solutionTitle}
                </h4>
              </div>

              <p
                className="mb-6 text-lg leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {problems[activeProblem].solutionDescription}
              </p>

              <div className="flex items-center gap-3">
                <span className="font-bold text-xl">
                  <span style={{ color: "var(--text-primary)" }}>Ostrich</span>
                  <span className="text-sb-amber">DB</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-semibold border border-green-500/30">
                  ✓ Just works
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;