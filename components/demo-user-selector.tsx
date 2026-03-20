"use client";

import { useDemoUser } from "@/lib/demo-user-context";
import { IconUser, IconChevronDown } from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";

export function DemoUserSelector() {
  const { currentUser, setCurrentUser, users } = useDemoUser();
  const { open } = useSidebar();

  if (users.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          className="w-full"
          tooltip={currentUser ? `${currentUser.name} (${currentUser.role})` : "Select user"}
        >
          {currentUser ? (
            <>
              <span
                className="inline-block h-4 w-4 shrink-0 rounded-full"
                style={{ backgroundColor: currentUser.avatarColor }}
              />
              {open && (
                <>
                  <span className="truncate">{currentUser.name}</span>
                  <IconChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                </>
              )}
            </>
          ) : (
            <>
              <IconUser className="h-4 w-4" />
              {open && <span>Select user</span>}
            </>
          )}
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56">
        {users.map((user) => (
          <DropdownMenuItem
            key={user.id}
            onClick={() => setCurrentUser(user)}
            className="flex items-center gap-2"
          >
            <span
              className="inline-block h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: user.avatarColor }}
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.role}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
