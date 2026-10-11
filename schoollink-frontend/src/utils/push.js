import {
    getPushPublicKey,
    savePushSubscription,
    removePushSubscription
} from "../services/pushService";

export function isPushSupported() {

    return (
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window
    );

}

function urlBase64ToUint8Array(base64String) {

    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

    const raw = window.atob(base64);

    return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));

}

async function getRegistration() {

    return navigator.serviceWorker.ready;

}

/** true if this device currently has an active subscription */
export async function isSubscribed() {

    if (!isPushSupported()) return false;

    try {

        const reg = await getRegistration();

        return Boolean(await reg.pushManager.getSubscription());

    } catch {

        return false;

    }

}

/**
 * Ask permission, subscribe this device and register it with the
 * server. Must be called from a button tap (iPhone requires it).
 * Returns { ok, reason }.
 */
export async function enablePush() {

    if (!isPushSupported()) {

        return { ok: false, reason: "unsupported" };

    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {

        return { ok: false, reason: "denied" };

    }

    try {

        const reg = await getRegistration();

        let sub = await reg.pushManager.getSubscription();

        if (!sub) {

            const key = await getPushPublicKey();

            sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(key)
            });

        }

        await savePushSubscription(sub.toJSON());

        return { ok: true };

    } catch (err) {

        console.error(err);

        return { ok: false, reason: "error" };

    }

}

export async function disablePush() {

    try {

        const reg = await getRegistration();

        const sub = await reg.pushManager.getSubscription();

        if (sub) {

            await removePushSubscription(sub.endpoint).catch(() => {});

            await sub.unsubscribe();

        }

    } catch (err) {

        console.error(err);

    }

}
