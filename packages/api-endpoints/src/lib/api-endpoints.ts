export const API_ENDPOINTS = {
  // Auth Endpoints
  auth: {
    google: "/auth/google",
    googleCallback: "/auth/google/callback",
    me: "/auth/me",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
  },

  // Health
  health: "/health",

  // Payment Endpoints
  payments: {
    createOrder: "/payments/create-order",
    verifyOrder: "/payments/verify-order",
    webhook: "/payments/webhook",
  },
};
