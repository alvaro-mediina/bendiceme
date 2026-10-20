"use client";

import { useState, useEffect } from "react";

import AdvisorHome from "./advisor-home";
import AdvisorSacrament from "./advisor-sacrament";
import AdvisorYouth from "./advisor-youth";
import AdvisorBottomNav from "./advisor-bottom-nav";

export default function AdvisorView({
    wardId,
    onBack,
    onLogout,
}) {

    const [activeView, setActiveView] =
    useState(() => {
        if (typeof window === "undefined") {
            return "home";
        }

        return (
            sessionStorage.getItem(
                "bendiceme-advisor-view"
            ) ?? "home"
        );
    });

    const [mountedViews, setMountedViews] =
    useState(() => {
        if (typeof window === "undefined") {
            return new Set(["home"]);
        }

        const savedView =
            sessionStorage.getItem(
                "bendiceme-advisor-view"
            ) ?? "home";

        return new Set([
            "home",
            savedView,
        ]);
    });

    const changeView = (view) => {
        setMountedViews((current) => {
            const next = new Set(current);
            next.add(view);
            return next;
        });

        setActiveView(view);
    };

    useEffect(() => {
        sessionStorage.setItem(
            "bendiceme-advisor-view",
            activeView
        );
    }, [activeView]);

    return (
        <>
            <main className="mx-auto min-h-dvh w-full max-w-2xl px-4 pb-28 pt-5 sm:px-6 lg:pb-8 lg:pt-8">
                {mountedViews.has("home") && (
                    <div
                        className={
                            activeView === "home"
                                ? "block"
                                : "hidden"
                        }
                    >
                        <AdvisorHome
                            wardId={wardId}
                            onNavigate={changeView}
                        />
                    </div>
                )}

                {mountedViews.has("sacrament") && (
                    <div
                        className={
                            activeView === "sacrament"
                                ? "block"
                                : "hidden"
                        }
                    >
                        <AdvisorSacrament
                            wardId={wardId}
                        />
                    </div>
                )}

                {mountedViews.has("youth") && (
                    <div
                        className={
                            activeView === "youth"
                                ? "block"
                                : "hidden"
                        }
                    >
                        <AdvisorYouth
                            wardId={wardId}
                        />
                    </div>
                )}

                {mountedViews.has("more") && (
                    <div
                        className={
                            activeView === "more"
                                ? "block"
                                : "hidden"
                        }
                    >
                        <AdvisorMore
                            onLogout={onLogout}
                        />
                    </div>
                )}
            </main>

            <AdvisorBottomNav
                activeView={activeView}
                onChangeView={changeView}
            />
        </>
    );
}