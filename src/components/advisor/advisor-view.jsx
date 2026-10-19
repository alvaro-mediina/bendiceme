"use client";

import { useState } from "react";

import AdvisorHome from "./advisor-home";
import AdvisorSacrament from "./advisor-sacrament";
import AdvisorYouth from "./advisor-youth";
import AdvisorMore from "./advisor-more";
import AdvisorBottomNav from "./advisor-bottom-nav";

export default function AdvisorView({
    wardId,
    onBack,
    onLogout,
}) {
    const [activeView, setActiveView] =
        useState("home");

    return (
        <>
            <main className="mx-auto min-h-dvh w-full max-w-2xl px-4 pb-28 pt-5 sm:px-6 lg:pb-8 lg:pt-8">
                {activeView === "home" && (
                    <AdvisorHome
                        wardId={wardId}
                        onNavigate={setActiveView}
                    />
                )}

                {activeView === "sacrament" && (
                    <AdvisorSacrament
                        wardId={wardId}
                        onBack={onBack}
                        onLogout={onLogout}
                    />
                )}

                {activeView === "youth" && (
                    <AdvisorYouth
                        wardId={wardId}
                    />
                )}

                {activeView === "more" && (
                    <AdvisorMore
                        onLogout={onLogout}
                    />
                )}
            </main>

            <AdvisorBottomNav
                activeView={activeView}
                onChangeView={setActiveView}
            />
        </>
    );
}