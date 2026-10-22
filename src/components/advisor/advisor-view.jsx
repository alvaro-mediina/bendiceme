"use client";

import { useState, useEffect } from "react";

import AdvisorHome from "./advisor-home";
import AdvisorSacrament from "./advisor-sacrament";
import AdvisorYouth from "./advisor-youth";
import AdvisorBottomNav from "./advisor-bottom-nav";
import AdvisorMore from "./advisor-more";
import { motion } from "motion/react";
export default function AdvisorView({ wardId, onBack, onLogout }) {
  const [activeView, setActiveView] = useState(() => {
    if (typeof window === "undefined") {
      return "home";
    }

    return sessionStorage.getItem("bendiceme-advisor-view") ?? "home";
  });

  const [mountedViews, setMountedViews] = useState(() => {
    if (typeof window === "undefined") {
      return new Set(["home"]);
    }

    const savedView =
      sessionStorage.getItem("bendiceme-advisor-view") ?? "home";

    return new Set(["home", savedView]);
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
    sessionStorage.setItem("bendiceme-advisor-view", activeView);
  }, [activeView]);

  return (
    <>
      <main className="mx-auto min-h-dvh w-full max-w-2xl px-4 pb-28 pt-5 sm:px-6 lg:pb-8 lg:pt-8">
        {mountedViews.has("home") && (
          <motion.div
            initial={false}
            animate={
              activeView === "home"
                ? {
                    opacity: 1,
                    y: 0,
                    pointerEvents: "auto",
                  }
                : {
                    opacity: 0,
                    y: 8,
                    pointerEvents: "none",
                  }
            }
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
            className={activeView === "home" ? "block" : "hidden"}
          >
            <AdvisorHome wardId={wardId} onNavigate={changeView} />
          </motion.div>
        )}

        {mountedViews.has("sacrament") && (
          <motion.div
            initial={false}
            animate={
              activeView === "sacrament"
                ? {
                    opacity: 1,
                    y: 0,
                    pointerEvents: "auto",
                  }
                : {
                    opacity: 0,
                    y: 8,
                    pointerEvents: "none",
                  }
            }
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
            className={activeView === "sacrament" ? "block" : "hidden"}
          >
            <AdvisorSacrament wardId={wardId} />
          </motion.div>
        )}

        {mountedViews.has("youth") && (
          <motion.div
            initial={false}
            animate={
              activeView === "youth"
                ? {
                    opacity: 1,
                    y: 0,
                    pointerEvents: "auto",
                  }
                : {
                    opacity: 0,
                    y: 8,
                    pointerEvents: "none",
                  }
            }
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
            className={activeView === "youth" ? "block" : "hidden"}
          >
            <AdvisorYouth wardId={wardId} />
          </motion.div>
        )}

        {mountedViews.has("more") && (
          <motion.div
            initial={false}
            animate={
              activeView === "more"
                ? {
                    opacity: 1,
                    y: 0,
                    pointerEvents: "auto",
                  }
                : {
                    opacity: 0,
                    y: 8,
                    pointerEvents: "none",
                  }
            }
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
            className={activeView === "more" ? "block" : "hidden"}
          >
            <AdvisorMore wardId={wardId} onLogout={onLogout} />
          </motion.div>
        )}
      </main>

      <AdvisorBottomNav activeView={activeView} onChangeView={changeView} />
    </>
  );
}
