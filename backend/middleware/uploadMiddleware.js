const multer = require("multer");
const path = require("path");

/**
 * Configure Multer Memory Storage.
 * We use memoryStorage because the files will be uploaded directly to Cloudinary
 * via streams. Storing them on the local disk temporarily creates unnecessary I/O 
 * overhead and requires explicit file cleanup.
 */
const storage = multer.memoryStorage();

/**
 * Reusable File Filter
 * Validates the incoming file's MIME type against a strict whitelist.
 * 
 * @param {Object} req - The Express request object.
 * @param {Object} file - The file object provided by Multer.
 * @param {Function} cb - The callback function to signal success or failure.
 */
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    // File type is valid, accept the file
    cb(null, true);
  } else {
    // File type is invalid, reject the file and throw an error
    // This error will be caught by the global errorMiddleware
    cb(
      new Error(
        "Unsupported file type. Only JPEG, JPG, PNG, and WEBP formats are allowed."
      ),
      false
    );
  }
};

/**
 * Initialize Multer with the storage configuration, file filter, and size limits.
 */
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB maximum file size limit
  },
});

/* ==========================================================================
 * TODO: FUTURE SCALABILITY INTEGRATIONS
 * ==========================================================================
 * - Cloudinary Upload Integration: Pipe `req.file.buffer` to Cloudinary in the controller.
 * - Image Compression: Integrate `sharp` to compress memory buffers before Cloudinary upload.
 * - Virus Scanning: Integrate ClamAV stream scanner for uploaded attachments.
 * - Multiple Image Uploads: Use `upload.array("images", maxCount)` for gallery features.
 * - Quiz Attachments: Add a new filter for `application/pdf` if PDF reference materials are needed.
 * - Video Uploads: Increase limits and allow `video/mp4` for video-based quiz questions.
 * ========================================================================== */

/**
 * Middleware for handling single profile image uploads.
 * Expects the form-data field name to be "profileImage".
 */
const uploadProfileImage = upload.single("profileImage");

/**
 * Middleware for handling single quiz thumbnail/image uploads.
 * Expects the form-data field name to be "quizImage".
 */
const uploadQuizImage = upload.single("quizImage");

module.exports = {
  uploadProfileImage,
  uploadQuizImage,
};