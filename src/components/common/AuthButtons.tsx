/**
 * =================================================
 * Author: Gale Salazar
 * GitHub: @GaleSSalazar
 * Contributors:
 *      @SchoolyB
 *
 *
 * License: Apache License 2.0 (see LICENSE file for details)
 * Copyright (c) 2025-Present Archetype Dynamics, Inc.
 * File Description:
 *    Contains the AuthButtons component that handles user authentication state and backend connection status.
 * =================================================
 **/

import React, { useEffect, useState } from "react";
import {
  LoginLink,
  RegisterLink,
  LogoutLink,
} from "@kinde-oss/kinde-auth-react/components";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import UserProfile from "./UserProfile";
import { API_BASE_URL } from "../../config/api";

interface AuthButtonsProps {
  showAvatar?: boolean;
  showButton?: boolean;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ 
  showAvatar = true, 
  showButton = true 
}) => {
  const { 
    isAuthenticated, 
    isLoading, 
    getToken, 
    user 
  } = useKindeAuth();
  
  const [backendStatus, setBackendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  //Ensure stable backend connection using JWT
  const testBackendConnection = async () => {
    if (!isAuthenticated || !user) {
      return;
    }

    setBackendStatus('loading');
    
    try {
      // Get the JWT token from Kinde
      const token = await getToken();
      
      if (!token) {
        throw new Error('Authentication token not available');
      }
      
      //This should be fine here since once authenticated, the user will be redirected to their Project Dashboard page, if not then will re-work this
      const response = await fetch(`${API_BASE_URL}/api/v1/projects`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Backend connection failed ${response.status}`);
      }

      setBackendStatus('success');
      setErrorMessage('');

    } catch (error) {
      setBackendStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Connection failed');
    }
  };


  //Connect to backend when user becomes authenticated. 1 second delay to avoid overwhelming the backend
  useEffect(() => {
    if (isAuthenticated && !isLoading && user) {
      
      const timer = setTimeout(() => {
        testBackendConnection();
      }, 1000);
      return () => clearTimeout(timer); // Cleanup the timer on unmount or re-render
    }
  }, [isAuthenticated, isLoading, user]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-pulse">
          <div className="h-8 w-16 bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  //Used to provide a tooltip for the backend status indicator when user is authenticated and hovers over the status indicator
  const getStatusTooltip = () => {
    switch (backendStatus) {
      case 'success':
        return 'Connected to backend';
      case 'error':
        return `Backend connection failed${errorMessage ? `: ${errorMessage}` : ''}`;
      case 'loading':
        return 'Connecting to backend...';
      default:
        return 'Backend status unknown';
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {isAuthenticated ? (
        <>
          {/* Backend Status Indicator Only shows when user is authenticated */} 
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              backendStatus === 'loading' ? 'bg-yellow-500 animate-pulse' :
              backendStatus === 'success' ? 'bg-green-500' :
              backendStatus === 'error' ? 'bg-red-500' :
              'bg-gray-500'
              }`}
              title={getStatusTooltip()}
              aria-label="Backend Connection Status"
              />
          </div>       
          
          <LogoutLink className="btn btn-outline text-sm">
            Logout
          </LogoutLink>
          
          {showAvatar && showButton && <UserProfile />}
        </>
      ) : (
        <>
          {/* AUTH kinde hosted login component */}
          <LoginLink className="btn btn-outline text-sm" type="button">
            Sign In
          </LoginLink>

          {/* AUTH kinde hosted register component */}
          <RegisterLink className="btn btn-primary text-sm" type="button">
            Start Free
          </RegisterLink>
        </>
      )}
    </div>
  );
};

export default AuthButtons;