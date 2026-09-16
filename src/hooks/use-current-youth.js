"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "bendiceme-current-youth-id";

export default function useCurrentYouth() {
    const [currentYouth, setCurrentYouth] = useState(null);

    const [youthStartScreen, setYouthStartScreen] = useState("home");

    const [loadingYouthSession, setLoadingYouthSession] = useState(true);

    useEffect(() => {
        const loadSavedYouth = async () => {
            const savedYouthId = localStorage.getItem(STORAGE_KEY);

            if (!savedYouthId) {
                setLoadingYouthSession(false);
                return;
            }

            const { data: youthData, error: youthError } = await supabase
                .from("youth")
                .select("*")
                .eq("id", savedYouthId)
                .single();

            if (youthError || !youthData) {
                localStorage.removeItem(STORAGE_KEY);
                setLoadingYouthSession(false);
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

            if (!availabilityError && availabilityData?.length > 0) {
                setYouthStartScreen("saved");
            } else {
                setYouthStartScreen("home");
            }

            setLoadingYouthSession(false);
        };

        loadSavedYouth();
    }, []);

    const selectYouth = (person) => {
        localStorage.setItem(STORAGE_KEY, person.id);

        setCurrentYouth(person);
        setYouthStartScreen("home");
    };

    const clearYouth = () => {
        localStorage.removeItem(STORAGE_KEY);

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
