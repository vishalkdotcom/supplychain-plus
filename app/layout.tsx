import { Suspense } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ViewProvider } from "@/components/view-context";
import { DemoUserProvider } from "@/lib/demo-user-context";
import { AppHeader } from "@/components/app-header";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { DemoModeBanner } from "@/components/demo-mode-banner";
import { isDemoMode } from "@/lib/demo-mode/profile";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WOVO+ Control Center",
  description: "Cross-module intelligence for supply chain management",
};

function AppShell({
  children,
  demoMode,
}: {
  children: React.ReactNode;
  demoMode: boolean;
}) {
  return (
    <DemoUserProvider>
      <ViewProvider>
        <SidebarProvider>
          <Suspense>
            <AppSidebar demoMode={demoMode} />
          </Suspense>
          <div className="flex flex-1 flex-col overflow-hidden">
            <DemoModeBanner />
            <AppHeader />
            <main className="flex-1 overflow-y-auto p-6 md:p-8">
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
          </div>
        </SidebarProvider>
      </ViewProvider>
    </DemoUserProvider>
  );
}

/**
 * Reads request headers to choose login vs app chrome.
 * Must stay inside Suspense when cacheComponents is enabled.
 */
async function PathAwareShell({
  children,
  demoMode,
}: {
  children: React.ReactNode;
  demoMode: boolean;
}) {
  const headersList = await headers();
  const isLoginPage = headersList.get("x-pathname") === "/login";

  if (isLoginPage) {
    return <ErrorBoundary>{children}</ErrorBoundary>;
  }

  return <AppShell demoMode={demoMode}>{children}</AppShell>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const demoMode = isDemoMode();

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NuqsAdapter>
            <QueryProvider>
              <Suspense fallback={null}>
                <PathAwareShell demoMode={demoMode}>{children}</PathAwareShell>
              </Suspense>
            </QueryProvider>
          </NuqsAdapter>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
