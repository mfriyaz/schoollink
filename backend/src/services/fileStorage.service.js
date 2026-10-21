const fs = require("fs");

const path = require("path");

const crypto = require("crypto");

const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;

const AWS_REGION = process.env.AWS_REGION;

const isS3Configured = Boolean(AWS_S3_BUCKET && AWS_REGION);

// When running on EC2 with an IAM Role attached, the SDK finds
// credentials automatically - no AWS_ACCESS_KEY_ID/SECRET needed
// in that case. Locally (or anywhere off EC2), set those two
// env vars and the SDK picks them up the same way, with no code
// difference between the two situations.
const s3Client = isS3Configured

    ? new S3Client({ region: AWS_REGION })

    : null;

const uploadDir = path.join(__dirname, "..", "..", "uploads");

if (!fs.existsSync(uploadDir)) {

    fs.mkdirSync(uploadDir, { recursive: true });

}

/**
 * Builds a safe, collision-resistant filename from the
 * original upload name.
 */
function buildSafeFilename(originalName, extensionOverride) {

    const safeName = originalName.replace(/[^a-zA-Z0-9.\-]/g, "_");

    const base = extensionOverride

        ? safeName.replace(/\.[^.]+$/, extensionOverride)

        : safeName;

    return `${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${base}`;

}

/**
 * Saves a file buffer to S3 (if configured) or local disk, and
 * returns { url, filename }. Callers don't need to know or care
 * which one actually happened.
 */
async function saveFile(buffer, originalName, mimetype, extensionOverride) {

    const filename = buildSafeFilename(originalName, extensionOverride);

    if (isS3Configured) {

        await s3Client.send(new PutObjectCommand({

            Bucket: AWS_S3_BUCKET,

            Key: filename,

            Body: buffer,

            ContentType: mimetype

        }));

        const url = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${filename}`;

        return { url, filename };

    }

    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);

    return { url: `/uploads/${filename}`, filename };

}

/**
 * Best-effort delete of a file we saved earlier (used when a
 * parent replaces a submission, so old files don't pile up).
 * Never throws: a failed delete must not block the parent.
 */
async function deleteFileByUrl(url) {

    try {

        if (!url || typeof url !== "string") return;

        const clean = url.split("?")[0];

        if (isS3Configured) {

            const prefix = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/`;

            if (!clean.startsWith(prefix)) return;

            const key = decodeURIComponent(clean.slice(prefix.length));

            if (!key || key.includes("/") || key.includes("..")) return;

            await s3Client.send(new DeleteObjectCommand({ Bucket: AWS_S3_BUCKET, Key: key }));

            return;

        }

        if (clean.startsWith("/uploads/")) {

            const name = path.basename(clean);

            const filePath = path.join(uploadDir, name);

            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        }

    } catch (err) {

        console.error("Could not delete old file:", err.code || err.name || "error");

    }

}

module.exports = {

    saveFile,

    deleteFileByUrl,

    isS3Configured

};
