import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const AUTH_STORAGE_KEY = 'auction_auth';
const API_BASE_URL = 'http://localhost:8080';

const AuthContext = createContext(null);

const readAuthFromStorage = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const parseJwtPayload = (token) => {
  try {
    const payloadPart = token.split('.')[1];
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  const payload = parseJwtPayload(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(readAuthFromStorage);

  const saveAuth = useCallback((authPayload) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authPayload));
    setAuth(authPayload);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth(null);
  }, []);

  const refreshSession = useCallback(async () => {
    if (!auth?.refreshToken) {
      clearAuth();
      return null;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: auth.refreshToken })
      });
      if (!response.ok) {
        clearAuth();
        return null;
      }
      const updatedAuth = await response.json();
      saveAuth(updatedAuth);
      return updatedAuth;
    } catch {
      clearAuth();
      return null;
    }
  }, [auth?.refreshToken, clearAuth, saveAuth]);

  const getAuthorizedHeaders = useCallback(async () => {
    let current = auth;
    if (!current?.token) return {};
    if (isTokenExpired(current.token)) {
      current = await refreshSession();
    }
    return current?.token ? { Authorization: `Bearer ${current.token}` } : {};
  }, [auth, refreshSession]);

  const logoutSession = useCallback(async () => {
    if (auth?.refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: auth.refreshToken })
        });
      } catch {
        // best effort logout request
      }
    }
    clearAuth();
  }, [auth?.refreshToken, clearAuth]);

  const value = useMemo(() => ({
    auth,
    saveAuth,
    clearAuth,
    logoutSession,
    getAuthorizedHeaders,
    isAuthenticated: Boolean(auth?.token),
    hasRole: (roles = []) => Boolean(auth?.role && roles.includes(auth.role)),
  }), [auth, saveAuth, clearAuth, logoutSession, getAuthorizedHeaders]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

// Keep backward-compatible exports for components that haven't migrated yet
export { API_BASE_URL, AUTH_STORAGE_KEY };
export const getAuth = readAuthFromStorage;
export const authHeader = () => {
  const token = readAuthFromStorage()?.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};
