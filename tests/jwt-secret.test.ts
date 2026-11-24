import { describe, expect, it } from "vitest";
import { assertJwtSecret, cookieSecure } from "@/lib/tokens";

describe("JWT secret", () => {
  it("fails clearly in production when the secret is missing", () => {
    expect(() => assertJwtSecret({ NODE_ENV: "production", JWT_SECRET: "" })).toThrow(
      /JWT_SECRET is missing/,
    );
    expect(() => assertJwtSecret({ NODE_ENV: "production" })).toThrow(/JWT_SECRET is missing/);
  });

  it("fails clearly in production when the secret is shorter than 32 characters", () => {
    expect(() =>
      assertJwtSecret({ NODE_ENV: "production", JWT_SECRET: "short-but-present-secret" }),
    ).toThrow(/at least 32 characters/);
  });

  it("accepts a long production secret and a shorter development secret", () => {
    const production = "x".repeat(32);
    expect(assertJwtSecret({ NODE_ENV: "production", JWT_SECRET: production })).toBe(production);
    expect(assertJwtSecret({ NODE_ENV: "development", JWT_SECRET: "x".repeat(16) })).toHaveLength(16);
    expect(() => assertJwtSecret({ NODE_ENV: "development", JWT_SECRET: "short" })).toThrow(
      /at least 16 characters/,
    );
  });
});

describe("auth cookies", () => {
  it("marks cookies Secure in production and on https app URLs", () => {
    expect(cookieSecure({ NODE_ENV: "production", NEXT_PUBLIC_APP_URL: "https://beacon.example" })).toBe(
      true,
    );
    expect(cookieSecure({ NODE_ENV: "development", NEXT_PUBLIC_APP_URL: "https://preview.example" })).toBe(
      true,
    );
    expect(cookieSecure({ NODE_ENV: "development", NEXT_PUBLIC_APP_URL: "http://localhost:3000" })).toBe(
      false,
    );
  });
});
