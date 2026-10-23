import { describe, it, expect } from "vitest";
import { decideDocumentAccess } from "./access";

const owner = { userId: "owner-1" };
const session = { userId: "recipient-9", email: "bob@example.com" };

const readShare = { recipientEmail: "bob@example.com", permission: "read" };
const writeShare = { recipientEmail: "bob@example.com", permission: "write" };

describe("decideDocumentAccess", () => {
  it("gives the owner full access regardless of shares", () => {
    expect(decideDocumentAccess(owner, { userId: "owner-1", email: "own@x.co" }, null)).toBe(
      "owner",
    );
    expect(decideDocumentAccess(owner, { userId: "owner-1", email: "own@x.co" }, writeShare)).toBe(
      "owner",
    );
  });

  it("resolves read and write shares for the matching email", () => {
    expect(decideDocumentAccess(owner, session, readShare)).toBe("read");
    expect(decideDocumentAccess(owner, session, writeShare)).toBe("write");
  });

  it("matches emails case-insensitively", () => {
    expect(decideDocumentAccess(owner, { ...session, email: "Bob@Example.com" }, readShare)).toBe(
      "read",
    );
    expect(
      decideDocumentAccess(owner, session, { ...readShare, recipientEmail: "BOB@EXAMPLE.COM" }),
    ).toBe("read");
  });

  it("returns null when there is no share", () => {
    expect(decideDocumentAccess(owner, session, null)).toBeNull();
  });

  it("returns null when the share belongs to a different email", () => {
    expect(
      decideDocumentAccess(owner, session, {
        recipientEmail: "someone-else@example.com",
        permission: "write",
      }),
    ).toBeNull();
  });

  it("returns null for an unknown permission value", () => {
    expect(
      decideDocumentAccess(owner, session, {
        recipientEmail: "bob@example.com",
        permission: "admin",
      }),
    ).toBeNull();
  });

  it("returns null for a stranger with no share", () => {
    expect(
      decideDocumentAccess(owner, { userId: "someone-else", email: "attacker@x.co" }, null),
    ).toBeNull();
  });
});
