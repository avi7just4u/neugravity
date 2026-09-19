import { describe, it, expect } from "vitest"

describe("NotificationService contract", () => {
  it("exports required methods", async () => {
    const { NotificationService } = await import("@/lib/services/notification.service")
    expect(typeof NotificationService.evaluate).toBe("function")
    expect(typeof NotificationService.createNotification).toBe("function")
    expect(typeof NotificationService.getPending).toBe("function")
    expect(typeof NotificationService.getActiveRules).toBe("function")
    expect(typeof NotificationService.markSent).toBe("function")
    expect(typeof NotificationService.markFailed).toBe("function")
    expect(typeof NotificationService.getHistory).toBe("function")
  })
})
