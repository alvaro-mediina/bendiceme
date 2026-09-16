"use client";

import { useState } from "react";
import YouthSelector from "@/components/youth/youth-selector";
import YouthHome from "@/components/youth/youth-home";
import AvailabilitySaved from "@/components/youth/availability-saved";
import YouthAssignments from "@/components/youth/youth-assignments";
import AdvisorView from "@/components/advisor/advisor-view";
import RoleSelector from "@/components/access/role-selector";
import AdvisorLogin from "@/components/advisor/advisor-login";
import useCurrentYouth from "@/hooks/use-current-youth";
import PageContainer from "@/components/layout/page-container";

const ADVISOR_PASSWORD = "1234";

export default function Page() {
    const [screen, setScreen] = useState("role");
    const [advisorPassword, setAdvisorPassword] = useState("");
    const [advisorError, setAdvisorError] = useState(null);
    const { currentYouth, youthStartScreen, loadingYouthSession, selectYouth } =
        useCurrentYouth();

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
                    onAdvisor={() => {
                        setAdvisorError(null);
                        setAdvisorPassword("");
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
            </PageContainer>
        );
    }

    if (screen === "advisor") {
        return (
            <PageContainer>
                <AdvisorView onBack={() => setScreen("role")} />
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
            />
        </PageContainer>
    );
}
