/**
 * EMAIL SERVICE (Gmail SMTP)
 *
 * Sends real email through a Gmail account via nodemailer.
 * Unlike Resend's free tier, this has no "only send to
 * yourself" restriction - it can email any real address
 * immediately, since Gmail already owns/trusts its own domain.
 *
 * Requires two environment variables in backend/.env:
 *
 *   GMAIL_USER=schoollink365@gmail.com
 *   GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx   (16-char App Password,
 *       NOT your normal Gmail password - see setup notes below)
 *
 * Setup (one-time, in your Google Account, not in this code):
 *   1. Enable 2-Step Verification on the Gmail account
 *      (myaccount.google.com/security)
 *   2. Go to myaccount.google.com/apppasswords
 *   3. Generate an App Password for "Mail"
 *   4. Copy the 16-character password (spaces don't matter,
 *      Google shows them for readability only) into
 *      GMAIL_APP_PASSWORD above
 *
 * Free Gmail accounts are capped at ~500 emails/day, which is
 * comfortably enough for a single school's notification volume.
 *
 * If GMAIL_USER/GMAIL_APP_PASSWORD aren't set, this falls back
 * to logging what WOULD be sent instead of crashing - so the
 * app keeps working for anyone who hasn't set up email yet.
 */

const nodemailer = require("nodemailer");

const GMAIL_USER = process.env.GMAIL_USER;

const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

let transporter = null;

if (GMAIL_USER && GMAIL_APP_PASSWORD) {

    transporter = nodemailer.createTransport({

        service: "gmail",

        auth: {

            user: GMAIL_USER,

            pass: GMAIL_APP_PASSWORD

        }

    });

}

async function sendEmail(to, subject, body) {

    if (!transporter) {

        console.log(
            `📧 [EMAIL STUB - GMAIL_USER/GMAIL_APP_PASSWORD not set] To: ${to} | Subject: ${subject} | ${body}`
        );

        return true;

    }

    try {

        const info = await transporter.sendMail({

            from: `SchoolLink <${GMAIL_USER}>`,

            to,

            subject,

            html: `<p>${body}</p>`

        });

        console.log(`📧 Email sent to ${to} (id: ${info.messageId})`);

        return true;

    } catch (err) {

        // A failed email should never crash the notification
        // flow that triggered it (e.g. a homework post being
        // created) - log and move on.
        console.error("📧 Gmail send error:", err.message);

        return false;

    }

}

module.exports = {

    sendEmail

};
