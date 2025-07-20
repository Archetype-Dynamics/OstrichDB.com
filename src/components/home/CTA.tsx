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
      ref={elementRef} // Dev Note: If your IDE is screaming about this line, dont worry about it, leave as is - Marshall
      className="py-16 md:py-20 lg:py-24 xl:py-28 relative overflow-hidden">

      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center">
          <h2 
            className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight ${
              getAnimationClasses(isVisible, 'fadeUpScale', 0)
            }`}
            style={{ color: "var(--text-primary)" }}
          >
            Ready to Build Something 
            <span className="text-sb-amber"> Amazing?</span>
          </h2>
          
          <p 
            className={`text-lg md:text-xl mb-8 leading-relaxed ${
              getAnimationClasses(isVisible, 'fadeUpScale', 100)
            }`}
            style={{ color: "var(--text-primary)" }}
          >
            Start your free project today!
          </p>
          
          <div className={`flex flex-col sm:flex-row justify-center gap-4 ${
            getAnimationClasses(isVisible, 'fadeUpScale', 200)
          }`}>
            {isSignedIn ? (
              <button 
                onClick={handleGetStarted}
                disabled={!isLoaded}
                className="btn btn-primary py-3 px-8 text-base disabled:opacity-50"
              >
                {!isLoaded ? 'Loading...' : 'Get Started Now'}
              </button>
            ) : (
              <SignUpButton mode="modal">
                <button className="btn btn-primary py-3 px-8 text-base">
                  Get Started Now
                </button>
              </SignUpButton>
            )}
            <a href="#" className="btn btn-outline py-3 px-8 text-base group">
              <span>Talk to Sales</span>
              <ArrowRight
                size={16}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;