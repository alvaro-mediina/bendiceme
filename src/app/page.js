"use client";

import { useEffect, useState } from "react";

import YouthSelector from "@/components/youth/youth-selector";
import YouthHome from "@/components/youth/youth-home";
import AvailabilitySaved from "@/components/youth/availability-saved";
import YouthAssignments from "@/components/youth/youth-assignments";
import AdvisorView from "@/components/advisor/advisor-view";
import BrandLogo from "@/components/brand-logo";
import RoleSelector from "@/components/access/role-selector";
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
                <div className="w-full max-w-xl">
                    <BrandLogo />
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
                        Acceso de asesor
                    </p>

                    <button
                        type="button"
                        onClick={() => {
                            setAdvisorPassword("");
                            setAdvisorError(null);
                            setScreen("role");
                        }}
                        className="mt-8 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ChevronLeft className="size-4" />
                        Volver
                    </button>

                    <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                        Ingresá la contraseña
                    </h1>

                    <p className="mt-2 text-muted-foreground">
                        Este acceso está reservado para los asesores.
                    </p>

                    <form
                        className="mt-8"
                        onSubmit={(event) => {
                            event.preventDefault();

                            if (advisorPassword === ADVISOR_PASSWORD) {
                                setAdvisorError(null);
                                setScreen("advisor");
                                return;
                            }

                            setAdvisorError("La contraseña no es correcta.");
                        }}
                    >
                        <input
                            type="password"
                            value={advisorPassword}
                            onChange={(event) =>
                                setAdvisorPassword(event.target.value)
                            }
                            placeholder="Contraseña"
                            autoComplete="current-password"
                            className="h-12 w-full rounded-xl border bg-white px-4 outline-none transition-colors focus:border-green-600"
                        />

                        {advisorError && (
                            <p className="mt-2 text-sm text-red-600">
                                {advisorError}
                            </p>
                        )}

                        <Button
                            type="submit"
                            className="mt-4 h-12 w-full rounded-xl bg-green-600 text-white hover:bg-green-700"
                        >
                            Ingresar
                        </Button>
                    </form>
                </div>
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
