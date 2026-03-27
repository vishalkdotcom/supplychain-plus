import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
              <DemoUserProvider>
              <ViewProvider>
                <SidebarProvider>
                  <AppSidebar />
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <AppHeader />
                    <main className="flex-1 overflow-y-auto p-6 md:p-8">
                      <ErrorBoundary>{children}</ErrorBoundary>
                    </main>
                  </div>
                </SidebarProvider>
              </ViewProvider>
              </DemoUserProvider>
            </QueryProvider>
          </NuqsAdapter>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
