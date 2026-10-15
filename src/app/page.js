"use client";

import { useState, useEffect } from "react";
import YouthHome from "@/components/youth/youth-home";
import AvailabilitySaved from "@/components/youth/availability-saved";
import YouthAssignments from "@/components/youth/youth-assignments";
import AdvisorView from "@/components/advisor/advisor-view";
import RoleSelector from "@/components/access/role-selector";
import AdvisorLogin from "@/components/advisor/advisor-login";
import useCurrentYouth from "@/hooks/use-current-youth";
import PageContainer from "@/components/layout/page-container";
import useCurrentProfile from "@/hooks/use-current-profile";
import YouthLogin from "@/components/youth/youth-login";
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
    const [youthEmail, setYouthEmail] = useState("");
    const [youthPassword, setYouthPassword] = useState("");
    const [youthLoginError, setYouthLoginError] = useState(null);
    const [youthLoginLoading, setYouthLoginLoading] = useState(false);

    const { profile, loadingProfile, profileError } = useCurrentProfile();

    useEffect(() => {
        if (loadingYouthSession) {
            return;
        }

        const youthWasActive =
            sessionStorage.getItem("bendiceme-youth-active") === "true";

        if (!youthWasActive) {
            return;
        }

        setScreen("youth-login");
    }, [loadingYouthSession]);

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

    const handleYouthLogin = async (event) => {
        event.preventDefault();

        setYouthLoginLoading(true);
        setYouthLoginError(null);

        const { data: authData, error: authError } =
            await supabase.auth.signInWithPassword({
                email: youthEmail,
                password: youthPassword,
            });

        if (authError) {
            console.error("Error login joven:", authError);

            setYouthLoginError("El correo o la contraseña no son correctos.");

            setYouthLoginLoading(false);
            return;
        }

        const user = authData.user;

        const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select(
                `
            user_id,
            role,
            ward_id
        `,
            )
            .eq("user_id", user.id)
            .single();

        if (profileError || !profileData) {
            console.error("Error cargando perfil del joven:", profileError);

            await supabase.auth.signOut();

            setYouthLoginError(
                "No se encontró un perfil asociado a esta cuenta.",
            );

            setYouthLoginLoading(false);
            return;
        }

        if (profileData.role !== "youth") {
            await supabase.auth.signOut();

            setYouthLoginError("Esta cuenta no corresponde a un joven.");

            setYouthLoginLoading(false);
            return;
        }

        const { data: youthData, error: youthError } = await supabase
            .from("youth")
            .select("*")
            .eq("user_id", user.id)
            .eq("ward_id", profileData.ward_id)
            .single();

        if (youthError || !youthData) {
            console.error("Error cargando joven:", youthError);

            await supabase.auth.signOut();

            setYouthLoginError(
                "Esta cuenta todavía no está vinculada a un joven.",
            );

            setYouthLoginLoading(false);
            return;
        }

        selectYouth(youthData);

        sessionStorage.setItem("bendiceme-youth-active", "true");

        setYouthEmail("");
        setYouthPassword("");

        setYouthLoginLoading(false);

        setScreen(youthStartScreen === "saved" ? "saved" : "home");
    };

    if (screen === "role") {
        return (
            <PageContainer center>
                <RoleSelector
                    onYouth={() => {
                        setYouthEmail("");
                        setYouthPassword("");
                        setYouthLoginError(null);

                        setScreen("youth-login");
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
            <PageContainer center>
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
                    wardId={profile?.ward_id}
                    onBack={() => setScreen("role")}
                    onLogout={async () => {
                        await supabase.auth.signOut();
                        setScreen("role");
                    }}
                />
            </PageContainer>
        );
    }

    if (screen === "youth-login") {
        return (
            <PageContainer center>
                <YouthLogin
                    email={youthEmail}
                    password={youthPassword}
                    error={youthLoginError}
                    loading={youthLoginLoading}
                    onEmailChange={setYouthEmail}
                    onPasswordChange={setYouthPassword}
                    onBack={() => {
                        setYouthEmail("");
                        setYouthPassword("");
                        setYouthLoginError(null);

                        sessionStorage.removeItem("bendiceme-youth-active");

                        setScreen("role");
                    }}
                    onSubmit={handleYouthLogin}
                />
            </PageContainer>
        );
    }

    if (screen === "saved") {
        return (
            <PageContainer center>
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
            <PageContainer center>
                <YouthAssignments
                    currentYouth={currentYouth}
                    onBack={() => setScreen("home")}
                />
            </PageContainer>
        );
    }

    return (
        <PageContainer center>
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
