"use client";

import { useState, useEffect } from "react";

import AdvisorHome from "./advisor-home";
import AdvisorSacrament from "./advisor-sacrament";
import AdvisorYouth from "./advisor-youth";
import AdvisorBottomNav from "./advisor-bottom-nav";
import AdvisorViewSkeleton from "./advisor-view-skeleton";
import AdvisorMore from "./advisor-more";
import AdminView from "@/components/admin/admin-view";
import AdminWardView from "@/components/admin/admin-ward-view";
import { motion } from "motion/react";
import { supabase } from "@/lib/supabase";

export default function AdvisorView({ wardId, onLogout, isOwner = false }) {
  const [homeReady, setHomeReady] = useState(false);
  const [selectedWardId, setSelectedWardId] = useState(null);
  const [sacramentSettings, setSacramentSettings] = useState({
    passCount: 3,
    minPrepareCount: 2,
  });
  const [loadingSacramentSettings, setLoadingSacramentSettings] =
    useState(true);
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

  useEffect(() => {
    const loadSacramentSettings = async () => {
      if (!wardId) {
        setLoadingSacramentSettings(false);
        return;
      }

      setLoadingSacramentSettings(true);

      const { data, error } = await supabase
        .from("wards")
        .select("pass_count, min_prepare_count")
        .eq("id", wardId)
        .single();

      if (error) {
        console.error("Error cargando configuración de Santa Cena:", error);

        setLoadingSacramentSettings(false);
        return;
      }

      setSacramentSettings({
        passCount: data.pass_count ?? 3,
        minPrepareCount: data.min_prepare_count ?? 2,
      });

      setLoadingSacramentSettings(false);
    };

    loadSacramentSettings();
  }, [wardId]);
  return (
    <>
      <main
        className={`
          relative mx-auto min-h-dvh w-full max-w-2xl
          px-4 pt-5 sm:px-6 lg:pt-8
          ${activeView === "home" ? "pb-8" : "pb-28"}
        `}
      >
        {activeView === "home" && !homeReady && (
          <div className="absolute inset-0 z-10 bg-background">
            <div
              className="
        mx-auto min-h-dvh w-full max-w-2xl
        px-4 pb-8 pt-5 sm:px-6 lg:pt-8
      "
            >
              <AdvisorViewSkeleton />
            </div>
          </div>
        )}

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
            <AdvisorHome
              wardId={wardId}
              onNavigate={changeView}
              sacramentSettings={sacramentSettings}
              loadingSacramentSettings={loadingSacramentSettings}
              onReady={() => setHomeReady(true)}
              isOwner={isOwner}
            />
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
            <AdvisorSacrament
              wardId={wardId}
              sacramentSettings={sacramentSettings}
              loadingSacramentSettings={loadingSacramentSettings}
            />
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

        {isOwner && mountedViews.has("admin") && (
          <motion.div
            initial={false}
            animate={
              activeView === "admin"
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
            className={activeView === "admin" ? "block" : "hidden"}
          >
            <AdminView
              onOpenWard={(wardId) => {
                setSelectedWardId(wardId);
                changeView("admin-ward");
              }}
            />
          </motion.div>
        )}

        {isOwner && mountedViews.has("admin-ward") && (
          <motion.div
            initial={false}
            animate={
              activeView === "admin-ward"
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
            className={activeView === "admin-ward" ? "block" : "hidden"}
          >
            <AdminWardView
              wardId={selectedWardId}
              onBack={() => changeView("admin")}
            />
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
            <AdvisorMore
              wardId={wardId}
              onLogout={onLogout}
              sacramentSettings={sacramentSettings}
              onSacramentSettingsChange={setSacramentSettings}
            />
          </motion.div>
        )}
      </main>

      {activeView !== "home" && (
        <AdvisorBottomNav
          activeView={activeView}
          onChangeView={changeView}
          isOwner={isOwner}
        />
      )}
    </>
  );
}
