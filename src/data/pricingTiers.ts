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
      "Up to 500MB database space",
      "50MB file storage",
      "2GB bandwidth",
      "Social OAuth providers",
      "1-day log retention",
      "Community support",
    ],
    cta: "Start for free",
  },
  {
    name: "Pro",
    price: "$25",
    description: "For production applications with room to grow.",
    features: [
      "Up to 8GB database space",
      "100GB file storage",
      "50GB bandwidth",
      "Daily backups",
      "14-day log retention",
      "Email support",
    ],
    cta: "Get started",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$599",
    description: "For large-scale applications and growing teams.",
    features: [
      "Up to 64GB database space",
      "1TB file storage",
      "500GB bandwidth",
      "Point-in-time recovery",
      "28-day log retention",
      "Priority support",
    ],
    cta: "Contact sales",
  },
];
