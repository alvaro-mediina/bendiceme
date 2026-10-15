"use client";


import { motion } from "motion/react";
import { staggerContainer } from "@/lib/animations";
import useYouthAvailability from "@/hooks/use-youth-availability";
import useYouthPushNotifications from "@/hooks/use-youth-push-notifications";
import PageHeader from "@/components/page-header";
import { Bell, LogOut } from "lucide-react";
import YouthNotificationCard from "./youth-notification-card";
import YouthAvailabilityList from "./youth-availability-list";
import YouthHomeActions from "./youth-home-actions";

export default function YouthHome({
    currentYouth,
    onSave,
    onViewAssignments,
    onChangeYouth,
    logoutLoading,
}) {
        const {
        selected,
        loaded,
        saving,
        errorMessage,
        hadAvailability,
        formattedMonth,
        visibleSundays,
        hasChanges,
        toggleSunday,
        saveAvailability,
    } = useYouthAvailability(
        currentYouth
    );
    const {
        pushLoading,
        pushEnabled,
        pushError,
        enableNotifications,
    } = useYouthPushNotifications(
        currentYouth.id
    );
    
    const handleSave = async () => {
        const success =
            await saveAvailability();

        if (success) {
            onSave();
        }
    };


    return (
        <motion.section
            className="mx-auto w-full max-w-xl"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
        >
            
            <PageHeader
                eyebrow={`Disponibilidad · ${formattedMonth}`}
                title={`Hola, ${currentYouth.name.split(" ")[0]}`}
                description={
                    currentYouth.office === "priest"
                        ? "Presbítero"
                        : "Maestro"
                }
                action={
                    <div className="flex items-center gap-1.5">
                        {pushEnabled && (
                            <button
                                type="button"
                                aria-label="Notificaciones activadas"
                                title="Notificaciones activadas"
                                className="grid size-9 place-items-center rounded-lg text-green-700 transition-colors hover:bg-green-50"
                            >
                                <Bell className="size-4" />
                            </button>
                        )}


                        <motion.button
                            type="button"
                            onClick={onChangeYouth}
                            disabled={logoutLoading}
                            whileTap={{
                                scale: 0.96,
                            }}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-60"                        
                        >   

                            <LogOut className="size-4 shrink-0" />
                            
                            {logoutLoading ? (
                                <>
                                    <span className="sm:hidden">
                                        Cerrando...
                                    </span>

                                    <span className="hidden sm:inline">
                                        Cerrando sesión...
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="sm:hidden">
                                        Cerrar
                                    </span>

                                    <span className="hidden sm:inline">
                                        Cerrar sesión
                                    </span>
                                </>
                            )}
                        </motion.button>

                    </div>
                }
            />

            {!pushEnabled && (
                <YouthNotificationCard
                    pushEnabled={pushEnabled}
                    pushLoading={pushLoading}
                    pushError={pushError}
                    saving={saving}
                    onEnableNotifications={enableNotifications}
                />
            )}

            <YouthAvailabilityList
                loaded={loaded}
                visibleSundays={visibleSundays}
                selected={selected}
                saving={saving}
                toggleSunday={toggleSunday}
            />
            

            {errorMessage && (
                <p className="mt-4 text-sm text-red-600">
                    {errorMessage}
                </p>
            )}

            <YouthHomeActions
                loaded={loaded}
                saving={saving}
                hasChanges={hasChanges}
                hadAvailability={hadAvailability}
                onSave={handleSave}
                onViewAssignments={onViewAssignments}
            />
        </motion.section>
    );
}