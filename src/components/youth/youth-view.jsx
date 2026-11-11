"use client";

import { useState } from "react";
import Image from "next/image";
import { BookOpen, Church, Ellipsis, Home, LogOut } from "lucide-react";

import BottomNav from "@/components/layout/bottom-nav";
import PageContainer from "@/components/layout/page-container";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import useYouthPushNotifications from "@/hooks/use-youth-push-notifications";
import { getOfficeLabel } from "@/lib/youth";
import AvailabilitySaved from "./availability-saved";
import YouthAssignments from "./youth-assignments";
import YouthHome from "./youth-home";
import YouthNotificationCard from "./youth-notification-card";

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
    description: "Consultá las próximas clases de tu barrio.",
  },
  { id: "more", label: "Más", icon: Ellipsis },
];

export default function YouthView({
  currentYouth,
  initialView,
  onLogout,
  logoutLoading,
}) {
  const [activeView, setActiveView] = useState(initialView);
  const { pushLoading, pushEnabled, pushError, enableNotifications } =
    useYouthPushNotifications(currentYouth.id);
  const inSacrament = ["sacrament", "saved", "assignments"].includes(
    activeView,
  );

  return (
    <PageContainer
      center={activeView === "saved" || activeView === "assignments"}
    >
      <main className="w-full max-w-xl pb-28">
        {activeView === "home" && (
          <>
            <PageHeader
              title={`Hola, ${currentYouth.name.split(" ")[0]}`}
              description={getOfficeLabel(currentYouth.office)}
            />
            <div className="mt-6 grid grid-cols-2 gap-3">
              {navigation
                .filter((item) => item.image)
                .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveView(item.id)}
                    className="group relative flex min-h-[190px] items-end overflow-hidden rounded-[26px] text-left sm:min-h-[220px]"
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
                onClick={() => setActiveView("more")}
                className="group relative col-span-2 min-h-[130px] w-full overflow-hidden rounded-[26px] text-left"
              >
                <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.02]">
                  <Image
                    src="/images/advisor/more.png"
                    alt=""
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

        {activeView === "sacrament" && (
          <YouthHome
            currentYouth={currentYouth}
            onSave={() =>
              setActiveView((view) => (view === "sacrament" ? "saved" : view))
            }
            onViewAssignments={() => setActiveView("assignments")}
          />
        )}

        {activeView === "saved" && (
          <AvailabilitySaved
            currentYouth={currentYouth}
            onEdit={() => setActiveView("sacrament")}
            onViewAssignments={() => setActiveView("assignments")}
          />
        )}

        {activeView === "assignments" && (
          <YouthAssignments
            currentYouth={currentYouth}
            onBack={() => setActiveView("sacrament")}
          />
        )}

        {activeView === "school" && (
          <>
            <PageHeader title="Escuela Dominical" />
            <p className="mt-6 rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              Todavía no hay clases publicadas.
            </p>
          </>
        )}

        {activeView === "more" && (
          <>
            <PageHeader title="Más" />
            <YouthNotificationCard
              pushEnabled={pushEnabled}
              pushLoading={pushLoading}
              pushError={pushError}
              onEnableNotifications={enableNotifications}
            />
            <Button
              className="mt-4"
              variant="outline"
              onClick={onLogout}
              disabled={logoutLoading}
            >
              <LogOut className="size-4" />
              {logoutLoading ? "Cerrando sesión..." : "Cerrar sesión"}
            </Button>
          </>
        )}
      </main>

      <BottomNav
        items={navigation}
        activeView={inSacrament ? "sacrament" : activeView}
        onChangeView={setActiveView}
      />
    </PageContainer>
  );
}
