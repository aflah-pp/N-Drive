import { create } from "zustand";

const useAuthStore = create((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  setAccessToken: (accessToken) =>
    set({
      accessToken,
      isAuthenticated: Boolean(accessToken),
    }),
  setUser: (user) =>
    set({
      user,
    }),
  setAuth: (accessToken, user) =>
    set({
      accessToken,
      user,
      isAuthenticated: Boolean(accessToken),
    }),
  clearAuth: () =>
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
    }),
}));

export default useAuthStore;
