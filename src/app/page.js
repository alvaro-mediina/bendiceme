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

            const { data, error } = await supabase
                .from("youth")
                .select("*")
                .eq("id", savedYouthId)
                .single();

            if (!error && data) {
                setCurrentYouth(data);
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
            <div className="flex min-h-screen items-center justify-center px-4">
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
            <div className="flex min-h-screen items-center justify-center px-4">
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
            <div className="flex min-h-screen items-center justify-center px-4">
                <YouthAssignments
                    currentYouth={currentYouth}
                    onBack={() => setScreen("saved")}
                />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <YouthHome
                currentYouth={currentYouth}
                onSave={() => setScreen("saved")}
            />
        </div>
    );
}
