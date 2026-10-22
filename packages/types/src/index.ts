export interface User {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  amount: number;
  currency: string;
  price: string;
  period: string;
  description: string;
  features: readonly string[];
}

export type { RazorpayOrder, RazorpayPayment, RazorpayWebhookEvent } from "./razorpay.js";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "expired" | "cancelled";
