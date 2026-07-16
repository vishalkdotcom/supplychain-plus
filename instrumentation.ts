export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { areJobsExecutable } = await import("./lib/demo-mode/profile");
    if (!areJobsExecutable()) return;

    const { startQueuePoller } = await import("./lib/jobs/queue-engine");
    startQueuePoller();
  }
}
