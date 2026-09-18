export async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
        throw new Error("Este navegador no soporta Service Workers.");
    }

    const registration = await navigator.serviceWorker.register("/sw.js");

    await navigator.serviceWorker.ready;

    return registration;
}
