"use client";

import { useEffect, useState } from "react";

import YouthSelector from "@/components/youth/youth-selector";
import YouthHome from "@/components/youth/youth-home";
import AvailabilitySaved from "@/components/youth/availability-saved";
import YouthAssignments from "@/components/youth/youth-assignments";
import AdvisorView from "@/components/advisor/advisor-view";

import { supabase } from "@/lib/supabase";

export default function Page() {
    const [screen, setScreen] = useState("select");
    const [currentYouth, setCurrentYouth] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    useEffect(() => {
        const loadSavedYouth = async () => {
            const savedYouthId = localStorage.getItem(
                "bendiceme-current-youth-id",
            );

            if (!savedYouthId) {
                setLoadingUser(false);
                return;
            }

            const { data: youthData, error: youthError } = await supabase
                .from("youth")
                .select("*")
                .eq("id", savedYouthId)
                .single();

            if (youthError || !youthData) {
                setLoadingUser(false);
                return;
            }

            setCurrentYouth(youthData);

            const { data: availabilityData, error: availabilityError } =
                await supabase
                    .from("availability")
                    .select("id")
                    .eq("youth_id", youthData.id)
                    .eq("available", true)
                    .limit(1);

            if (!availabilityError && availabilityData.length > 0) {
                setScreen("saved");
            } else {
                setScreen("home");
            }

            setLoadingUser(false);
        };

        loadSavedYouth();
    }, []);

    if (loadingUser) {
        return null;
    }

    if (!currentYouth) {
        return (
            <div className="flex min-h-dvh justify-center px-4 py-6 sm:items-center sm:py-10">
                <YouthSelector
                    onSelect={(person) => {
                        setCurrentYouth(person);
                        setScreen("home");
                    }}
                />
            </div>
        );
    }

    if (screen === "advisor") {
        return <AdvisorView />;
    }

    if (screen === "saved") {
        return (
            <div className="flex min-h-dvh justify-center px-4 py-6 sm:items-center sm:py-10">
                <AvailabilitySaved
                    currentYouth={currentYouth}
                    onEdit={() => setScreen("home")}
                    onViewAssignments={() => setScreen("assignments")}
                />
            </div>
        );
    }

    if (screen === "assignments") {
        return (
            <div className="flex min-h-dvh justify-center px-4 py-6 sm:items-center sm:py-10">
                <YouthAssignments
                    currentYouth={currentYouth}
                    onBack={() => setScreen("home")}
                />
            </div>
        );
    }

    return (
        <div className="flex min-h-dvh justify-center px-4 py-6 sm:items-center sm:py-10">
            <YouthHome
                currentYouth={currentYouth}
                onSave={() => setScreen("saved")}
                onViewAssignments={() => setScreen("assignments")}
            />
        </div>
    );
}
