import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DemoLoginForm } from "@/components/demo-login-form";
import { isAuthRequired } from "@/lib/demo-mode/profile";
import { sanitizeLoginRedirect } from "@/lib/demo-mode/redirect";
import {
  DEMO_SESSION_COOKIE_NAME,
  isDemoSessionOperational,
  verifySession,
} from "@/lib/demo-mode/session";

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
    redirect(sanitizeLoginRedirect(params.redirect));
  }

  if (!isDemoSessionOperational()) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background p-6">
        <p className="max-w-md text-center text-sm text-muted-foreground">
          Demo sessions are unavailable because{" "}
          <code className="text-foreground">DEMO_SESSION_SECRET</code> is missing
          or too weak for this deploy. Configure a strong secret before signing
          in.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6">
      <Suspense fallback={null}>
        <DemoLoginForm />
      </Suspense>
    </div>
  );
}
