import { hmacHex } from "@repo/http";

export async function hashSession(token: string, secret: string): Promise<string> {
  return hmacHex(secret, token);
}
