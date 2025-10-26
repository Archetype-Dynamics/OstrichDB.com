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
import { FaDiscord } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer
      className="relative border-t"
      style={{
        backgroundColor: "var(--bg-primary)",
        borderColor: "var(--border-color)",
      }}
    >
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid opacity-20"></div>

      <div className="relative container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-2xl font-bold mb-4">
              <span style={{ color: "var(--text-primary)" }}>Ostrich</span>
              <span className="text-sb-amber">DB</span>
            </h3>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              Modern database technology, simplified.
            </p>
            <div className="flex gap-4">
              <a
                href="https://discord.gg/FPd7SmMMmk"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--text-secondary)" }}
                className="hover:text-sb-amber transition-colors"
                title="Join our Discord community"
              >
                <FaDiscord size={22} />
              </a>
              <a
                href="https://github.com/Archetype-Dynamics/OstrichDB.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--text-secondary)" }}
                className="hover:text-sb-amber transition-colors"
                title="View on GitHub"
              >
                <Github size={22} />
              </a>
              <a
                href="#"
                style={{ color: "var(--text-secondary)" }}
                className="hover:text-sb-amber transition-colors"
                title="Subscribe on YouTube"
              >
                <Youtube size={22} />
              </a>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
              Resources
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://ostrichdb-docs.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--text-secondary)" }}
                  className="hover:text-sb-amber text-sm transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="/contributors"
                  style={{ color: "var(--text-secondary)" }}
                  className="hover:text-sb-amber text-sm transition-colors"
                >
                  Contributors
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Archetype-Dynamics/OstrichDB.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--text-secondary)" }}
                  className="hover:text-sb-amber text-sm transition-colors"
                >
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="/pricing"
                  style={{ color: "var(--text-secondary)" }}
                  className="hover:text-sb-amber text-sm transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  style={{ color: "var(--text-secondary)" }}
                  className="hover:text-sb-amber text-sm transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Archetype-Dynamics/OstrichDB.com/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--text-secondary)" }}
                  className="hover:text-sb-amber text-sm transition-colors"
                >
                  License
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t" style={{ borderColor: "var(--border-color)" }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              © {new Date().getFullYear()} Archetype Dynamics, Inc. All rights reserved.
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Open source • Apache 2.0 License
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;