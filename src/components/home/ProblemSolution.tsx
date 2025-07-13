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
      className="py-12 md:py-16 lg:py-20 xl:py-24" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="container">
        <div className="text-center mb-16">
          <h2 
            className={`text-4xl md:text-5xl font-bold mb-4 ${
              getAnimationClasses(isVisible, 'fadeUp', 0)
            }`}
            style={{ color: "var(--text-primary)" }}
          >
            Why Most Databases <span className="text-sb-amber">Overcomplicate</span> Everything
          </h2>
          
          <p 
            className={`text-lg mb-8 max-w-2xl mx-auto ${
              getAnimationClasses(isVisible, 'fadeUp', 100)
            }`}
            style={{ color: "var(--text-secondary)" }}
          >
            MongoDB and Supabase create unnecessary complexity. OstrichDB gets back to basics with intuitive data organization.
          </p>

          <div className={`flex flex-wrap justify-center gap-3 mb-8 ${
            getAnimationClasses(isVisible, 'fadeUp', 200)
          }`}>
            {problems.map((problem, index) => (
              <button
                key={problem.id}
                onClick={() => setActiveProblem(index)}
                className={`px-4 py-2 rounded-lg transition-all font-medium ${
                  activeProblem === index 
                    ? 'bg-sb-amber text-black' 
                    : 'hover:bg-opacity-50'
                }`}
                style={{
                  backgroundColor: activeProblem === index ? undefined : "var(--bg-secondary)",
                  color: activeProblem === index ? undefined : "var(--text-secondary)",
                  borderColor: "var(--border-color)"
                }}
              >
                {problem.title}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-center">
          {/* Problems Side - Slide from Left */}
          <div className={`space-y-6 ${
            getAnimationClasses(isVisible, 'slideLeft', 300)
          }`}>
            <div className="text-center lg:text-right">
              <h3 className="text-2xl font-bold mb-4" style={{ color: "#ff6b6b" }}>
                Common Problems
              </h3>
            </div>

            <div 
              className="p-6 rounded-lg border-l-4 transition-all duration-300"
              style={{ 
                backgroundColor: "rgba(255, 107, 107, 0.1)",
                borderLeftColor: "#ff6b6b"
              }}
            >
              <div className="flex items-center gap-3 mb-3 lg:justify-end">
                <span className="text-2xl">😵‍💫</span>
                <h4 className="text-xl font-semibold" style={{ color: "#ff8a8a" }}>
                  {problems[activeProblem].problemTitle}
                </h4>
              </div>
              
              <p 
                className="mb-4 lg:text-right"
                style={{ color: "var(--text-secondary)" }}
              >
                {problems[activeProblem].problemDescription}
              </p>
              
              <div className="flex flex-wrap gap-2 lg:justify-end">
                {problems[activeProblem].problemTags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{ 
                      backgroundColor: "rgba(255, 107, 107, 0.2)",
                      color: "#ff8a8a"
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
                className="w-1 h-32 lg:w-32 lg:h-1"
                style={{ 
                  background: "linear-gradient(to right, #666, #e08a2c, #666)"
                }}
              ></div>
              <div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg border-2"
                style={{ 
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "#e08a2c",
                  color: "#e08a2c"
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
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold mb-4 text-sb-amber">
                OstrichDB Solutions
              </h3>
            </div>

            <div 
              className="p-6 rounded-lg border-l-4 transition-all duration-300"
              style={{ 
                backgroundColor: "rgba(224, 138, 44, 0.1)",
                borderLeftColor: "#e08a2c"
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{problems[activeProblem].solutionIcon}</span>
                <h4 className="text-xl font-semibold text-sb-amber">
                  {problems[activeProblem].solutionTitle}
                </h4>
              </div>
              
              <p 
                className="mb-4"
                style={{ color: "var(--text-secondary)" }}
              >
                {problems[activeProblem].solutionDescription}
              </p>
              
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">
                  <span style={{ color: "var(--text-primary)" }}>Ostrich</span>
                  <span className="text-sb-amber">DB</span>
                </span>
                <span className="text-green-500 text-sm">✓ Just works</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;