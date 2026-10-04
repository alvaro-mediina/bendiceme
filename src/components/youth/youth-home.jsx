"use client";


import { motion } from "motion/react";
import { staggerContainer } from "@/lib/animations";
import useYouthAvailability from "@/hooks/use-youth-availability";
import useYouthPushNotifications from "@/hooks/use-youth-push-notifications";
import YouthHeader from "./youth-header";
import YouthNotificationCard from "./youth-notification-card";
import YouthAvailabilityList from "./youth-availability-list";
import YouthHomeActions from "./youth-home-actions";

export default function YouthHome({
    currentYouth,
    onSave,
    onViewAssignments,
    onChangeYouth,
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
            
            <YouthHeader
                currentYouth={currentYouth}
                formattedMonth={formattedMonth}
                saving={saving}
                onChangeYouth={onChangeYouth}
            />

            <YouthNotificationCard
                pushEnabled={pushEnabled}
                pushLoading={pushLoading}
                pushError={pushError}
                saving={saving}
                onEnableNotifications={enableNotifications}
            />

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