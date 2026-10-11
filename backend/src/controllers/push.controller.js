const pushService = require("../services/push.service");
const response = require("../utils/response");

function getPublicKey(req, res) {

    const key = pushService.getPublicKey();

    if (!key) {

        return response.error(res, "Push notifications are not configured", 503);

    }

    return response.success(res, { public_key: key });

}

async function subscribe(req, res) {

    try {

        const sub = req.body;

        if (!sub || !sub.endpoint || !sub.keys || !sub.keys.p256dh || !sub.keys.auth) {

            return response.error(res, "Invalid subscription", 400);

        }

        await pushService.saveSubscription(req.user.id, sub);

        return response.success(res, null, "Phone alerts turned on");

    } catch (err) {

        return response.error(res, err.message, 500);

    }

}

async function unsubscribe(req, res) {

    try {

        if (req.body && req.body.endpoint) {

            await pushService.removeSubscription(req.user.id, req.body.endpoint);

        }

        return response.success(res, null, "Phone alerts turned off");

    } catch (err) {

        return response.error(res, err.message, 500);

    }

}

module.exports = { getPublicKey, subscribe, unsubscribe };
