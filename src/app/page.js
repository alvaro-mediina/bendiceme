"use client";

import { useState, useEffect } from "react";
import YouthSelector from "@/components/youth/youth-selector";
import YouthHome from "@/components/youth/youth-home";
import AvailabilitySaved from "@/components/youth/availability-saved";
import YouthAssignments from "@/components/youth/youth-assignments";
import AdvisorView from "@/components/advisor/advisor-view";
import RoleSelector from "@/components/access/role-selector";
import AdvisorLogin from "@/components/advisor/advisor-login";
import useCurrentYouth from "@/hooks/use-current-youth";
import PageContainer from "@/components/layout/page-container";
import { supabase } from "@/lib/supabase";

export default function Page() {
    const [screen, setScreen] = useState("role");
    const [advisorPassword, setAdvisorPassword] = useState("");
    const [advisorError, setAdvisorError] = useState(null);
    const {
        currentYouth,
        youthStartScreen,
        loadingYouthSession,
        selectYouth,
        clearYouth,
    } = useCurrentYouth();
    const [advisorLoading, setAdvisorLoading] = useState(false);
    const [checkingAdvisorSession, setCheckingAdvisorSession] = useState(true);

    useEffect(() => {
        const restoreAdvisorScreen = async () => {
            const advisorWasActive =
                sessionStorage.getItem("bendiceme-advisor-active") === "true";

            if (!advisorWasActive) {
                setCheckingAdvisorSession(false);
                return;
            }

            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session) {
                setScreen("advisor");
            } else {
                sessionStorage.removeItem("bendiceme-advisor-active");
            }

            setCheckingAdvisorSession(false);
        };

        restoreAdvisorScreen();
    }, []);

    if (loadingYouthSession || checkingAdvisorSession) {
        return null;
    }

    if (loadingYouthSession) {
        return null;
    }

    if (screen === "role") {
        return (
            <PageContainer>
                <RoleSelector
                    onYouth={() => {
                        if (currentYouth) {
                            setScreen(youthStartScreen);
                        } else {
                            setScreen("youth");
                        }
                    }}
                    onAdvisor={async () => {
                        setAdvisorError(null);
                        setAdvisorPassword("");

                        const {
                            data: { session },
                        } = await supabase.auth.getSession();

                        if (session) {
                            sessionStorage.setItem(
                                "bendiceme-advisor-active",
                                "true",
                            );

                            setScreen("advisor");
                            return;
                        }

                        setScreen("advisor-login");
                    }}
                />
            </PageContainer>
        );
    }

    if (screen === "advisor-login") {
        return (
            <PageContainer>
                <AdvisorLogin
                    password={advisorPassword}
                    error={advisorError}
                    loading={advisorLoading}
                    onPasswordChange={setAdvisorPassword}
                    onBack={() => {
                        setAdvisorPassword("");
                        setAdvisorError(null);
                        setScreen("role");
                    }}
                    onSubmit={async (event) => {
                        event.preventDefault();

                        setAdvisorLoading(true);
                        setAdvisorError(null);

                        const { error } =
                            await supabase.auth.signInWithPassword({
                                email: "alvaro.mediina2003@gmail.com",
                                password: advisorPassword,
                            });

                        if (error) {
                            console.error("Error login asesor", error);
                            setAdvisorError("La contraseña no es correcta.");

                            setAdvisorLoading(false);
                            return;
                        }

                        setAdvisorPassword("");
                        setAdvisorLoading(false);

                        sessionStorage.setItem(
                            "bendiceme-advisor-active",
                            "true",
                        );

                        setScreen("advisor");
                    }}
                />
            </PageContainer>
        );
    }

    if (screen === "advisor") {
        return (
            <PageContainer>
                <AdvisorView
                    onBack={() => setScreen("role")}
                    onLogout={async () => {
                        await supabase.auth.signOut();
                        setScreen("role");
                    }}
                />
            </PageContainer>
        );
    }

    if (screen === "youth" && !currentYouth) {
        return (
            <PageContainer>
                <YouthSelector
                    onBack={() => setScreen("role")}
                    onSelect={(person) => {
                        selectYouth(person);
                        setScreen("home");
                    }}
                />
            </PageContainer>
        );
    }

    if (screen === "saved") {
        return (
            <PageContainer>
                <AvailabilitySaved
                    currentYouth={currentYouth}
                    onEdit={() => setScreen("home")}
                    onViewAssignments={() => setScreen("assignments")}
                />
            </PageContainer>
        );
    }

    if (screen === "assignments") {
        return (
            <PageContainer>
                <YouthAssignments
                    currentYouth={currentYouth}
                    onBack={() => setScreen("home")}
                />
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <YouthHome
                currentYouth={currentYouth}
                onSave={() => setScreen("saved")}
                onViewAssignments={() => setScreen("assignments")}
                onChangeYouth={() => {
                    clearYouth();
                    setScreen("youth");
                }}
            />
        </PageContainer>
    );
}
