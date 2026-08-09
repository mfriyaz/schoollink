const fs = require("fs");

const path = require("path");

const crypto = require("crypto");

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

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

module.exports = {

    saveFile,

    isS3Configured

};
