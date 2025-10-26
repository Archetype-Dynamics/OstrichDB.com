/**
 * =================================================
 * Author: Marshall A Burns
 * GitHub: @SchoolyB
 * Contributors: 
 *           @GaleSSalazar
 *
 * License: Apache License 2.0 (see LICENSE file for details)
 * Copyright (c) 2025-Present Archetype Dynamics, Inc.
 * File Description:
 *    Interactive showcase component with staggered fade in animations.
 * =================================================
 **/

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ClusterEditor from "./SampleClusterEditor";
import TerminalQueryEditor from "./SampleQueryEditor";
import {
  useScrollAnimation,
  getAnimationClasses,
} from "../../utils/hooks/useScrollAnimation";

const InteractiveShowcase: React.FC = () => {
  const [activeMode, setActiveMode] = useState("GUI");
  const [activeSection, setActiveSection] = useState(0);
  const { elementRef, isVisible } = useScrollAnimation({
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
  });

  // API examples
  const apiExamples = [
    {
      id: 0,
      title: "🏗️ Create Structure",
      description: "Build your data hierarchy",
      route: "POST /api/v1/projects/ecommerce/collections/products",
      code: `// Create a new collection
POST /api/v1/projects/ecommerce/collections/products

// Create clusters within it  
POST /api/v1/projects/ecommerce/collections/products/clusters/electronics
POST /api/v1/projects/ecommerce/collections/products/clusters/clothing`,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: 1,
      title: "📝 Add Records",
      description: "Insert strongly-typed data",
      route: "POST /api/v1/projects/.../records/laptop-pro",
      code: `// Add a product record
POST /api/v1/projects/ecommerce/collections/products/clusters/electronics/records/laptop-pro
?type=STRING&value="MacBook Pro"

// Strongly typed - guaranteed INTEGER
POST .../records/price?type=INTEGER&value=2499`,
      color: "from-green-500 to-green-600",
    },
    {
      id: 2,
      title: "🔍 Search & Filter",
      description: "Query with intuitive parameters",
      route: "GET /api/v1/projects/.../records?search=macbook",
      code: `// Search by name
GET /collections/products/clusters/electronics/records?search=macbook

// Filter by type  
GET .../records?type=STRING&valueContains=pro

// Price range
GET .../records?minValue=1000&maxValue=3000`,
      color: "from-purple-500 to-purple-600",
    },
  ];

  // GUI examples
  const guiExamples = [
    {
      id: 0,
      title: "🎨 Visual Cluster Editor",
      description: "Create and organize data clusters visually",
      component: "cluster-editor",
    },
    {
      id: 1,
      title: "🗣️ Natural Language Query",
      description: "Ask questions in plain English",
      component: "nlq-editor",
    },
    {
      id: 2,
      title: "💻 Manual Query Editor",
      description: "Write and execute queries in a web based terminal",
      component: "query-editor",
    },
  ];

  const currentExamples = activeMode === "API" ? apiExamples : guiExamples;

  const NLQEditor = () => {
    const navigate = useNavigate();

    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-6 p-8">
        <div className="mb-4">
          <h3
            className="text-2xl font-bold mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Natural Language Queries
          </h3>
          <p className="text-base opacity-80" style={{ color: "var(--text-primary)" }}>
            Ask questions in plain English
          </p>
        </div>

        <div
          className="rounded-lg p-6 border max-w-md w-full"
          style={{
            backgroundColor: "var(--bg-primary)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="mb-6">
            <p
              className="text-base mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Natural language queries are available with our premium plans.
            </p>
            <p
              className="text-sm opacity-70"
              style={{ color: "var(--text-primary)" }}
            >
              Unlock the power of conversational database interactions.
            </p>
          </div>

          <button
            onClick={() => navigate("/pricing")}
            className="w-full bg-sb-amber hover:bg-sb-amber-dark text-white rounded-lg px-6 py-3 font-medium transition-colors"
          >
            View Pricing Plans
          </button>
        </div>
      </div>
    );
  };

  const renderGUIContent = () => {
    const example = guiExamples[activeSection];
    switch (example.component) {
      case "cluster-editor":
        return <ClusterEditor />;
      case "nlq-editor":
        return <NLQEditor />;
      case "query-editor":
        return <TerminalQueryEditor />;
      default:
        return <ClusterEditor />;
    }
  };

  return (
    <section
      ref={elementRef}
      className="py-12 md:py-16 lg:py-20 xl:py-24 relative overflow-hidden"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-sb-amber/5 rounded-full blur-3xl"></div>

      <div className="container relative z-10">
        <div className="text-center mb-20">
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight ${getAnimationClasses(
              isVisible,
              "staggered",
              0
            )}`}
            style={{ color: "var(--text-primary)" }}
          >
            <span className="text-sb-amber">Experience </span>
            OstrichDB
          </h2>

          <p
            className={`text-lg md:text-xl max-w-3xl mx-auto mb-10 ${getAnimationClasses(
              isVisible,
              "staggered",
              100
            )}`}
            style={{ color: "var(--text-secondary)" }}
          >
            Choose your interface: Visual tools for everyone, APIs for
            developers
          </p>

          {/* Mode Toggle - Enhanced */}
          <div
            className={`flex justify-center mt-8 ${getAnimationClasses(
              isVisible,
              "staggered",
              200
            )}`}
          >
            <div
              className="rounded-2xl p-1.5 flex border-2 backdrop-blur-sm"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-color)"
              }}
            >
              <button
                onClick={() => {
                  setActiveMode("GUI");
                  setActiveSection(0);
                }}
                className={`px-8 py-3 rounded-xl text-base font-semibold transition-all duration-300 ${
                  activeMode === "GUI"
                    ? "bg-gradient-to-r from-sb-amber to-amber-500 text-white shadow-lg scale-105"
                    : "hover:bg-opacity-50"
                }`}
                style={{
                  color:
                    activeMode === "GUI" ? "white" : "var(--text-secondary)",
                }}
              >
                Visual Interface
              </button>
              <button
                onClick={() => {
                  setActiveMode("API");
                  setActiveSection(0);
                }}
                className={`px-8 py-3 rounded-xl text-base font-semibold transition-all duration-300 ${
                  activeMode === "API"
                    ? "bg-gradient-to-r from-sb-amber to-amber-500 text-white shadow-lg scale-105"
                    : "hover:bg-opacity-50"
                }`}
                style={{
                  color:
                    activeMode === "API" ? "white" : "var(--text-secondary)",
                }}
              >
                Developer API
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {/* Selection Menu */}
          <div
            className={`lg:col-span-1 ${getAnimationClasses(
              isVisible,
              "staggered",
              300
            )}`}
          >
            <div
              className="rounded-2xl overflow-hidden border-2 backdrop-blur-sm"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
              }}
            >
              {currentExamples.map((example, index) => (
                <div
                  key={example.id}
                  className={`p-6 cursor-pointer transition-all duration-300 border-b-2 relative overflow-hidden group
                    ${
                      activeSection === index
                        ? "bg-sb-amber/10"
                        : "hover:bg-sb-amber/5"
                    }`}
                  style={{
                    borderBottomColor: activeSection === index ? "rgba(224, 138, 44, 0.5)" : "var(--border-color)",
                  }}
                  onMouseEnter={() => setActiveSection(index)}
                >
                  {/* Selection indicator */}
                  {activeSection === index && (
                    <div className="absolute left-0 top-0 w-1.5 h-full bg-gradient-to-b from-sb-amber to-amber-500"></div>
                  )}

                  <div className="flex items-center gap-4">
                    <span className="text-3xl transform group-hover:scale-110 transition-transform duration-300">
                      {example.title.split(" ")[0]}
                    </span>
                    <div className="flex-1">
                      <h3
                        className={`font-semibold text-base transition-colors mb-1
                          ${activeSection === index ? "text-sb-amber" : ""}`}
                        style={{
                          color:
                            activeSection === index
                              ? undefined
                              : "var(--text-primary)",
                        }}
                      >
                        {example.title.split(" ").slice(1).join(" ")}
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {example.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Display Area */}
          <div
            className={`lg:col-span-2 ${getAnimationClasses(
              isVisible,
              "staggered",
              400
            )}`}
          >
            <div
              className="rounded-2xl p-8 h-full min-h-[500px] border-2 backdrop-blur-sm hover:border-sb-amber/30 transition-all duration-500"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
              }}
            >
              {activeMode === "API" ? (
                <>
                  {/* Route display */}
                  <div className="mb-4">
                    <span
                      className="text-xs uppercase tracking-wide font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Example Route
                    </span>
                    <div
                      className="mt-2 p-3 rounded font-mono text-sm"
                      style={{
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <span className="text-sb-amber">
                        {apiExamples[activeSection].route}
                      </span>
                    </div>
                  </div>

                  {/* Code example */}
                  <div>
                    <span
                      className="text-xs uppercase tracking-wide font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Code Example
                    </span>
                    <div
                      className="mt-2 p-4 rounded font-mono text-sm leading-relaxed"
                      style={{
                        backgroundColor: "var(--bg-primary)",
                      }}
                    >
                      <pre className="whitespace-pre-wrap">
                        <code style={{ color: "var(--text-primary)" }}>
                          {apiExamples[activeSection].code}
                        </code>
                      </pre>
                    </div>
                  </div>

                  {/* Visual indicator */}
                  <div className="mt-6 flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-3 bg-gradient-to-r ${apiExamples[activeSection].color}`}
                    ></div>
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {apiExamples[activeSection].title} •{" "}
                      {apiExamples[activeSection].description}
                    </span>
                  </div>
                </>
              ) : (
                renderGUIContent()
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveShowcase;
