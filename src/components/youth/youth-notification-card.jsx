"use client";

import { Bell } from "lucide-react";

export default function YouthNotificationCard({
    pushEnabled,
    pushLoading,
    pushError,
    saving,
    onEnableNotifications,
}) {
    return (
        <div className="mt-6 rounded-2xl border bg-white p-4">
            <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-50">
                    <Bell className="size-5 text-green-700" />
                </div>

                <div className="flex-1">
                    <h2 className="font-medium">
                        Recordatorios
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Recibí una notificación cuando se acerque uno de tus turnos.
                    </p>

                    {pushEnabled ? (
                        <p className="mt-3 text-sm font-medium text-green-700">
                            Notificaciones activadas
                        </p>
                    ) : (
                        <button
                            type="button"
                            onClick={onEnableNotifications}
                            disabled={pushLoading || saving}
                            className="mt-3 text-sm font-medium text-green-700 transition-colors hover:text-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {pushLoading
                                ? "Activando..."
                                : "Activar notificaciones"}
                        </button>
                    )}

                    {pushError && (
                        <p className="mt-2 text-sm text-red-600">
                            {pushError}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}