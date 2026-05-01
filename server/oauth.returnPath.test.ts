import { describe, expect, it } from "vitest";
import { getSafeReturnPath } from "./_core/oauth";

function encodeState(value: unknown) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64");
}

describe("OAuth return path handling", () => {
  it("allows the hidden admin route as a post-login return path", () => {
    const state = encodeState({
      redirectUri: "https://example.test/api/oauth/callback",
      returnPath: "/admin",
    });

    expect(getSafeReturnPath(state)).toBe("/admin");
  });

  it("falls back to home for external, protocol-relative, malformed, or missing paths", () => {
    expect(getSafeReturnPath(encodeState({ returnPath: "https://evil.example/admin" }))).toBe("/");
    expect(getSafeReturnPath(encodeState({ returnPath: "//evil.example/admin" }))).toBe("/");
    expect(getSafeReturnPath(encodeState({ redirectUri: "https://example.test/api/oauth/callback" }))).toBe("/");
    expect(getSafeReturnPath("not-base64-json")).toBe("/");
  });
});
