import { DashboardView } from "@/components/dashboard/dashboard-view";

import { isDemoMode } from "@/lib/demo-mode/profile";

export default function Home() {
  return <DashboardView demoMode={isDemoMode()} />;
}
