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
 *    Contains the Pricing component for displaying subscription plans.
 * =================================================
 **/

import React from "react";
import { pricingTiers } from "../../data/pricingTiers";
import { Check } from "lucide-react";

const Pricing: React.FC = () => {
  return (
    <section
      id="pricing"
      className="py-20"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            Simple, predictable pricing
          </h2>
          <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
            Start for free, then scale as you grow. No credit card required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              className={`rounded-lg overflow-hidden transition-all duration-300 ${
                tier.highlighted
                  ? "border-2 border-sb-amber relative transform hover:-translate-y-1"
                  : "border hover:border-gray-700"
              }`}
              style={{
                borderColor: tier.highlighted
                  ? undefined
                  : "var(--border-color)",
              }}
            >
              {tier.highlighted && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-sb-amber text-xs px-3 py-1 rounded-full">
                  Most popular
                </div>
              )}

              <div
                className={`p-6 ${
                  tier.highlighted
                    ? "bg-gradient-to-br from-sb-amber/10 to-sb-amber/5"
                    : ""
                }`}
                style={{
                  backgroundColor: tier.highlighted
                    ? undefined
                    : "var(--bg-secondary)",
                }}
              >
                <h3
                  className="text-xl font-bold mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {tier.name}
                </h3>
                <div className="flex items-end mb-4">
                  <span
                    className="text-3xl font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {tier.price}
                  </span>
                  {tier.price !== "Custom" && (
                    <span
                      style={{ color: "var(--text-secondary)" }}
                      className="ml-1"
                    >
                      /month
                    </span>
                  )}
                </div>
                <p style={{ color: "var(--text-secondary)" }} className="mb-6">
                  {tier.description}
                </p>

                <a
                  href="#"
                  className={`block text-center py-2 px-4 rounded-md font-medium transition-colors w-full ${
                    tier.highlighted
                      ? "bg-sb-amber hover:bg-sb-amber-dark text-white"
                      : "border hover:bg-gray-700 text-white"
                  }`}
                  style={{
                    backgroundColor: tier.highlighted
                      ? undefined
                      : "var(--bg-secondary)",
                    borderColor: tier.highlighted
                      ? undefined
                      : "var(--border-color)",
                  }}
                >
                  {tier.cta}
                </a>
              </div>

              <div
                className="p-6"
                style={{ backgroundColor: "var(--bg-primary)" }}
              >
                <ul className="space-y-3">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check
                        size={16}
                        className="text-sb-green mt-1 mr-2 flex-shrink-0"
                      />
                      <span
                        style={{ color: "var(--text-secondary)" }}
                        className="text-sm"
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p style={{ color: "var(--text-secondary)" }} className="mb-4">
            Need something more custom? Contact our sales team for Enterprise
            pricing.
          </p>
          <a href="#" className="btn btn-outline py-3 px-8">
            Contact Sales
          </a>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
