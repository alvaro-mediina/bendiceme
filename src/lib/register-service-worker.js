export async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
        throw new Error("Este navegador no soporta Service Workers.");
    }

    await navigator.serviceWorker.register("/sw.js");

    const registration = await navigator.serviceWorker.ready;

    return registration;
}
