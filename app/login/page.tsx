import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DemoLoginForm } from "@/components/demo-login-form";
import { isAuthRequired } from "@/lib/demo-mode/profile";
import {
  DEMO_SESSION_COOKIE_NAME,
  verifySession,
} from "@/lib/demo-mode/session";

function safeRedirectPath(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  if (!isAuthRequired()) {
    redirect("/");
  }

  const params = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get(DEMO_SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;

  if (session) {
    redirect(safeRedirectPath(params.redirect));
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6">
      <Suspense fallback={null}>
        <DemoLoginForm />
      </Suspense>
    </div>
  );
}
