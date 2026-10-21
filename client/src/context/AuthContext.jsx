import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { authKeys, storageKeys } from '@/lib/query-keys';
import { loginUser, logoutUser, refreshUserToken } from '@/service/endpoints/auth';
import { getAvailableStorage, getStorageUsage } from '@/service/endpoints/package';
import { getCurrentUser } from '@/service/endpoints/user';
import useAuthStore from '../service/store/authStore';

const AuthContext = createContext(null);

async function primeStorageCache(queryClient) {
  const [usage, all] = await Promise.all([getStorageUsage(), getAvailableStorage()]);
  queryClient.setQueryData(storageKeys.usage(), usage);
  queryClient.setQueryData(storageKeys.files(), all);
  return { usage, all };
}

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const { accessToken, user, isAuthenticated, setAccessToken, setUser, clearAuth } = useAuthStore();
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const bootstrapAuth = useCallback(async () => {
    try {
      const data = await refreshUserToken();
      if (!data?.access) throw new Error('Refresh response did not contain an access token.');

      setAccessToken(data.access);

      const currentUser = await getCurrentUser();
      setUser(currentUser);
      queryClient.setQueryData(authKeys.me(), currentUser);

      try {
        await primeStorageCache(queryClient);
      } catch {
        /* storage failure is non-fatal */
      }
    } catch {
      clearAuth();
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.removeQueries({ queryKey: storageKeys.all });
    } finally {
      setIsBootstrapping(false);
    }
  }, [clearAuth, queryClient, setAccessToken, setUser]);

  useEffect(() => {
    bootstrapAuth();
  }, [bootstrapAuth]);

  const login = useCallback(
    async (credentials) => {
      const data = await loginUser(credentials);
      if (!data?.access) throw new Error('Login response did not contain an access token.');

      setAccessToken(data.access);

      const currentUser = await getCurrentUser();
      setUser(currentUser);
      queryClient.setQueryData(authKeys.me(), currentUser);

      try {
        await primeStorageCache(queryClient);
      } catch {
        /* storage failure is non-fatal */
      }

      return currentUser;
    },
    [queryClient, setAccessToken, setUser],
  );

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      clearAuth();
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.removeQueries({ queryKey: storageKeys.all });
    }
  }, [clearAuth, queryClient]);

  const refreshUser = useCallback(async () => {
    const fresh = await getCurrentUser();
    const normalized = fresh?.user ?? fresh;
    setUser(normalized);
    queryClient.setQueryData(['auth', 'me'], normalized);
    return normalized;
  }, [queryClient, setUser]);

  const value = useMemo(
    () => ({
      accessToken,
      user,
      isAuthenticated,
      isBootstrapping,
      isLoading: isBootstrapping,
      login,
      logout,
      refreshUser,
    }),
    [accessToken, user, isAuthenticated, isBootstrapping, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider.');
  return ctx;
}
