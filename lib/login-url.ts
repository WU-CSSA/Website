/**
 * Helpers for sending a user to /login while remembering the page they were on,
 * so GitHub OAuth returns them there instead of the home page.
 */

/** True for same-origin relative paths only ("/foo"), not "//host" or "https://…". */
function isSafeRelativePath(value: string | null | undefined): value is string {
  return !!value && value.startsWith("/") && !value.startsWith("//")
}

/** Build a `/login` href that returns the user to `callbackUrl` after auth. */
export function loginHref(callbackUrl?: string | null): string {
  return isSafeRelativePath(callbackUrl)
    ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/login"
}

/** Sanitize a callbackUrl value into a safe relative path, falling back to "/". */
export function safeCallbackUrl(value?: string | null): string {
  return isSafeRelativePath(value) ? value : "/"
}
