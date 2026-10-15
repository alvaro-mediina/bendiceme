"use client";

import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export default function useCurrentYouth() {
    const [currentYouth, setCurrentYouth] = useState(null);

    const [youthStartScreen, setYouthStartScreen] = useState("home");

    const [loadingYouthSession, setLoadingYouthSession] = useState(true);

    const refreshCurrentYouth = useCallback(async () => {
        setLoadingYouthSession(true);

        try {
            const {
                data: { session },
                error: sessionError,
            } = await supabase.auth.getSession();

            if (sessionError) {
                throw sessionError;
            }

            if (!session) {
                setCurrentYouth(null);
                setYouthStartScreen("home");

                return null;
            }

            const user = session.user;

            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("role, ward_id")
                .eq("user_id", user.id)
                .single();

            if (profileError || !profile || profile.role !== "youth") {
                setCurrentYouth(null);
                setYouthStartScreen("home");

                return null;
            }

            const { data: youthData, error: youthError } = await supabase
                .from("youth")
                .select("*")
                .eq("user_id", user.id)
                .eq("ward_id", profile.ward_id)
                .single();

            if (youthError || !youthData) {
                setCurrentYouth(null);
                setYouthStartScreen("home");

                return null;
            }

            setCurrentYouth(youthData);
            setYouthStartScreen("home");

            return {
                youth: youthData,
                startScreen: "home",
            };
        } catch (error) {
            console.error("Error restaurando sesión del joven:", error);

            setCurrentYouth(null);
            setYouthStartScreen("home");

            return null;
        } finally {
            setLoadingYouthSession(false);
        }
    }, []);

    useEffect(() => {
        refreshCurrentYouth();
    }, [refreshCurrentYouth]);

    const clearYouth = () => {
        setCurrentYouth(null);
        setYouthStartScreen("home");
    };

    return {
        currentYouth,
        youthStartScreen,
        loadingYouthSession,
        refreshCurrentYouth,
        clearYouth,
        setYouthStartScreen,
    };
}
