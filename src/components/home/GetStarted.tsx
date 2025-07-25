/**
 * =================================================
 * Author: Gale Salazar
 * GitHub: @GaleSSalazar
 * Contributors:
 *
 *
 * License: Apache License 2.0 (see LICENSE file for details)
 * Copyright (c) 2025-Present Archetype Dynamics, Inc.
 * File Description:
 *    Contains the Features component for showcasing product capabilities.
 * =================================================
 **/

// buttons above the footer

import { useAuth } from "@clerk/clerk-react";
import AuthButtons from "../common/AuthButtons";

const GetStarted = () => {
  const { isSignedIn } = useAuth();
  if (isSignedIn) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
      {/* removes the auth buttons from above the footer while logged in */}
      <AuthButtons showAvatar={false} />
    </div>
  );
};
export default GetStarted;
