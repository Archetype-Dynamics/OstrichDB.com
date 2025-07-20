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

import { useUser } from "@clerk/clerk-react";

const UserProfile = () => {
  const { user, isSignedIn } = useUser();

  if (!isSignedIn || !user) {
    return null;
  }

  const initials = () => {
    if (user.emailAddresses?.[0]?.emailAddress) {
      return user.emailAddresses[0].emailAddress.slice(0, 2).toUpperCase();
    }

    const firstNameInitial = user.firstName
      ? user.firstName.charAt(0).toUpperCase()
      : "";
    const lastNameInitial = user.lastName
      ? user.lastName.charAt(0).toUpperCase()
      : "";
    return firstNameInitial + lastNameInitial || "NA";
  };

  return (
    <>
      {user.imageUrl ? (
        <img
          src={user.imageUrl}
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
