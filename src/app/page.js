"use client";

import { useState } from "react";

import YouthHome from "@/components/youth/youth-home";
import YouthAssignments from "@/components/youth/youth-assignments";
import AdvisorView from "@/components/advisor/advisor-view";

export default function Page() {
    const [screen, setScreen] = useState("home");

    if (screen === "advisor") {
        return <AdvisorView />;
    }

    if (screen === "assignments") {
        return <YouthAssignments onEdit={() => setScreen("home")} />;
    }

    return <YouthHome onSave={() => setScreen("assignments")} />;
}
