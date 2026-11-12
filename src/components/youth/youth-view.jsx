"use client";

import { useState } from "react";
import Image from "next/image";
import { BookOpen, Church, Ellipsis, Home } from "lucide-react";
import BottomNav from "@/components/layout/bottom-nav";
import PageContainer from "@/components/layout/page-container";
import SundaySchoolView from "@/components/sunday-school/sunday-school-view";
import AvailabilitySaved from "./availability-saved";
import YouthAssignments from "./youth-assignments";
import YouthHome from "./youth-home";
import YouthMore from "./youth-more";
import YouthNextSundayCard from "./youth-next-sunday-card";

const navigation = [
  { id: "home", label: "Inicio", icon: Home },
  {
    id: "sacrament",
    label: "Santa Cena",
    icon: Church,
    image: "/images/advisor/sacrament.png",
    description: "Marcá tu disponibilidad y consultá tus turnos.",
  },
  {
    id: "school",
    label: "Escuela Dominical",
    icon: BookOpen,
    image: "/images/youth/dominical.png",
    description: "Consultá las clases de escuela dominical.",
  },
  { id: "more", label: "Más", icon: Ellipsis },
];

export default function YouthView({
  currentYouth,
  nextSundaySummary,
  initialView,
  onLogout,
  logoutLoading,
}) {
  const [activeView, setActiveView] = useState(() => {
    if (
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("view") === "school"
    ) {
      return "school";
    }
    return initialView;
  });
  const [mountedViews, setMountedViews] = useState(() => new Set([activeView]));
  const changeView = (view) => {
    setMountedViews((current) => {
      if (current.has(view)) {
        return current;
      }

      return new Set([...current, view]);
    });
    setActiveView(view);
  };

  const inSacrament = ["sacrament", "saved", "assignments"].includes(
    activeView,
  );

  return (
    <PageContainer center={activeView === "saved"}>
      <main className="w-full max-w-xl pb-28">
        {activeView === "home" && (
          <>
            <header>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
                Panel de joven
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                Hola, {currentYouth.name.split(" ")[0]}
              </h1>
            </header>

            <YouthNextSundayCard
              {...nextSundaySummary}
              onRetry={nextSundaySummary.reload}
              currentYouthId={currentYouth.id}
            />

            <div className="mt-6 grid grid-cols-2 gap-3">
              {navigation
                .filter((item) => item.image)
                .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => changeView(item.id)}
                    className="group relative flex min-h-[190px] items-end overflow-hidden rounded-[26px] text-left [clip-path:inset(0_round_26px)] sm:min-h-[220px]"
                  >
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="(max-width: 608px) calc(50vw - 22px), 282px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-transparent" />
                    <span className="relative block w-full p-3 text-white sm:p-5">
                      <span className="block text-lg font-extrabold leading-tight sm:text-xl">
                        {item.label}
                      </span>
                      <span className="mt-1 block text-sm text-white/85">
                        {item.description}
                      </span>
                    </span>
                  </button>
                ))}
              <button
                type="button"
                onClick={() => changeView("more")}
                className="group relative col-span-2 min-h-[130px] w-full overflow-hidden rounded-[26px] text-left"
              >
                <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.02]">
                  <Image
                    src="/images/advisor/more.png"
                    alt=""
                    loading="eager"
                    fill
                    sizes="(max-width: 608px) calc(100vw - 32px), 576px"
                    className="-scale-x-100 object-cover"
                  />
                </div>
                <span className="relative flex min-h-[130px] items-center p-5">
                  <span className="max-w-[52%]">
                    <span className="block text-xl font-extrabold tracking-tight text-slate-900">
                      Más
                    </span>
                    <span className="mt-1 block text-sm leading-snug text-slate-600">
                      Preferencias, cuenta y configuración
                    </span>
                  </span>
                </span>
              </button>
            </div>
          </>
        )}

        {mountedViews.has("sacrament") && (
          <div hidden={activeView !== "sacrament"}>
            <YouthHome
              currentYouth={currentYouth}
              onSave={() =>
                setActiveView((view) => (view === "sacrament" ? "saved" : view))
              }
              onViewAssignments={() => changeView("assignments")}
            />
          </div>
        )}

        {activeView === "saved" && (
          <AvailabilitySaved
            currentYouth={currentYouth}
            onEdit={() => changeView("sacrament")}
            onViewAssignments={() => changeView("assignments")}
          />
        )}

        {activeView === "assignments" && (
          <YouthAssignments
            currentYouth={currentYouth}
            onBack={() => changeView("sacrament")}
          />
        )}

        {mountedViews.has("school") && (
          <div hidden={activeView !== "school"}>
            <SundaySchoolView
              key={currentYouth.ward_id}
              wardId={currentYouth.ward_id}
            />
          </div>
        )}

        {mountedViews.has("more") && (
          <div hidden={activeView !== "more"}>
            <YouthMore
              currentYouth={currentYouth}
              onLogout={onLogout}
              logoutLoading={logoutLoading}
            />
          </div>
        )}
      </main>

      {activeView !== "home" && (
        <BottomNav
          items={navigation}
          activeView={inSacrament ? "sacrament" : activeView}
          onChangeView={changeView}
        />
      )}
    </PageContainer>
  );
}
