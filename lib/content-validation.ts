import { MAX_PPTX_FILE_BYTES } from "@/lib/pptx"

/**
 * Server-side sanity check on content before writing to the DB. Client-side
 * forms already enforce the PPTX size limit before upload, but the API
 * routes re-check since `content` arrives as an arbitrary JSON string.
 * Returns an error message if invalid, or null if OK.
 */
export function validateContentForType(
  type: string | undefined,
  content: string
): string | null {
  if (type === "PPTX") {
    // base64 encodes 3 bytes as 4 chars, so this is an upper-bound estimate
    // of the decoded file size.
    const approxBytes = (content.length * 3) / 4
    if (approxBytes > MAX_PPTX_FILE_BYTES) {
      const limitMb = Math.floor(MAX_PPTX_FILE_BYTES / (1024 * 1024))
      return `PPTX file exceeds the ${limitMb}MB limit`
    }
  }

  return null
}
