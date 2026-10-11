import api from "./api";

export async function getPushPublicKey() {

    const response = await api.get("/push/public-key");

    return response.data.data.public_key;

}

export async function savePushSubscription(subscription) {

    const response = await api.post("/push/subscribe", subscription);

    return response.data;

}

export async function removePushSubscription(endpoint) {

    const response = await api.post("/push/unsubscribe", { endpoint });

    return response.data;

}
