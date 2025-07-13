/**
 * =================================================
 * Author: Gale Salazar
 * GitHub: @GaleSSalazar
 * Contributors:
 *
 *
 *
 * License: Apache License 2.0 (see LICENSE file for details)
 * Copyright (c) 2025-Present Archetype Dynamics, Inc.
 * File Description:
 *    Main application component that assembles the page layout.
 * =================================================
 **/

import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

const UserProfile = () => {
  const { user, isAuthenticated } = useKindeAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  const initials = () => {
    if (user.email) {
      return user.email.slice(0, 2).toUpperCase();
    }

    const firstNameInitial = user.givenName
      ? user.givenName.charAt(0).toUpperCase()
      : "";
    const lastNameInitial = user.familyName
      ? user.familyName.charAt(0).toUpperCase()
      : "";
    return firstNameInitial + lastNameInitial || "NA";
  };

  return (
    <>
      {user.picture ? (
        <img
          src={user.picture}
          alt="User profile"
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-gray-200 text-sb-amber outline flex items-center justify-center">
          {initials()}
        </div>
      )}
    </>
  );
};

export default UserProfile;
