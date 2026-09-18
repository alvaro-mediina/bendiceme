export function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);

    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function subscribeToPush(youthId) {
    if (!("serviceWorker" in navigator)) {
        throw new Error("Este navegador no soporta Service Workers.");
    }

    if (!("PushManager" in window)) {
        throw new Error("Este navegador no soporta notificaciones push.");
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
        throw new Error("No se concedió permiso para notificaciones.");
    }

    const registration = await navigator.serviceWorker.ready;

    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!publicKey) {
            throw new Error("Falta NEXT_PUBLIC_VAPID_PUBLIC_KEY.");
        }

        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
    }

    const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            youthId,
            subscription: subscription.toJSON(),
        }),
    });

    if (!response.ok) {
        const data = await response.json();

        throw new Error(data.error ?? "No se pudo guardar la suscripción.");
    }

    return subscription;
}
