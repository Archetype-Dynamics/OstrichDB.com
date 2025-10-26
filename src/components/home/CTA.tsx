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
//  *    Contains the CTA component with fade up + scale animation.
//  * =================================================
//  **/


import React from "react";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { SignUpButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useScrollAnimation, getAnimationClasses } from "../../utils/hooks/useScrollAnimation";

const CTA: React.FC = () => {
  const { elementRef, isVisible } = useScrollAnimation({
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  });

  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isSignedIn) {
      navigate('/dashboard');
    }
//If not authenticated, the SignUpButton component will handle the redirection
  };

  return (
    <section
      ref={elementRef}
      className="py-16 md:py-20 lg:py-24 xl:py-32 relative overflow-hidden"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid opacity-30"></div>

      <div className="container relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Main CTA card */}
          <div
            className={`relative rounded-3xl p-12 md:p-16 backdrop-blur-sm border-2 ${
              getAnimationClasses(isVisible, 'fadeUpScale', 0)
            }`}
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "rgba(224, 138, 44, 0.3)",
              boxShadow: "0 25px 50px -12px rgba(224, 138, 44, 0.25)"
            }}
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-32 h-32">
              <div className="absolute top-6 left-6 w-16 h-16 border-t-4 border-l-4 border-sb-amber rounded-tl-3xl"></div>
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32">
              <div className="absolute bottom-6 right-6 w-16 h-16 border-b-4 border-r-4 border-sb-amber rounded-br-3xl"></div>
            </div>

            <div className="text-center">
              <h2
                className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${
                  getAnimationClasses(isVisible, 'fadeUpScale', 150)
                }`}
                style={{ color: "var(--text-primary)" }}
              >
                Ready to Build Something{" "}
                <span className="bg-gradient-to-r from-sb-amber to-amber-300 bg-clip-text text-transparent">
                  Amazing?
                </span>
              </h2>

              <p
                className={`text-xl md:text-2xl mb-10 leading-relaxed max-w-3xl mx-auto ${
                  getAnimationClasses(isVisible, 'fadeUpScale', 200)
                }`}
                style={{ color: "var(--text-secondary)" }}
              >
                Start your free project today. No credit card required.
              </p>

              <div className={`flex flex-col sm:flex-row justify-center gap-4 mb-8 ${
                getAnimationClasses(isVisible, 'fadeUpScale', 250)
              }`}>
                {isSignedIn ? (
                  <button
                    onClick={handleGetStarted}
                    disabled={!isLoaded}
                    className="btn-hero-primary group disabled:opacity-50"
                  >
                    {!isLoaded ? 'Loading...' : 'Get Started Now'}
                    <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <SignUpButton mode="modal">
                    <button className="btn-hero-primary group">
                      Get Started Now
                      <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </SignUpButton>
                )}
              </div>

              {/* License info */}
              <p
                className={`mt-8 text-sm ${
                  getAnimationClasses(isVisible, 'fadeUp', 350)
                }`}
                style={{ color: "var(--text-secondary)", opacity: 0.7 }}
              >
                Open source • Apache 2.0 License
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;