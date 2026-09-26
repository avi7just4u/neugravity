"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { AdminHeader } from "@/components/layout/admin-header"

interface AdminShellProps {
  userRole: string
  userEmail: string
  displayName: string
  children: React.ReactNode
}

export function AdminShell({ userRole, userEmail, displayName, children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      <AdminSidebar
        userRole={userRole}
        displayName={displayName}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex flex-col flex-1 min-h-screen overflow-hidden">
        <AdminHeader
          userRole={userRole}
          userEmail={userEmail}
          displayName={displayName}
          onMenuClick={() => setMobileOpen(true)}
          notificationCount={0}
        />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
