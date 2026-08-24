import { describe, expect, it } from "vitest";
import { validateFiles, validateTicketFields } from "../../src/lab2.js";

describe("Lab 2 ticket validation", () => {
  it("trims values and reports field-level boundaries", () => {
    const result = validateTicketFields({
      categoryId: " 1 ",
      relatedSystemId: "2",
      requestedPriority: "medium",
      summary: "  Tiny ",
      description: " short ",
    });

    expect(result.categoryId).toBe(1);
    expect(result.relatedSystemId).toBe(2);
    expect(result.requestedPriority).toBe("MEDIUM");
    expect(result.summary).toBe("Too short");
    expect(result.errors.summary).toContain("5 and 150");
    expect(result.errors.description).toContain("10 and 5000");
  });

  it("accepts valid fields and rejects invalid references and priority", () => {
    const result = validateTicketFields({
      categoryId: "1",
      relatedSystemId: "2",
      requestedPriority: "URGENT",
      summary: "VPN access request",
      description: "Please restore access to the corporate VPN.",
    });

    expect(result.errors.categoryId).toBeUndefined();
    expect(result.errors.relatedSystemId).toBeUndefined();
    expect(result.errors.requestedPriority).toBeDefined();
    expect(result.summary).toBe("VPN access request");
  });

  it("enforces attachment type, size, and active-count limits", () => {
    const valid = {
      filepath: "tmp/file.png",
      originalFilename: "screen.png",
      mimetype: "image/png",
      size: 1024,
    };
    expect(validateFiles([valid] as any)).toBeNull();
    expect(validateFiles([{ ...valid, mimetype: "text/plain" }] as any)?.status).toBe(415);
    expect(validateFiles([{ ...valid, size: 5 * 1024 * 1024 + 1 }] as any)?.status).toBe(413);
    expect(validateFiles([valid] as any, 5)?.code).toBe("PAYLOAD_TOO_LARGE");
  });
});
