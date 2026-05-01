import { describe, expect, it, vi, beforeEach } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  getPageViewStats: vi.fn(),
  recordPageView: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { appRouter } from "./routers";

function createPublicContext(userAgent = "Vitest Browser"): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: { "user-agent": userAgent },
      get: vi.fn((name: string) => (name.toLowerCase() === "user-agent" ? userAgent : undefined)),
    } as unknown as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("analytics router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows public users to read total website views", async () => {
    dbMocks.getPageViewStats.mockResolvedValue({ totalViews: 128 });

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.analytics.stats();

    expect(result.totalViews).toBe(128);
    expect(dbMocks.getPageViewStats).toHaveBeenCalledTimes(1);
  });

  it("records a public page view with path and user agent", async () => {
    dbMocks.recordPageView.mockResolvedValue({ success: true, totalViews: 129 });

    const caller = appRouter.createCaller(createPublicContext("Mozilla/5.0 Nihongo Test"));
    const result = await caller.analytics.recordPageView({ path: "/" });

    expect(result).toEqual({ success: true, totalViews: 129 });
    expect(dbMocks.recordPageView).toHaveBeenCalledWith({
      path: "/",
      userAgent: "Mozilla/5.0 Nihongo Test",
    });
  });
});
