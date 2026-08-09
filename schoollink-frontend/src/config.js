/**
 * Central place for URLs that differ between local development
 * and a real deployment.
 *
 * Locally, these fall back to localhost automatically - nothing
 * needs to change to keep developing as before.
 *
 * Once deployed, set these in your hosting platform's
 * environment variables (not in this file, and not committed to
 * git):
 *
 *   VITE_API_BASE_URL=https://your-backend-domain.com/api
 *   VITE_FILE_BASE_URL=https://your-backend-domain.com
 *
 * Vite only exposes env vars prefixed with VITE_ to the browser
 * bundle - this is a Vite requirement, not a choice made here.
 */

export const API_BASE_URL =

    import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

export const FILE_BASE_URL =

    import.meta.env.VITE_FILE_BASE_URL || "http://localhost:3001";

/**
 * Resolves a file URL for display. If the stored value is
 * already a full URL (e.g. an S3 URL like
 * "https://bucket.s3.region.amazonaws.com/x.jpg"), it's used
 * as-is. If it's a relative path (e.g. "/uploads/x.jpg", from
 * local disk storage), FILE_BASE_URL is prepended. This lets
 * the backend switch between local disk and S3 storage without
 * any frontend changes.
 */
export function resolveFileUrl(url) {

    if (!url) {

        return url;

    }

    if (url.startsWith("http://") || url.startsWith("https://")) {

        return url;

    }

    return `${FILE_BASE_URL}${url}`;

}
