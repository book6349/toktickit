import { describe, expect, it } from "vitest";
import { dateStamp } from "../../src/lab2.js";

describe("Lab 2 ticket number date component", () => {
  it("formats the official YYYYMMDD date segment", () => {
    expect(dateStamp(new Date(2026, 7, 24))).toBe("20260824");
  });
});
