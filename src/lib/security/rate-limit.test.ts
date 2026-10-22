import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimit, getClientIp } from "./rate-limit";

describe("Rate Limiter Security Module", () => {
  beforeEach(() => {
    resetRateLimit("test-key");
    resetRateLimit("test-ip");
  });

  it("allows requests below the limit", () => {
    const res1 = checkRateLimit("test-key", 3, 60000);
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = checkRateLimit("test-key", 3, 60000);
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = checkRateLimit("test-key", 3, 60000);
    expect(res3.success).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it("blocks requests that exceed the limit", () => {
    checkRateLimit("test-key", 2, 60000);
    checkRateLimit("test-key", 2, 60000);

    const blocked = checkRateLimit("test-key", 2, 60000);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("resets rate limit correctly", () => {
    checkRateLimit("test-key", 1, 60000);
    expect(checkRateLimit("test-key", 1, 60000).success).toBe(false);

    resetRateLimit("test-key");
    expect(checkRateLimit("test-key", 1, 60000).success).toBe(true);
  });

  it("extracts client IP correctly from headers", () => {
    const mockHeaders = new Headers({
      "x-forwarded-for": "203.0.113.195, 70.41.3.18",
    });
    expect(getClientIp(mockHeaders)).toBe("203.0.113.195");

    const fallbackHeaders = new Headers({
      "x-real-ip": "198.51.100.1",
    });
    expect(getClientIp(fallbackHeaders)).toBe("198.51.100.1");

    const emptyHeaders = new Headers();
    expect(getClientIp(emptyHeaders)).toBe("127.0.0.1");
  });
});
