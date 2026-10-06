export async function notifyConfirmedTeamMembers({ youthId, sundayId }) {
    const response = await fetch("/api/push/team-member-confirmed", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            youthId,
            sundayId,
        }),
    });

    if (!response.ok) {
        const data = await response.json();

        throw new Error(data.error ?? "No se pudo notificar al equipo.");
    }

    return response.json();
}
