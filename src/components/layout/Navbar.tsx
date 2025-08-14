/**
 * =================================================
 * Author: Kasi Reeves
 * GitHub: @Kasirocswell
 * Contributors:
 *           @SchoolyB
 *           @GaleSSalazar
 *           @FedaElvis
 *
 * License: Apache License 2.0 (see LICENSE file for details)
 * Copyright (c) 2025-Present Archetype Dynamics, Inc.
 * File Description:
 *    Contains the top Navbar component
 * =================================================
 **/

import React, { useState, useEffect } from "react";
import { ChevronDown, Menu, X, Github, ExternalLink, ArrowUp } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { useLocation } from "react-router-dom";
import AuthButtons from "../common/AuthButtons";
import ProfileDropdown from "../common/UserProfileDropdown";
import { navLinks } from "../../data/navLinks";
import { NavLink } from "../../types";
import ThemeToggle from "../common/ThemeToggle";

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();

  // Check if we're in dashboard or any of its sub-routes
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      setIsScrolled(scrolled);
      
      // Show scroll to top button after scrolling 300px
      setShowScrollToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const toggleDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  const renderDropdown = (link: NavLink) => {
    if (!link.isDropdown) return null;

    return (
      <div
        className={`absolute top-full left-0 w-64 rounded-md shadow-lg p-4 transform origin-top-left transition-all duration-200 border ${
          activeDropdown === link.label
            ? "animate-slide-down opacity-100"
            : "opacity-0 invisible"
        }`}
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-color)"
        }}
      >
        <div className="space-y-3">
          {link.dropdownItems?.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="block px-3 py-2 text-sm rounded-md transition-colors hover:opacity-80"
              style={{
                color: "var(--text-primary)",
                backgroundColor: "transparent"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <div className="font-medium">{item.label}</div>
              {item.description && (
                <div 
                  className="text-xs mt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {item.description}
                </div>
              )}
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {!isDashboardRoute && (
        <nav
          className={`fixed w-full z-50 transition-all duration-300 ${
            isScrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          style={{ color: 'var(--text-primary)' }}
        >
          <div className="container py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <a href="/" className="flex items-center space-x-2">
                <span className="font-bold text-xl">
                  <span className="text-[var(--logo-primary)]">Ostrich</span>
                  <span className="text-[var(--logo-secondary)]">DB</span>
                </span>
                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                  DEV
                </span>
              </a>
  
              {/* Desktop Navigation & Actions */}
              <div className="flex items-center justify-end ml-auto">
                {/* Desktop Navigation - Only show on home page */}
                {location.pathname === '/' && (
                  <div className="hidden md:flex items-center space-x-8 mr-8">
                    {navLinks.map((link) => (
                      <div
                        key={link.label}
                        className="relative"
                        onMouseEnter={() =>
                          link.isDropdown && setActiveDropdown(link.label)
                        }
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                        <button 
                          className="flex items-center space-x-1 transition-colors hover:opacity-80"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <span>{link.label}</span>
                          {link.isDropdown && <ChevronDown size={16} />}
                        </button>
                        {link.isDropdown && renderDropdown(link)}
                      </div>
                    ))}
                  </div>
                )}
  
                {/* Action Buttons */}
                <div className="hidden md:flex items-center space-x-4">
                  <ThemeToggle />
                  <a
                    href="https://github.com/Archetype-Dynamics/OstrichDB.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-sb-amber transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    title="View source on GitHub"
                  >
                    <Github size={20} />
                  </a>
                  
                  {/* Conditional rendering based on authentication */}
                  {isLoaded && (
                    isSignedIn ? <ProfileDropdown /> : <AuthButtons />
                  )}
                </div>
  
                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center space-x-2">
                  <ThemeToggle />
                  {isLoaded && isSignedIn && <ProfileDropdown />}
                  <button 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
  
          {/* Mobile Menu */}
          <div
            className={`md:hidden absolute w-full transition-all duration-300 ease-in-out border-b ${
              mobileMenuOpen
                ? "max-h-[80vh] opacity-100"
                : "max-h-0 opacity-0 invisible"
            } overflow-hidden`}
            style={{ 
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div className="container py-4 space-y-4">
              {/* Mobile Navigation - Only show on home page */}
              {location.pathname === '/' && navLinks.map((link) => (
                <div key={link.label} className="py-2">
                  <button
                    onClick={() =>
                      link.isDropdown
                        ? toggleDropdown(link.label)
                        : setMobileMenuOpen(false)
                    }
                    className="flex items-center justify-between w-full text-left hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <span>{link.label}</span>
                    {link.isDropdown && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          activeDropdown === link.label ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>
  
                  {link.isDropdown && (
                    <div
                      className={`mt-2 pl-4 space-y-2 transition-all duration-200 ${
                        activeDropdown === link.label ? "block" : "hidden"
                      }`}
                    >
                      {link.dropdownItems?.map((item) => (
                        <a
                          key={item.label}
                          href={item.href}
                          className="block py-2 text-sm hover:opacity-80 transition-opacity"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <div className="font-medium">{item.label}</div>
                          {item.description && (
                            <div 
                              className="text-xs mt-1"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              {item.description}
                            </div>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Mobile Auth Section */}
              {isLoaded && !isSignedIn && (
                <div 
                  className="pt-4 border-t"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <AuthButtons />
                </div>
              )}
            </div>
          </div>
        </nav>
      )}
  
      {/* Scroll to Top Button - Only show on home page */}
      {!isDashboardRoute && (
        <button
          onClick={scrollToTop}
          className={`fixed right-6 bottom-6 z-50 w-12 h-12 rounded-full bg-sb-amber hover:bg-sb-amber-dark shadow-lg transition-all duration-300 flex items-center justify-center ${
            showScrollToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
          style={{
            color: 'var(--text-primary)'
          }}
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </>
  );
};

export default Navbar;