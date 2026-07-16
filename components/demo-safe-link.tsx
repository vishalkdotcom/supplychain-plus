"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { evaluateDemoRoutePolicy } from "@/lib/demo-mode/profile";

type DemoSafeLinkProps = {
  href: string;
  demoMode: boolean;
  children: ReactNode;
  className?: string;
};

export function DemoSafeLink({
  href,
  demoMode,
  children,
  className,
}: DemoSafeLinkProps) {
  const allowed = !demoMode || evaluateDemoRoutePolicy(href);

  if (!allowed) {
    return <div className={className}>{children}</div>;
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
