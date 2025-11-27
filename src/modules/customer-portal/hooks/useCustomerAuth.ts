/**
 * Customer Authentication Hook
 * Manages customer session state for the portal
 */

import { useState, useEffect, useCallback } from 'react';
import { customerAuthService } from '../services';
import type { CustomerAuthState, CustomerLookupMethod, CustomerProfile } from '../types';

const initialState: CustomerAuthState = {
  isAuthenticated: false,
  customer: null,
  lookupMethod: null,
  sessionToken: null,
  expiresAt: null,
};

export function useCustomerAuth() {
  const [state, setState] = useState<CustomerAuthState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const storedSession = customerAuthService.getStoredSession();
    if (storedSession) {
      setState({
        isAuthenticated: true,
        customer: storedSession.customer,
        lookupMethod: null,
        sessionToken: storedSession.sessionToken,
        expiresAt: new Date(storedSession.expiresAt),
      });
    }
  }, []);

  // Lookup customer
  const lookup = useCallback(async (method: CustomerLookupMethod, value: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await customerAuthService.lookupCustomer({ method, value });
      
      if (result.success && result.customer) {
        setState({
          isAuthenticated: true,
          customer: result.customer,
          lookupMethod: method,
          sessionToken: result.sessionToken,
          expiresAt: result.expiresAt ? new Date(result.expiresAt) : null,
        });
        return { success: true };
      } else {
        setError(result.error || 'Customer not found');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = 'An error occurred. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    customerAuthService.clearSession();
    setState(initialState);
    setError(null);
  }, []);

  // Extend session
  const extendSession = useCallback(() => {
    customerAuthService.extendSession();
    const storedSession = customerAuthService.getStoredSession();
    if (storedSession) {
      setState((prev) => ({
        ...prev,
        expiresAt: new Date(storedSession.expiresAt),
      }));
    }
  }, []);

  return {
    ...state,
    isLoading,
    error,
    lookup,
    logout,
    extendSession,
    clearError: () => setError(null),
  };
}
