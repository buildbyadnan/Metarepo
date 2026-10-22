import type { Product } from "@repo/types";

export const PRODUCTS: readonly Product[] = [
  {
    id: "starter",
    name: "SaaS LaunchKit Pro",
    amount: 59,
    currency: "USD",
    price: "$59",
    period: "one-time",
    description: "Production-ready SaaS starter kit",
    features: [
      "Google OAuth with PKCE",
      "Razorpay payment integration",
      "Cloudflare Workers + D1 database",
      "Landing page + dashboard",
      "Type-safe monorepo",
      "CI/CD with GitHub Actions",
    ],
  },
] as const;

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
