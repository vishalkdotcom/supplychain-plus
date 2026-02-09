import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ViewProvider } from "@/components/view-context";
import { AppHeader } from "@/components/app-header";

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
  title: "WOVO AI Control Center",
  description: "Cross-module intelligence for supply chain management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <ViewProvider>
            <SidebarProvider>
              <AppSidebar />
              <div className="flex flex-1 flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                  {children}
                </main>
              </div>
            </SidebarProvider>
          </ViewProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
