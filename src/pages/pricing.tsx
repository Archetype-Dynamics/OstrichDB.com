/**
 * =================================================
 * Author: Marshall A Burns
 * GitHub: @SchoolyB
 * Contributors:
 *
 * License: Apache License 2.0 (see LICENSE file for details)
 * Copyright (c) 2025-Present Archetype Dynamics, Inc.
 * File Description:
 *    Pricing page component that displays subscription plans and pricing information.
 * =================================================
 **/

import React from "react";
import Pricing from "../components/home/Pricing";

const PricingPage: React.FC = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Pricing />


    </div>
  );
};

export default PricingPage;