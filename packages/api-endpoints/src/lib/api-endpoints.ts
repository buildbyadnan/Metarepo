export const API_ENDPOINTS = {
  // Auth Endpoints
  auth: {
    google: "/auth/google",
    googleCallback: "/auth/google/callback",
    me: "/auth/me",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
  },

  // Documents (personal cloud)
  documents: {
    root: "/documents",
    content: (id: string) => `/documents/${id}/content`,
    detail: (id: string) => `/documents/${id}`,
  },

  // Health
  health: "/health",
};
