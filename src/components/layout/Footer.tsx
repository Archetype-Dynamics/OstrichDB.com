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
 *    Contains the Footer component with site links and company information.
 * =================================================
 **/

import React from "react";
import { Github, Youtube } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer
      className="border-t flex items-center justify-center min-h-32"
      style={{
        backgroundColor: "var(--bg-primary)",
        borderColor: "var(--border-color)",
      }}
    >
      <div className="w-full max-w-6xl px-4">
        {/* Main footer content */}
        <div className="flex flex-col md:flex-row items-center py-6 gap-4">
          {/* Left side - Documentation and Contributors */}
          <div className="flex-1 flex justify-start">
            <div className="flex items-center gap-4">
              <a
                href="#"
                style={{ color: "var(--text-secondary)" }}
                className="hover:text-white text-sm transition-colors"
              >
                Documentation
              </a>
              <a
                href="/contributors"
                style={{ color: "var(--text-secondary)" }}
                className="hover:text-white text-sm transition-colors"
              >
                Contributors
              </a>
              <a
                href="/pricing"
                style={{ color: "var(--text-secondary)" }}
                className="hover:text-white text-sm transition-colors"
              >
                Pricing
              </a>
            </div>
          </div>

          {/* Center - Copyright */}
          <div className="flex-1 flex justify-center">
            <div
              style={{ color: "var(--text-secondary)" }}
              className="text-sm text-center leading-tight"
            >
              <div>© {new Date().getFullYear()} Archetype Dynamics, Inc.</div>
              <div>All rights reserved.</div>
            </div>
          </div>

          {/* Right side - Social icons and links */}
          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-4">
            <a
              href="#"
              style={{ color: "var(--text-secondary)" }}
              className="hover:text-white transition-colors"
            >
              <Youtube size={18} />
            </a>
            <a
              href="https://github.com/Archetype-Dynamics/OstrichDB.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--text-secondary)" }}
              className="hover:text-white transition-colors"
            >
              <Github size={18} />
            </a>
            <a
              href="#"
              style={{ color: "var(--text-secondary)" }}
              className="hover:text-white text-sm transition-colors"
            >
              DPA
            </a>
            <a
              href="#"
              style={{ color: "var(--text-secondary)" }}
              className="hover:text-white text-sm transition-colors"
            >
              SLA
            </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;