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
*    Contains TypeScript interface definitions used throughout the application.
* =================================================
**/

export interface Product {
  id: string;
  name: string;
  description: string;
  icon: string;
}


export interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

export interface NavLink {
  label: string;
  href: string;
  isDropdown?: boolean;
  dropdownItems?: {
    label: string;
    href: string;
    description?: string;
  }[];
}