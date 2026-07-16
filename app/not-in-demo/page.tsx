import Link from "next/link";
import { IconArrowLeft, IconPresentationOff } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotInDemoPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center py-16">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
            <IconPresentationOff className="size-6 text-muted-foreground" />
          </div>
          <CardTitle>Not available in Demo Mode</CardTitle>
          <CardDescription>
            This page depends on source databases that are not part of the
            intelligence-first demo. Explore derived intelligence, remediation,
            and governance surfaces instead.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/">
              <IconArrowLeft className="size-4" />
              Control Center
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/ai">AI Assistant</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
