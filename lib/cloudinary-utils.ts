/**
 * Utility functions for Cloudinary (no server-only requirement)
 */

/**
 * Extract public_id from Cloudinary URL
 */
export function extractPublicId(url: string): string | null {
  try {
    // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
    // Version is optional: /upload/{version}/ or /upload/
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.(jpg|jpeg|png|gif|webp|avif)$/i);
    if (match && match[1]) {
      // Return full public_id including folder path
      return match[1];
    }
    return null;
  } catch {
    return null;
  }
}

