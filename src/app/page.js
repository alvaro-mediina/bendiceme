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
        return (
            <div className="flex min-h-screen items-center justify-center px-4">
                <YouthAssignments onEdit={() => setScreen("home")} />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <YouthHome onSave={() => setScreen("assignments")} />
        </div>
    );
}
