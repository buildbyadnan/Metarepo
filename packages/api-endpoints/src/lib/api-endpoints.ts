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
    shared: "/documents/shared",
    shares: (id: string) => `/documents/${id}/shares`,
    share: (id: string, shareId: string) => `/documents/${id}/shares/${shareId}`,
  },

  // Categories (user-defined document categories)
  categories: {
    root: "/categories",
    detail: (id: string) => `/categories/${id}`,
  },

  // Health
  health: "/health",
};
