import { describe, it, expect } from "vitest"

describe("JobService contract", () => {
  it("exports required methods", async () => {
    const { JobService } = await import("@/lib/services/job.service")
    expect(typeof JobService.enqueue).toBe("function")
    expect(typeof JobService.claimNext).toBe("function")
    expect(typeof JobService.complete).toBe("function")
    expect(typeof JobService.fail).toBe("function")
    expect(typeof JobService.retry).toBe("function")
    expect(typeof JobService.cancel).toBe("function")
    expect(typeof JobService.getJobs).toBe("function")
    expect(typeof JobService.getQueueStats).toBe("function")
  })
})
