const sharp = require("sharp");

const response = require("../utils/response");

const fileStorageService = require("../services/fileStorage.service");

const IMAGE_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

/**
 * Upload a Post Attachment
 * Expects a single file under the field name "attachment".
 * Returns the URL to store on the homework/announcement record.
 *
 * Images are compressed server-side before being kept - resized
 * to a max width of 1200px and re-encoded as JPEG at quality 70.
 * A phone camera photo of a homework page is typically 3-5MB
 * uncompressed; this brings it down to well under 200KB with no
 * meaningful loss in readability, which matters a lot at scale
 * (every student's homework photo, every week, adds up in
 * storage cost otherwise). PDFs and audio pass through untouched.
 *
 * Saves via fileStorage.service.js, which transparently uses S3
 * when configured, or local disk otherwise - this controller
 * doesn't need to know which.
 */
async function uploadAttachment(req, res) {

    try {

        if (!req.file) {

            return response.error(
                res,
                "No file was uploaded",
                400
            );

        }

        let buffer = req.file.buffer;

        let mimetype = req.file.mimetype;

        let finalSize = req.file.size;

        let extensionOverride = null;

        if (IMAGE_MIME_TYPES.includes(req.file.mimetype)) {

            buffer = await sharp(req.file.buffer)
                .resize({ width: 1200, withoutEnlargement: true })
                .jpeg({ quality: 70 })
                .toBuffer();

            mimetype = "image/jpeg";

            extensionOverride = ".jpg";

            finalSize = buffer.length;

        }

        const { url } = await fileStorageService.saveFile(

            buffer,

            req.file.originalname,

            mimetype,

            extensionOverride

        );

        return response.success(
            res,
            {

                url,

                original_name: req.file.originalname,

                size: finalSize

            },
            "File uploaded successfully",
            201
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            500
        );

    }

}

module.exports = {

    uploadAttachment

};
