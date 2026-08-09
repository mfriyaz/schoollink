const multer = require("multer");

/**
 * Uses memory storage (buffers, not disk) rather than
 * multer's diskStorage. The actual destination - local disk
 * or S3 - is decided in upload.controller.js based on whether
 * AWS credentials are configured, so the file needs to be
 * available as a buffer either way rather than already written
 * to a specific disk path.
 */

const allowedMimeTypes = [

    "application/pdf",

    "image/jpeg",

    "image/png",

    "image/webp",

    "audio/webm",

    "audio/mp4",

    "audio/mpeg",

    "audio/ogg",

    "audio/wav"

];

function fileFilter(req, file, cb) {

    if (allowedMimeTypes.includes(file.mimetype)) {

        cb(null, true);

    } else {

        cb(new Error("Only PDF, image (jpg, png, webp), and audio files are allowed"));

    }

}

const upload = multer({

    storage: multer.memoryStorage(),

    fileFilter,

    limits: {

        fileSize: 10 * 1024 * 1024 // 10MB

    }

});

module.exports = upload;
