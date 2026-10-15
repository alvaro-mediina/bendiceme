"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function useCurrentYouth() {
    const [currentYouth, setCurrentYouth] = useState(null);
    const [youthStartScreen, setYouthStartScreen] = useState("home");
    const [loadingYouthSession, setLoadingYouthSession] = useState(true);

    useEffect(() => {
        const loadCurrentYouth = async () => {
            setLoadingYouthSession(true);

            const {
                data: { session },
                error: sessionError,
            } = await supabase.auth.getSession();

            if (sessionError || !session) {
                setCurrentYouth(null);
                setLoadingYouthSession(false);
                return;
            }

            const user = session.user;

            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("role, ward_id")
                .eq("user_id", user.id)
                .single();

            if (profileError || !profile || profile.role !== "youth") {
                setCurrentYouth(null);
                setLoadingYouthSession(false);
                return;
            }

            const { data: youthData, error: youthError } = await supabase
                .from("youth")
                .select("*")
                .eq("user_id", user.id)
                .eq("ward_id", profile.ward_id)
                .single();

            if (youthError || !youthData) {
                setCurrentYouth(null);
                setLoadingYouthSession(false);
                return;
            }

            setCurrentYouth(youthData);

            const { data: availabilityData, error: availabilityError } =
                await supabase
                    .from("availability")
                    .select("id")
                    .eq("ward_id", profile.ward_id)
                    .eq("youth_id", youthData.id)
                    .eq("available", true)
                    .limit(1);

            if (!availabilityError && availabilityData?.length > 0) {
                setYouthStartScreen("saved");
            } else {
                setYouthStartScreen("home");
            }

            setLoadingYouthSession(false);
        };

        loadCurrentYouth();
    }, []);

    const selectYouth = (person) => {
        setCurrentYouth(person);
        setYouthStartScreen("home");
    };

    const clearYouth = () => {
        setCurrentYouth(null);
        setYouthStartScreen("home");
    };

    return {
        currentYouth,
        youthStartScreen,
        loadingYouthSession,
        selectYouth,
        clearYouth,
        setYouthStartScreen,
    };
}
