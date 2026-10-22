"use client";

import { Bell, Building2, CircleHelp, LogOut, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdvisorMore({ wardId, onLogout }) {
  const [wardName, setWardName] = useState("");
  const [loadingWard, setLoadingWard] = useState(true);

  useEffect(() => {
    if (!wardId) {
      return;
    }

    const loadWard = async () => {
      setLoadingWard(true);

      const { data, error } = await supabase
        .from("wards")
        .select("name")
        .eq("id", wardId)
        .single();

      if (error) {
        console.error("Error cargando barrio:", error);

        setWardName("Barrio");
      } else {
        setWardName(data.name);
      }

      setLoadingWard(false);
    };

    loadWard();
  }, [wardId]);
  return (
    <section className="mx-auto w-full max-w-5xl">
      <header>
        <p className="text-sm text-muted-foreground">Configuración</p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Más</h1>
      </header>

      <div className="mt-8 space-y-8">
        {/* BARRIO */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Tu barrio
          </p>

          <div className="mt-3 flex items-center gap-4 rounded-2xl border bg-white p-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-green-50">
              <Building2 className="size-5 text-green-700" />
            </div>

            {loadingWard ? (
              <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
            ) : (
              <p>{wardName}</p>
            )}
          </div>
        </section>

        {/* CONFIGURACIÓN */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Configuración
          </p>

          <div className="mt-3 overflow-hidden rounded-2xl border bg-white">
            <button
              type="button"
              className="flex w-full items-center gap-4 border-b p-4 text-left transition-colors hover:bg-muted/50"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                <Bell className="size-5" />
              </div>

              <div className="flex-1">
                <p className="font-medium">Notificaciones</p>

                <p className="mt-0.5 text-sm text-muted-foreground">
                  Gestionar avisos del asesor
                </p>
              </div>
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-4 border-b p-4 text-left transition-colors hover:bg-muted/50"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                <UserRound className="size-5" />
              </div>

              <div className="flex-1">
                <p className="font-medium">Cuenta</p>

                <p className="mt-0.5 text-sm text-muted-foreground">
                  Información de tu sesión
                </p>
              </div>
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-muted/50"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                <CircleHelp className="size-5" />
              </div>

              <div className="flex-1">
                <p className="font-medium">Acerca de BendiceMe</p>

                <p className="mt-0.5 text-sm text-muted-foreground">
                  Información de la aplicación
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* SESIÓN */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Sesión
          </p>

          <button
            type="button"
            onClick={onLogout}
            className="
              mt-3 flex w-full items-center gap-4
              rounded-2xl border border-red-200
              bg-red-50 p-4 text-left
              text-red-700
              transition-colors
              hover:bg-red-100
            "
          >
            <LogOut className="size-5" />

            <span className="font-semibold">Cerrar sesión</span>
          </button>
        </section>
      </div>
    </section>
  );
}
