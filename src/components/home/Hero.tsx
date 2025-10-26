// /**
//  * =================================================
//  * Author: Kasi Reeves
//  * GitHub: @Kasirocswell
//  * Contributors:
//  *           @SchoolyB
//  *           @GaleSSalazar
//  *
//  * License: Apache License 2.0 (see LICENSE file for details)
//  * Copyright (c) 2025-Present Archetype Dynamics, Inc.
//  * File Description:
//  *    Contains the Hero component
//  * =================================================
//  **/

import { ArrowRight } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { SignUpButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useScrollAnimation, getAnimationClasses } from "../../utils/hooks/useScrollAnimation";
import NLPExampleVideo from "../../videos/NLP_EXAMPLE_USAGE.mov";

const Hero: React.FC = () => {
  const { elementRef, isVisible } = useScrollAnimation({
    threshold: 0.2,
    rootMargin: '0px'
  });

  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  const handleStartBuilding = () => {
    if (isSignedIn) {
      // Redirect authenticated users to projects page
      navigate('/dashboard');
    }
    // For unauthenticated users, we'll use SignUpButton component instead
  };

  return (
    <div
      ref={elementRef}
      className="relative min-h-screen pt-24 pb-12 md:pb-16 lg:pb-20 overflow-hidden"
    >
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid opacity-30"></div>
      <div className="absolute inset-0 hero-gradient-enhanced opacity-50"></div>

      <div className="container pb-20 pt-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 backdrop-blur-sm border ${
            getAnimationClasses(isVisible, 'fadeUpScale', 0)
          }`}
          style={{
            backgroundColor: "rgba(224, 138, 44, 0.1)",
            borderColor: "rgba(224, 138, 44, 0.3)"
          }}>
            <span className="w-2 h-2 bg-sb-amber rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-sb-amber">Modern Database Technology</span>
          </div>

          <h1 className={`text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-8 leading-[1.1] ${
            getAnimationClasses(isVisible, 'fadeUpScale', 100)
          }`}>
            <span style={{ color: "var(--text-primary)" }} className="block mb-2">
              The Database
            </span>
            <span className="text-sb-amber block bg-gradient-to-r from-sb-amber to-amber-300 bg-clip-text text-transparent">
              For Everyone
            </span>
          </h1>

          <p
            style={{ color: "var(--text-primary)" }}
            className={`text-xl md:text-2xl lg:text-3xl mb-6 leading-relaxed font-medium max-w-3xl mx-auto ${
              getAnimationClasses(isVisible, 'fadeUpScale', 200)
            }`}
          >
            Modern database technology, simplified.
          </p>

          <div
            className={`flex flex-wrap justify-center gap-4 md:gap-6 mb-12 text-base md:text-lg ${
              getAnimationClasses(isVisible, 'fadeUpScale', 250)
            }`}
          >
            <div className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
              <span className="text-sb-amber text-xl">✓</span>
              <span>Hierarchical organization</span>
            </div>
            <div className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
              <span className="text-sb-amber text-xl">✓</span>
              <span>Strong typing</span>
            </div>
            <div className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
              <span className="text-sb-amber text-xl">✓</span>
              <span>Built-in security</span>
            </div>
            <div className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
              <span className="text-sb-amber text-xl">✓</span>
              <span>Natural language queries</span>
            </div>
          </div>

          <div className={`flex flex-col sm:flex-row justify-center gap-4 mb-4 ${
            getAnimationClasses(isVisible, 'fadeUpScale', 300)
          }`}>
            {isSignedIn ? (
              <button
                onClick={handleStartBuilding}
                disabled={!isLoaded}
                className="btn-hero-primary group disabled:opacity-50"
              >
                {!isLoaded ? 'Loading...' : 'Start Building Free'}
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <SignUpButton mode="modal">
                <button className="btn-hero-primary group">
                  Start Building Free
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </SignUpButton>
            )}
            <a
              href="https://ostrichdb-docs.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-hero-secondary group"
            >
              <span>View Documentation</span>
              <ArrowRight
                size={20}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />
            </a>
          </div>

          <p
            className={`text-sm mb-16 ${
              getAnimationClasses(isVisible, 'fadeUp', 350)
            }`}
            style={{ color: "var(--text-secondary)", opacity: 0.7 }}
          >
            Note: Not recommended for production use
          </p>

          <div className={`max-w-6xl mx-auto ${
            getAnimationClasses(isVisible, 'fadeUpScale', 400)
          }`}>
            <div className="relative group">
              {/* Glow effect around video */}
              <div className="absolute -inset-4 bg-gradient-to-r from-sb-amber/20 to-sb-amber/10 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>

              <video
                className="relative w-full h-auto rounded-2xl shadow-2xl border border-sb-amber/20"
                controls
                autoPlay
                muted
                loop
                playsInline
                style={{ maxHeight: '70vh', minHeight: '400px' }}
              >
                <source src={NLPExampleVideo} type="video/mp4" />
                <source src={NLPExampleVideo} type="video/quicktime" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;