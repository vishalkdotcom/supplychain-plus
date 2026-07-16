export function sanitizeLoginRedirect(
  value: string | null | undefined,
): string {
  if (!value) return "/";

  let candidate = value.trim();
  try {
    candidate = decodeURIComponent(candidate);
  } catch {
    return "/";
  }

  if (!candidate.startsWith("/") || candidate.startsWith("//")) {
    return "/";
  }

  if (candidate.includes("://") || candidate.startsWith("/\\")) {
    return "/";
  }

  return candidate;
}
