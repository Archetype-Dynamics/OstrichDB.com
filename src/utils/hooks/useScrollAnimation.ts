/**
 * =================================================
 * Author: Marshall A Burns
 * #GitHub: @SchoolyB
 * Contributors:
 *
 * License: Apache License 2.0 (see LICENSE file for details)
 * Copyright (c) 2025-Present Archetype Dynamics, Inc.
 * File Description:
 *    Custom hook for scroll-triggered animations throughout the site.
 * =================================================
 **/

import { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  const {
    threshold = 0.1,
    rootMargin = '0px 0px -100px 0px',
    triggerOnce = true
  } = options;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce && elementRef.current) {
            observer.unobserve(elementRef.current);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { elementRef, isVisible };
};

// Utility function to get animation classes based on type
export const getAnimationClasses = (
  isVisible: boolean, 
  animationType: 'fadeUp' | 'fadeUpScale' | 'slideLeft' | 'slideRight' | 'staggered',
  delay: number = 0
) => {
  const baseClasses = 'transition-all duration-700 ease-out';
  const delayClass = delay > 0 ? `delay-${delay}` : '';
  
  switch (animationType) {
    case 'fadeUp':
      return `${baseClasses} ${delayClass} ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`;
    
    case 'fadeUpScale':
      return `${baseClasses} ${delayClass} ${
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-8 scale-95'
      }`;
    
    case 'slideLeft':
      return `${baseClasses} ${delayClass} ${
        isVisible 
          ? 'opacity-100 translate-x-0' 
          : 'opacity-0 -translate-x-12'
      }`;
    
    case 'slideRight':
      return `${baseClasses} ${delayClass} ${
        isVisible 
          ? 'opacity-100 translate-x-0' 
          : 'opacity-0 translate-x-12'
      }`;
    
    case 'staggered':
      return `${baseClasses} ${delayClass} ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-6'
      }`;
    
    default:
      return baseClasses;
  }
};