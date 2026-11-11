"use client";

import { useEffect, useState } from "react";
import { Bell, Building2, CircleHelp, LogOut, UserRound } from "lucide-react";

import BrandLogo from "@/components/brand-logo";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import useYouthPushNotifications from "@/hooks/use-youth-push-notifications";
import { supabase } from "@/lib/supabase";
import { getOfficeLabel } from "@/lib/youth";

const preferences = [
  { id: "notifications", title: "Notificaciones", description: "Gestionar avisos de tus turnos", icon: Bell },
  { id: "account", title: "Cuenta", description: "Información de tu sesión", icon: UserRound },
  { id: "about", title: "Acerca de BendiceMe", description: "Información de la aplicación", icon: CircleHelp },
];

export default function YouthMore({ currentYouth, onLogout, logoutLoading }) {
  const [panel, setPanel] = useState(null);
  const [wardName, setWardName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { pushLoading, pushEnabled, pushError, enableNotifications, disableNotifications } =
    useYouthPushNotifications(currentYouth.id);

  useEffect(() => {
    let active = true;

    const loadAccount = async () => {
      try {
        const [wardResult, userResult] = await Promise.all([
          supabase.from("wards").select("name").eq("id", currentYouth.ward_id).single(),
          supabase.auth.getUser(),
        ]);

        if (!active) return;
        if (wardResult.error) throw wardResult.error;
        if (userResult.error) throw userResult.error;

        setWardName(wardResult.data.name);
        setEmail(userResult.data.user?.email ?? "");
      } catch (error) {
        if (active) {
          console.error("Error cargando cuenta del joven:", error);
          setError("No se pudo cargar la información de tu cuenta.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadAccount();
    return () => { active = false; };
  }, [currentYouth.ward_id]);

  const panelTitle = preferences.find((item) => item.id === panel)?.title;
  const accountFields = [
    ["Nombre", currentYouth.name],
    ["Rol", "Joven"],
    ["Oficio", getOfficeLabel(currentYouth.office)],
    ["Barrio", wardName || "No disponible"],
    ["Correo", email || "No disponible"],
  ];

  return (
    <section>
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
          Preferencias y cuenta
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Más</h1>
      </header>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Tu barrio</h2>
          <div className="mt-3 flex items-center gap-4 rounded-2xl border bg-white p-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-green-50">
              <Building2 className="size-5 text-green-700" />
            </div>
            {loading ? (
              <div aria-label="Cargando barrio" className="h-5 w-40 rounded skeleton-shimmer" />
            ) : (
              <p>{wardName || "Barrio no disponible"}</p>
            )}
          </div>
          {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Preferencias</h2>
          <div className="mt-3 divide-y overflow-hidden rounded-2xl border bg-white">
            {preferences.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPanel(item.id)}
                className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-muted/50 active:bg-muted"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <item.icon className="size-5" />
                </span>
                <span>
                  <span className="block font-medium">{item.title}</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{item.description}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Sesión</h2>
          <button
            type="button"
            onClick={onLogout}
            disabled={logoutLoading}
            className="mt-3 flex w-full items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-left text-red-700 transition-colors hover:bg-red-100 disabled:opacity-60"
          >
            <LogOut className="size-5" />
            <span className="font-semibold">{logoutLoading ? "Cerrando sesión..." : "Cerrar sesión"}</span>
          </button>
        </section>
      </div>

      <Sheet open={panel !== null} onOpenChange={(open) => { if (!open) setPanel(null); }}>
        <SheetContent
          side="bottom"
          className="max-h-[85dvh] overflow-y-auto rounded-t-[28px] px-5 pb-8 pt-3 lg:data-[side=bottom]:left-1/2 lg:data-[side=bottom]:right-auto lg:data-[side=bottom]:w-[520px] lg:data-[side=bottom]:max-w-[calc(100vw-2rem)] lg:data-[side=bottom]:-translate-x-1/2"
        >
          <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-gray-200" />
          <SheetTitle className="text-2xl font-semibold tracking-tight">{panelTitle}</SheetTitle>
          <SheetDescription>
            {panel === "notifications" && "Recibí avisos de tus asignaciones y recordatorios de tus turnos."}
            {panel === "account" && "Información de tu cuenta de joven."}
            {panel === "about" && "Información y soporte de BendiceMe."}
          </SheetDescription>

          {panel === "notifications" && (
            <div className="mt-6 space-y-3">
              {pushEnabled && (
                <p className="rounded-2xl border border-green-200 bg-green-50 p-4 font-semibold text-green-700">
                  Notificaciones activadas en este dispositivo
                </p>
              )}
              <button
                type="button"
                onClick={pushEnabled ? disableNotifications : enableNotifications}
                disabled={pushLoading}
                className={`flex min-h-12 w-full items-center justify-center rounded-2xl px-4 text-sm font-semibold disabled:opacity-60 ${pushEnabled ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100" : "bg-green-600 text-white hover:bg-green-700"}`}
              >
                {pushLoading ? "Procesando..." : pushEnabled ? "Desactivar notificaciones" : "Activar notificaciones"}
              </button>
              {pushError && <p role="alert" className="text-sm text-red-600">{pushError}</p>}
            </div>
          )}

          {panel === "account" && (
            <dl className="mt-6 space-y-5">
              {accountFields.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</dt>
                  <dd className="mt-2 break-words text-sm font-medium">{loading && ["Barrio", "Correo"].includes(label) ? "Cargando..." : value}</dd>
                </div>
              ))}
            </dl>
          )}

          {panel === "about" && (
            <div className="mt-6 space-y-5 text-sm">
              <BrandLogo />
              <p className="text-muted-foreground">Una herramienta para coordinar la disponibilidad y los turnos de los jóvenes para la Santa Cena.</p>
              <div>
                <h3 className="font-semibold">Versión</h3>
                <p className="mt-1">MVP</p>
              </div>
              <div>
                <h3 className="font-semibold">Soporte</h3>
                <p className="mt-2 text-muted-foreground">Si encontrás un error o querés enviar una sugerencia, podés contactarte con soporte.</p>
                <a
                  href={`mailto:alvaro.mediina2003@gmail.com?subject=${encodeURIComponent("BendiceMe - Reporte de problema")}&body=${encodeURIComponent("Hola,\n\nEncontré un problema en BendiceMe.\n\n¿Qué ocurrió?\n\n¿Qué esperaba que ocurriera?\n\n¿En qué sección ocurrió?\nInicio / Santa Cena / Escuela Dominical / Más\n\nInformación adicional:\n\nGracias.")}`}
                  className="mt-4 flex min-h-12 items-center justify-center rounded-2xl bg-green-600 px-4 font-semibold text-white hover:bg-green-700"
                >
                  Contactar soporte
                </a>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </section>
  );
}
