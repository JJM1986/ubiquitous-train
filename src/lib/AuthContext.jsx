import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Beim Umstieg auf das eigene Backend entfallen die App-Einstellungen,
  // die frueher vom Anbieter geladen wurden. Die Felder bleiben erhalten,
  // damit bestehende Komponenten unveraendert weiterlaufen.
  const isLoadingPublicSettings = false;
  const appPublicSettings = null;

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(Boolean(currentUser));
      setAuthError(currentUser ? null : { type: 'auth_required', message: 'Anmeldung erforderlich' });
    } catch (error) {
      console.error('[Auth] Pruefung fehlgeschlagen:', error);
      setUser(null);
      setIsAuthenticated(false);
      setAuthError({ type: 'auth_required', message: 'Anmeldung erforderlich' });
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    checkUserAuth();

    // Auf An- und Abmeldung reagieren (auch in anderen Browser-Tabs).
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
        setAuthChecked(true);
        setIsLoadingAuth(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkUserAuth();
      }
    });

    return () => listener?.subscription?.unsubscribe();
  }, [checkUserAuth]);

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    base44.auth.logout(shouldRedirect ? '/' : '/');
  };

  const navigateToLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  // Frueher wurde hier der Zustand der Anbieter-App geprueft.
  const checkAppState = checkUserAuth;

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
