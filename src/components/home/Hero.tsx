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
      ref={elementRef} //Dev Note: If your IDE is screaming about this line, dont worry about it, leave as is - Marshall
      className="relative min-h-screen pt-24 pb-12 md:pb-16 lg:pb-20 hero-gradient"
    >
      <div className="container pb-20 pt-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${
            getAnimationClasses(isVisible, 'fadeUpScale', 0)
          }`}>
            <span style={{ color: "var(--text-primary)" }} className="block">
              The Database
            </span>
            <span className="text-sb-amber block">For Everyone</span>
          </h1>
          
          {/* Development Warning */}
          <div className={`bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-lg p-4 mb-6 ${
            getAnimationClasses(isVisible, 'fadeUpScale', 80)
          }`}>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">⚠️</span>
              <div className="text-center">
                <div className="font-bold text-sm">DEVELOPMENT SOFTWARE</div>
                <div className="text-xs opacity-90 mt-1">
                  Not suitable for production use • May result in data loss • Use for testing only
                </div>
              </div>
            </div>
          </div>

          <div
            style={{ color: "var(--text-primary)" }}
            className={`text-lg md:text-xl mb-8 leading-relaxed ${
              getAnimationClasses(isVisible, 'fadeUpScale', 100)
            }`}
          >
            <p className="mb-4 opacity-80 text-base md:text-lg">
              Hierarchical organization • Strong typing • Built-in security • Natural language queries
            </p>
            <p className="text-xl md:text-2xl font-medium">
              Modern database technology, simplified.
            </p>
          </div>
          
          <div className={`flex flex-col sm:flex-row justify-center gap-4 mb-12 ${
            getAnimationClasses(isVisible, 'fadeUpScale', 200)
          }`}>
            {isSignedIn ? (
              <button 
                onClick={handleStartBuilding}
                disabled={!isLoaded}
                className="btn btn-primary py-3 px-6 text-base disabled:opacity-50"
              >
                {!isLoaded ? 'Loading...' : 'Start Building Free'}
              </button>
            ) : (
              <SignUpButton mode="modal">
                <button className="btn btn-primary py-3 px-6 text-base">
                  Start Building Free
                </button>
              </SignUpButton>
            )}
            <a href="https://ostrichdb-docs.vercel.app/" target="_blank" rel="noopener noreferrer" className="btn btn-outline py-3 px-6 text-base group">
              <span>View Docs</span>
              <ArrowRight
                size={16}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />
            </a>
          </div>

          <div className={`max-w-7xl mx-auto ${
            getAnimationClasses(isVisible, 'fadeUpScale', 300)
          }`}>
            <video 
              className="w-full h-auto rounded-lg shadow-2xl"
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
  );
};

export default Hero;