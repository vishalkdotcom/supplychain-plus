"use client";

interface ActionItem {
  severity?: "critical" | "warning" | "info";
  label: string;
  description?: string;
  buttonLabel: string;
  buttonEmoji?: string;
  query: string; // query to send to AI when clicked
}

interface ActionCardProps {
  title: string;
  actions: ActionItem[];
  onAction: (query: string) => void;
}

const SEVERITY_STYLES = {
  critical: {
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    dot: "bg-red-500",
    text: "text-red-300",
    button: "bg-red-500 text-white hover:bg-red-600",
  },
  warning: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    dot: "bg-amber-500",
    text: "text-amber-300",
    button: "bg-amber-500 text-black hover:bg-amber-600",
  },
  info: {
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    dot: "bg-indigo-500",
    text: "text-indigo-300",
    button: "bg-indigo-500 text-white hover:bg-indigo-600",
  },
} as const;

export function ActionCard({ title, actions, onAction }: ActionCardProps) {
  return (
    <div className="rounded-xl p-4 bg-card border border-border">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        {title}
      </div>
      <div className="flex flex-col gap-2">
        {actions.map((action, i) => {
          const severity = action.severity || "info";
          const styles = SEVERITY_STYLES[severity];
          return (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 rounded-lg ${styles.bg} border ${styles.border}`}
            >
              <div className={`w-2 h-2 rounded-full ${styles.dot} flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-medium ${styles.text}`}>
                  {action.label}
                </div>
                {action.description && (
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {action.description}
                  </div>
                )}
              </div>
              <button
                onClick={() => onAction(action.query)}
                className={`rounded-lg px-3 py-1.5 text-[10px] font-medium whitespace-nowrap transition-colors cursor-pointer ${styles.button}`}
              >
                {action.buttonEmoji && `${action.buttonEmoji} `}
                {action.buttonLabel}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
