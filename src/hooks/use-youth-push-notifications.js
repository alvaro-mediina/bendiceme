"use client";

import { useEffect, useState } from "react";
import { subscribeToPush, unsubscribeYouthFromPush } from "@/lib/push";

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
                await navigator.serviceWorker.register("/sw.js");

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

    const disableNotifications = async () => {
        setPushLoading(true);
        setPushError(null);

        try {
            if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
                throw new Error("Las notificaciones no están disponibles en este dispositivo.");
            }

            const storedYouthId = localStorage.getItem("bendiceme-push-youth-id");
            if (storedYouthId !== String(youthId)) {
                throw new Error("La suscripción de este dispositivo pertenece a otra cuenta.");
            }

            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                await unsubscribeYouthFromPush(subscription);
                await subscription.unsubscribe();
            }

            localStorage.removeItem("bendiceme-push-youth-id");
            setPushEnabled(false);
        } catch (error) {
            console.error("Error desactivando notificaciones:", error);
            setPushError(error.message ?? "No se pudieron desactivar las notificaciones.");
        } finally {
            setPushLoading(false);
        }
    };

    return {
        pushLoading,
        pushEnabled,
        pushError,
        enableNotifications,
        disableNotifications,
    };
}
