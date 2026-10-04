"use client";

import { useEffect, useState } from "react";
import { subscribeToPush } from "@/lib/push";

export default function useYouthPushNotifications(youthId) {
    const [pushLoading, setPushLoading] = useState(false);

    const [pushEnabled, setPushEnabled] = useState(false);

    const [pushError, setPushError] = useState(null);

    useEffect(() => {
        const checkPushSubscription = async () => {
            if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
                return;
            }

            try {
                const registration = await navigator.serviceWorker.ready;

                const subscription =
                    await registration.pushManager.getSubscription();

                const pushYouthId = localStorage.getItem(
                    "bendiceme-push-youth-id",
                );

                const belongsToCurrentYouth = pushYouthId === String(youthId);

                setPushEnabled(Boolean(subscription && belongsToCurrentYouth));
            } catch (error) {
                console.error("Error comprobando notificaciones:", error);
            }
        };

        checkPushSubscription();
    }, [youthId]);

    const enableNotifications = async () => {
        setPushLoading(true);
        setPushError(null);

        try {
            await subscribeToPush(youthId);

            setPushEnabled(true);

            return true;
        } catch (error) {
            console.error("Error activando notificaciones:", error);

            setPushError(error.message);

            return false;
        } finally {
            setPushLoading(false);
        }
    };

    return {
        pushLoading,
        pushEnabled,
        pushError,
        enableNotifications,
    };
}
