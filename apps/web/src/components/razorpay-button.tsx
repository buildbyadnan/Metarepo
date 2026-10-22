"use client";

import { useState, useCallback } from "react";
import { API_ENDPOINTS } from "@repo/api-endpoints";
import { useAuth } from "@/contexts/auth-context";
import { apiFetch } from "@/lib/api";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayButtonProps {
  productId: string;
  productName: string;
  amount: number;
  currency?: string;
  customerName?: string;
  customerEmail?: string;
  className?: string;
  children?: React.ReactNode;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

async function loadRazorpayScript(): Promise<void> {
  if (typeof window !== "undefined" && window.Razorpay) return;
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.crossOrigin = "anonymous";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });
}

export function RazorpayButton({
  productId,
  productName,
  amount,
  currency = "INR",
  customerName,
  customerEmail,
  className = "",
  children,
  onSuccess,
  onError,
}: RazorpayButtonProps) {
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();

  const handlePayment = useCallback(async () => {
    if (processing) return;
    setProcessing(true);

    try {
      const res = await apiFetch<{
        success: boolean;
        data?: {
          razorpayOrderId: string;
          keyId: string;
          amount: number;
          currency: string;
        };
        message?: string;
      }>(API_ENDPOINTS.payments.createOrder, {
        method: "POST",
        body: JSON.stringify({
          productId,
          productName,
          amount,
          currency,
          customerName: customerName || user?.name || undefined,
          customerEmail: customerEmail || user?.email || undefined,
        }),
      });

      if (!res.success || !res.data) {
        onError?.(res.message || "Failed to create order");
        return;
      }

      await loadRazorpayScript();

      const options = {
        key: res.data.keyId,
        amount: res.data.amount,
        currency: res.data.currency,
        name: productName,
        order_id: res.data.razorpayOrderId,
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await apiFetch<{
              success: boolean;
              message?: string;
            }>(API_ENDPOINTS.payments.verifyOrder, {
              method: "POST",
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            if (verifyRes.success) {
              onSuccess?.();
            } else {
              onError?.(verifyRes.message || "Payment verification failed");
            }
          } catch {
            onError?.("Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: () => setProcessing(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      onError?.("Something went wrong. Please try again.");
    } finally {
      setProcessing(false);
    }
  }, [
    processing,
    productId,
    productName,
    amount,
    currency,
    customerName,
    customerEmail,
    user,
    onSuccess,
    onError,
  ]);

  return (
    <button onClick={handlePayment} disabled={processing} className={className}>
      {processing ? "Processing..." : children || "Buy Now"}
    </button>
  );
}
