export async function notifyAdvisor({ type, youthId, sundayId }) {
    const response = await fetch("/api/push/advisor-notify", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            type,
            youthId,
            sundayId,
        }),
    });

    if (!response.ok) {
        const data = await response.json();

        throw new Error(data.error ?? "No se pudo enviar la notificación.");
    }

    return response.json();
}
