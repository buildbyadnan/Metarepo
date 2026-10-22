import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const orders = sqliteTable(
  "orders",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    productId: text("product_id").notNull(),
    productName: text("product_name").notNull(),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull().default("INR"),
    customerName: text("customer_name"),
    customerEmail: text("customer_email"),
    razorpayOrderId: text("razorpay_order_id").unique(),
    razorpayPaymentId: text("razorpay_payment_id").unique(),
    razorpaySignature: text("razorpay_signature"),
    status: text("status").notNull().default("pending"),
    failureReason: text("failure_reason"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
    paidAt: text("paid_at"),
  },
  (t) => [
    index("orders_user_id_idx").on(t.userId),
    index("orders_status_idx").on(t.status),
    index("orders_created_at_idx").on(t.createdAt),
  ],
);
