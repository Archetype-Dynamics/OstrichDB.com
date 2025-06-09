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
 *    Contains the Hero component with fade up + scale animation.
 * =================================================
 **/

import { ArrowRight } from "lucide-react";
import { useScrollAnimation, getAnimationClasses } from "../../utils/hooks/useScrollAnimation";

const Hero: React.FC = () => {
  const { elementRef, isVisible } = useScrollAnimation({
    threshold: 0.2,
    rootMargin: '0px'
  });

  return (
    <div 
      ref={elementRef}
      // className="relative min-h-screen pt-24 hero-gradient"
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
          
          <p
            style={{ color: "var(--text-primary)" }}
            className={`text-xl md:text-2xl mb-8 leading-relaxed ${
              getAnimationClasses(isVisible, 'fadeUpScale', 100)
            }`}
          >
            Hierarchical organization. Strong typing. Built-in security. 
            Finally, a database that works the way developers think.
          </p>
          
          <div className={`flex flex-col sm:flex-row justify-center gap-4 ${
            getAnimationClasses(isVisible, 'fadeUpScale', 200)
          }`}>
            <a href="#" className="btn btn-primary py-3 px-6 text-base">
              Start Building Free
            </a>
            <a href="#" className="btn btn-outline py-3 px-6 text-base group">
              <span>View Docs</span>
              <ArrowRight
                size={16}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;