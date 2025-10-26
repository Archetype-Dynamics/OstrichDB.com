/**
 * =================================================
 * Author: Kasi Reeves
 * GitHub: @Kasirocswell
 * Contributors:
 *           @SchoolyB
 *           @GaleSSalazar
 * License: Apache License 2.0 (see LICENSE file for details)
 * Copyright (c) 2025-Present Archetype Dynamics, Inc.
 * File Description:
 *    Contains navigation link data for the site's navbar.
 * =================================================
 **/

import { NavLink } from "../types";

export const navLinks: NavLink[] = [
  {
    label: "Product",
    href: "#",
    isDropdown: true,
    dropdownItems: [
      {
        label: "Database",
        href: "https://github.com/Archetype-Dynamics/Open-OstrichDB",
        description: "Custom built NoSQL/NoJSON database built in Odin",
      },
      {
        label: "Query Interfaces",
        href: "#queries",
        description: "Natural Language Queries, Manual Editor, Visual Tools",
      },
      {
        label: "API & Integration",
        href: "#api",
        description: "RESTful API access and integration tools",
      },
    ],
  },
  {
    label: "Developers",
    href: "#",
    isDropdown: true,
    dropdownItems: [
      {
        label: "Documentation",
        href: "https://ostrichdb-docs.vercel.app/",
        description: "Guides and references",
      },
      {
        label: "OstrichDB-JS",
        href: "https://github.com/Archetype-Dynamics/ostrichdb-js",
        description: "JavaScript SDK",
      },
      {
        label: "OstrichDB-go",
        href: "https://github.com/Archetype-Dynamics/ostrichdb-go",
        description: "Go SDK",
      },
      {
        label: "Open-OstrichDB",
        href: "https://github.com/Archetype-Dynamics/Open-OstrichDB",
        description: "Open source database",
      },
      {
        label: "OstrichDB-CLI",
        href: "https://github.com/Archetype-Dynamics/OstrichDB-CLI",
        description: "Command line interface",
      },
    ],
  },
];
