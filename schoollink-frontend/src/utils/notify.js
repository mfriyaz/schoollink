// Tiny global "toast": notify("Saved") from anywhere; <Notifier /> shows it.
export function notify(message, type = "success") {
    try {
        window.dispatchEvent(new CustomEvent("sl-notify", { detail: { message, type, id: Date.now() + Math.random() } }));
    } catch {
        /* ignore */
    }
}
export const notifyError = (message) => notify(message, "error");
