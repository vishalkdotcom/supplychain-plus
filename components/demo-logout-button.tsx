"use client";

import { useRouter } from "next/navigation";
import { IconLogout } from "@tabler/icons-react";
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";

export function DemoLogoutButton() {
  const router = useRouter();
  const { open } = useSidebar();

  async function handleLogout() {
    await fetch("/api/demo-auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <SidebarMenuButton onClick={handleLogout} tooltip="Sign out">
      <IconLogout className="h-4 w-4" />
      {open ? <span>Sign out</span> : null}
    </SidebarMenuButton>
  );
}
