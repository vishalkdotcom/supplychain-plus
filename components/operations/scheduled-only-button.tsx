import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IconClock } from "@tabler/icons-react";

export function ScheduledOnlyButton() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0}>
          <Button variant="outline" size="sm" disabled>
            <IconClock className="h-3 w-3 mr-1" />
            Scheduled Only
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        Manual runs are disabled. This job runs automatically on schedule.
      </TooltipContent>
    </Tooltip>
  );
}
