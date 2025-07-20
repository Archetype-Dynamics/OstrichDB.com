/**
 * =================================================
 * Author: Kasi Reeves
 * GitHub: @Kasirocswell
 * Contributors:
 *           @SchoolyB
 *
 * License: Apache License 2.0 (see LICENSE file for details)
 * Copyright (c) 2025-Present Archetype Dynamics, Inc.
 * File Description:
 *    Contains pricing tier data for subscription plans.
 * =================================================
 **/

import { PricingTier } from "../types";

export const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for hobby projects and small experiments.",
    features: [
      "1 user",
      "1 Project",
      "1 collection (database) max",
      "500MB max storage",
      "1 backup per day",
      "Access to OstrichDB Discord community",
    ],
    cta: "Start for free",
  },
  {
    name: "Pro",
    price: "$25",
    description: "For production applications with room to grow.",
    features: [
      "2 users",
      "2 Projects",
      "2 collections (databases) max",
      "2GB max storage",
      "5 backups per day",
      "Access to OstrichDB Discord community",
      "Private support channels in Discord",
      "Access to collaborative features",
      "NLP features (50 requests/day)",
    ],
    cta: "Get started",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large-scale applications and growing teams.",
    features: [
      "50 users",
      "20 Projects",
      "100 collections (databases) max",
      "64TB max storage",
      "10 backups per day",
      "Access to collaborative features",
      "NLP features (50 requests/day)",
      "On-call support",
      "Priority support from OstrichDB team",
      "Private support channels in Discord",
      "Access to OstrichDB Discord community",
    ],
    cta: "Contact sales",
  },
];
