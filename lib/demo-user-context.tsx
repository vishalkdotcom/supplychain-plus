"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { DemoUser } from "@/types";

interface DemoUserContextValue {
  currentUser: DemoUser | null;
  setCurrentUser: (user: DemoUser) => void;
  users: DemoUser[];
}

const DemoUserContext = createContext<DemoUserContextValue>({
  currentUser: null,
  setCurrentUser: () => {},
  users: [],
});

export function useDemoUser() {
  return useContext(DemoUserContext);
}

export function DemoUserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<DemoUser[]>([]);
  const [currentUser, setCurrentUserState] = useState<DemoUser | null>(null);

  // Load users from API on mount
  useEffect(() => {
    fetch("/api/demo-users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data);
        // Restore from localStorage
        const savedId = localStorage.getItem("wovo-demo-user-id");
        const saved = data.find((u: DemoUser) => u.id === savedId);
        if (saved) setCurrentUserState(saved);
        else if (data.length > 0) {
          setCurrentUserState(data[0]);
          localStorage.setItem("wovo-demo-user-id", data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  function setCurrentUser(user: DemoUser) {
    setCurrentUserState(user);
    localStorage.setItem("wovo-demo-user-id", user.id);
  }

  return (
    <DemoUserContext.Provider value={{ currentUser, setCurrentUser, users }}>
      {children}
    </DemoUserContext.Provider>
  );
}
