const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

// Ensure environment variables are loaded if this file is tested in isolation
dotenv.config();

/**
 * -------------------------------------------------------------------
 * Cloudinary Configuration
 * -------------------------------------------------------------------
 * Cloudinary is used as a dedicated media server and CDN. 
 * Centralizing this configuration ensures that any service or controller 
 * needing to upload, fetch, or delete images uses the exact same, 
 * authenticated SDK instance.
 */

// 1. Validate required environment variables
const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error(
    "FATAL ERROR: Cloudinary configuration is missing. Ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are defined in the .env file."
  );
}

// 2. Configure the Cloudinary SDK
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true, // Enforce HTTPS for all generated URLs and API calls
});

/* ==========================================================================
 * TODO: FUTURE MEDIA INTEGRATIONS
 * ==========================================================================
 * - Folder-based uploads: Map uploads to /quizzes or /profiles based on context.
 * - Automatic image optimization: Set default upload presets for auto-format and auto-quality (f_auto, q_auto).
 * - Image transformations: Implement helper methods to crop/resize thumbnails on the fly.
 * - Delete image support: Implement a service to delete old images using `cloudinary.uploader.destroy(public_id)`.
 * - Video upload support: Expand configurations to support chunked video uploads for video-based quiz questions.
 * ========================================================================== */

module.exports = cloudinary;