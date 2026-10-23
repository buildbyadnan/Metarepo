/**
 * Minimal email validation shared by the auth callback and the sharing API.
 * Deliberately permissive (format-only): deliverability is never checked,
 * and a share simply stays dormant until that address signs in.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 320;
}
