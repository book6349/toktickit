import { describe, expect, it } from "vitest";
import { hashPassword, normalizeEmail, validatePassword, verifyPassword } from "../../src/auth.js";

describe("Lab 3 authentication primitives", () => {
  it("normalizes email consistently", () => {
    expect(normalizeEmail("  Ariya.Somchai@Example.COM  ")).toBe("ariya.somchai@example.com");
  });

  it("enforces the documented password boundaries and composition", () => {
    expect(validatePassword("Abcdefghij12")).toBeNull();
    expect(validatePassword("Short1")).toMatch(/between 12 and 128/);
    expect(validatePassword("A".repeat(129) + "1")).toMatch(/between 12 and 128/);
    expect(validatePassword("            ")).toBe("Password cannot be whitespace only.");
    expect(validatePassword("abcdefghijkl")).toBe("Password must contain at least one letter and one number.");
    expect(validatePassword("123456789012")).toBe("Password must contain at least one letter and one number.");
  });

  it("stores a salted scrypt digest rather than the supplied password", () => {
    const password = "Lab3-unit-password-2026";
    const first = hashPassword(password);
    const second = hashPassword(password);

    expect(first).toMatch(/^scrypt\$[0-9a-f]+\$[0-9a-f]+$/);
    expect(first).not.toContain(password);
    expect(second).not.toBe(first);
  });

  it("verifies the correct password and rejects wrong or malformed digests", () => {
    const digest = hashPassword("Lab3-unit-password-2026");
    expect(verifyPassword("Lab3-unit-password-2026", digest)).toBe(true);
    expect(verifyPassword("incorrect-password", digest)).toBe(false);
    expect(verifyPassword("anything", "plain-text-password")).toBe(false);
  });
});
