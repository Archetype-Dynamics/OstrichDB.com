/**
 * =================================================
 * Author: Marshall A Burns
 * GitHub: @SchoolyB
 * Contributors:
 *
 *
 * License: Apache License 2.0 (see LICENSE file for details)
 * Copyright (c) 2025-Present Archetype Dynamics, Inc.
 * File Description:
 *    Profile dropdown component for authenticated users
 * =================================================
 **/

import React, { useState, useRef, useEffect } from "react";
import { Settings, LogOut, Folder, User } from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";

const ProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  if (!isSignedIn || !user) {
    return null;
  }

  const handleLogout = () => {
    setIsOpen(false);
    signOut();
  };

  const handleMenuClick = (action: string) => {
    setIsOpen(false);
    //transport the user to the appropriate page based on the action
    if (action === "projects") {
      window.location.href = "/dashboard";
    } else if (action === "collections") {
      window.location.href = "/collections";
    } else if (action === "preferences") {
      window.location.href = "/preferences";
    } else if (action === "account") {
      window.location.href = "/account";
    }
  };

  // Tier configuration (placeholder for now)
  const userTier = "Free"; // This would come from your user data eventually
  const getTierStyle = (tier: string) => {
    const styles = {
      // Free tier uses the cream color from the logo
      Free: { color: "##F3E8FF" },
      //Pro tier uses the amber color from the logo
      Pro: { color: "#F59E0B" },
      //Premium tier uses purple because why not?
      Premium: { color: "#A855F7" },
    };
    return styles[tier as keyof typeof styles] || styles["Free"];
  };

  // Get user info with fallbacks
  const displayName = user?.fullName || user?.firstName || "User";
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";
  const profilePhoto = user?.imageUrl || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName
    )}&background=random`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-8 h-8 rounded-full overflow-hidden border-2 border-transparent hover:border-sb-amber transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sb-amber focus:ring-offset-2 ${
          isOpen ? "opacity-0 scale-75" : "opacity-100 scale-100"
        }`}
        style={{
          borderColor: isOpen ? "var(--logo-secondary)" : "transparent",
        }}
        aria-label="Open profile menu"
        aria-expanded={isOpen}
      >
        <img
          src={profilePhoto}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-10 w-64 rounded-md shadow-lg border z-50 overflow-hidden animate-slide-down"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-color, rgba(255,255,255,0.1))",
          }}
        >
          {/* User Info Section */}
          <div
            className="px-4 py-3 border-b"
            style={{
              borderColor: "var(--border-color, rgba(255,255,255,0.1))",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {displayName}
                  </p>
                  <p
                    className="text-sm truncate"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {userEmail}
                  </p>
                </div>
              </div>

              {/* Tier badge - Outlined style */}
              <div className="ml-2 flex-shrink-0">
                <span
                  className="px-2 py-1 text-xs font-medium rounded border"
                  style={{
                    color: getTierStyle(userTier).color,
                    borderColor: getTierStyle(userTier).color,
                    backgroundColor: "transparent",
                  }}
                >
                  {userTier}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => handleMenuClick("projects")}
              className="w-full px-4 py-2 text-left text-sm hover:opacity-80 transition-opacity flex items-center space-x-3"
              style={{
                color: "var(--text-primary)",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--hover-bg, rgba(255,255,255,0.1))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Folder size={16} />
              <span>Projects</span>
            </button>

            <button
              onClick={() => handleMenuClick("account")}
              className="w-full px-4 py-2 text-left text-sm hover:opacity-80 transition-opacity flex items-center space-x-3"
              style={{
                color: "var(--text-primary)",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--hover-bg, rgba(255,255,255,0.1))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <User size={16} />
              <span>Account</span>
            </button>

            <button
              onClick={() => handleMenuClick("preferences")}
              className="w-full px-4 py-2 text-left text-sm hover:opacity-80 transition-opacity flex items-center space-x-3"
              style={{
                color: "var(--text-primary)",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--hover-bg, rgba(255,255,255,0.1))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Settings size={16} />
              <span>Preferences</span>
            </button>
          </div>

          {/* Logout Section */}
          <div
            className="border-t py-1"
            style={{
              borderColor: "var(--border-color, rgba(255,255,255,0.1))",
            }}
          >
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:text-red-300 transition-colors flex items-center space-x-3"
              style={{ backgroundColor: "transparent" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(239, 68, 68, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;