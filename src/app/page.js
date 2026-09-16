"use client";

import { useEffect, useState } from "react";

import YouthSelector from "@/components/youth/youth-selector";
import YouthHome from "@/components/youth/youth-home";
import AvailabilitySaved from "@/components/youth/availability-saved";
import YouthAssignments from "@/components/youth/youth-assignments";
import AdvisorView from "@/components/advisor/advisor-view";
import BrandLogo from "@/components/brand-logo";
import RoleSelector from "@/components/access/role-selector";
import AdvisorLogin from "@/components/advisor/advisor-login";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

import { supabase } from "@/lib/supabase";

const ADVISOR_PASSWORD = "1234";

export default function Page() {
    const [screen, setScreen] = useState("role");
    const [currentYouth, setCurrentYouth] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [advisorPassword, setAdvisorPassword] = useState("");
    const [advisorError, setAdvisorError] = useState(null);
    const [youthStartScreen, setYouthStartScreen] = useState("home");

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
                setYouthStartScreen("saved");
            } else {
                setYouthStartScreen("home");
            }

            setLoadingUser(false);
        };

        loadSavedYouth();
    }, []);

    if (loadingUser) {
        return null;
    }

    if (screen === "advisor") {
        return (
            <div className="flex min-h-dvh justify-center px-4 py-6 sm:items-center sm:py-10">
                <AdvisorView />
            </div>
        );
    }

    if (screen === "role") {
        return (
            <div className="flex min-h-dvh justify-center px-4 py-6 sm:items-center sm:py-10">
                <RoleSelector
                    onYouth={() => {
                        if (currentYouth) {
                            setScreen(youthStartScreen);
                        } else {
                            setScreen("youth");
                        }
                    }}
                    onAdvisor={() => {
                        setAdvisorError(null);
                        setAdvisorPassword("");
                        setScreen("advisor-login");
                    }}
                />
            </div>
        );
    }

    if (screen === "advisor-login") {
        return (
            <div className="flex min-h-dvh justify-center px-4 py-6 sm:items-center sm:py-10">
                <AdvisorLogin
                    password={advisorPassword}
                    error={advisorError}
                    onPasswordChange={setAdvisorPassword}
                    onBack={() => {
                        setAdvisorPassword("");
                        setAdvisorError(null);
                        setScreen("role");
                    }}
                    onSubmit={(event) => {
                        event.preventDefault();

                        if (advisorPassword === ADVISOR_PASSWORD) {
                            setAdvisorError(null);
                            setScreen("advisor");
                            return;
                        }

                        setAdvisorError("La contraseña no es correcta.");
                    }}
                />
            </div>
        );
    }

    if (screen === "youth" && !currentYouth) {
        return (
            <div className="flex min-h-dvh justify-center px-4 py-6 sm:items-center sm:py-10">
                <YouthSelector
                    onBack={() => setScreen("role")}
                    onSelect={(person) => {
                        setCurrentYouth(person);
                        setScreen("home");
                    }}
                />
            </div>
        );
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
