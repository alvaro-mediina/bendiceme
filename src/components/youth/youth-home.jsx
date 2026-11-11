"use client";

import { motion } from "motion/react";
import { staggerContainer } from "@/lib/animations";
import useYouthAvailability from "@/hooks/use-youth-availability";
import PageHeader from "@/components/page-header";
import YouthAvailabilityList from "./youth-availability-list";
import YouthHomeActions from "./youth-home-actions";

export default function YouthHome({
  currentYouth,
  onSave,
  onViewAssignments,
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
  } = useYouthAvailability(currentYouth);

  const handleSave = async () => {
    const success = await saveAvailability();

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
        title="Santa Cena"
      />

      <YouthAvailabilityList
        loaded={loaded}
        visibleSundays={visibleSundays}
        selected={selected}
        saving={saving}
        toggleSunday={toggleSunday}
      />

      {errorMessage && (
        <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
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
