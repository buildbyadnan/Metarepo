export interface RazorpayOrder {
  id: string;
  amount: number;
  amount_due: number;
  amount_paid: number;
  currency: string;
  receipt: string;
  status: "created" | "attempted" | "paid";
  created_at: number;
}

export interface RazorpayPayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  method: string;
  captured: boolean;
  created_at: number;
  error_code?: string;
  error_description?: string;
}

export interface RazorpayWebhookEvent {
  event: string;
  payload: {
    order: { entity: RazorpayOrder };
    payment?: { entity: RazorpayPayment };
  };
}
