export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startQueuePoller } = await import("./lib/jobs/queue-engine");
    startQueuePoller();
  }
}
