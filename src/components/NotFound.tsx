/**
 * =================================================
 * Author: Marshall A Burns
 * GitHub: @SchoolyB
 * Contributors:
 *           
 * License: Apache License 2.0 (see LICENSE file for details)
 * Copyright (c) 2025-Present Archetype Dynamics, Inc.
 * File Description:
 *    Contains the Hero component with fade up + scale animation.
 * =================================================
 **/

import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/">Go back to home</Link>
    </div>
  );
};

export default NotFound;