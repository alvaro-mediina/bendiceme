"use client";

import {
  Bell,
  Building2,
  CircleHelp,
  LogOut,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Sheet, SheetContent } from "@/components/ui/sheet";

import { supabase } from "@/lib/supabase";
import BrandLogo from "../brand-logo";
import { subscribeAdvisorToPush, unsubscribeAdvisorFromPush } from "@/lib/push";

export default function AdvisorMore({
  wardId,
  onLogout,
  sacramentSettings,
  onSacramentSettingsChange,
}) {
  const [wardName, setWardName] = useState("");
  const [passCount, setPassCount] = useState(sacramentSettings.passCount);
  const [minPrepareCount, setMinPrepareCount] = useState(
    sacramentSettings.minPrepareCount,
  );
  const [sacramentSettingsOpen, setSacramentSettingsOpen] = useState(false);
  const [savingSacramentSettings, setSavingSacramentSettings] = useState(false);
  const [sacramentSettingsError, setSacramentSettingsError] = useState(null);
  const [loadingWard, setLoadingWard] = useState(true);
  const [accountOpen, setAccountOpen] = useState(false);
  const [advisorEmail, setAdvisorEmail] = useState("");
  const [aboutOpen, setAboutOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushError, setPushError] = useState(null);

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

  useEffect(() => {
    const checkAdvisorPushSubscription = async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        return;
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return;
        }

        await navigator.serviceWorker.register("/sw.js");

        const registration = await navigator.serviceWorker.ready;

        const subscription = await registration.pushManager.getSubscription();

        const storedUserId = localStorage.getItem(
          "bendiceme-advisor-push-user-id",
        );

        setPushEnabled(
          Boolean(subscription && storedUserId === String(user.id)),
        );
      } catch (error) {
        console.error("Error comprobando notificaciones del asesor:", error);
      }
    };

    checkAdvisorPushSubscription();
  }, []);

  useEffect(() => {
    setPassCount(sacramentSettings.passCount);
    setMinPrepareCount(sacramentSettings.minPrepareCount);
  }, [sacramentSettings]);

  const handleEnableNotifications = async () => {
    setPushLoading(true);
    setPushError(null);

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        throw error;
      }

      if (!user) {
        throw new Error("No se encontró la sesión del asesor.");
      }

      await subscribeAdvisorToPush(user.id);

      setPushEnabled(true);
    } catch (error) {
      console.error("Error activando notificaciones del asesor:", error);

      setPushError(error.message);
    } finally {
      setPushLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setPushLoading(true);
    setPushError(null);

    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error(
          "Las notificaciones no están disponibles en este dispositivo.",
        );
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        throw error;
      }

      if (!user) {
        throw new Error("No se encontró la sesión del asesor.");
      }

      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await unsubscribeAdvisorFromPush(user.id, subscription);

        await subscription.unsubscribe();
      }

      localStorage.removeItem("bendiceme-advisor-push-user-id");

      setPushEnabled(false);
    } catch (error) {
      console.error("Error desactivando notificaciones del asesor:", error);

      setPushError("No se pudieron desactivar las notificaciones.");
    } finally {
      setPushLoading(false);
    }
  };

  const openAccount = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Error cargando cuenta del asesor:", error);
    }

    setAdvisorEmail(user?.email ?? "");
    setAccountOpen(true);
  };

  const decreasePassCount = () => {
    setPassCount((current) => {
      const next = Math.max(1, current - 1);

      setMinPrepareCount((prepareCount) => Math.min(prepareCount, next + 2));

      return next;
    });
  };

  const increasePassCount = () => {
    setPassCount((current) => Math.min(20, current + 1));
  };

  const decreasePrepareCount = () => {
    setMinPrepareCount((current) => Math.max(1, current - 1));
  };

  const increasePrepareCount = () => {
    setMinPrepareCount((current) => Math.min(passCount + 2, current + 1));
  };

  const handleSaveSacramentSettings = async () => {
    setSavingSacramentSettings(true);
    setSacramentSettingsError(null);

    const { data, error } = await supabase
      .from("wards")
      .update({
        pass_count: passCount,
        min_prepare_count: minPrepareCount,
      })
      .eq("id", wardId)
      .select("id, pass_count, min_prepare_count")
      .single();

    if (error) {
      console.error("Error guardando configuración de Santa Cena:", error);

      setSacramentSettingsError("No se pudo guardar la configuración.");

      setSavingSacramentSettings(false);
      return;
    }

    onSacramentSettingsChange({
      passCount: data.pass_count,
      minPrepareCount: data.min_prepare_count,
    });

    setSavingSacramentSettings(false);
    setSacramentSettingsOpen(false);
  };

  return (
    <section className="mx-auto w-full max-w-5xl">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
          Preferencias y cuenta
        </p>

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
            Preferencias
          </p>

          <div className="mt-3 overflow-hidden rounded-2xl border bg-white">
            <button
              type="button"
              className="flex w-full items-center gap-4 border-b p-4 text-left transition-colors hover:bg-muted/50 active:bg-muted"
              onClick={() => setNotificationsOpen(true)}
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
              onClick={() => setSacramentSettingsOpen(true)}
              className="flex w-full items-center gap-4 border-b p-4 text-left transition-colors hover:bg-muted/50 active:bg-muted"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                <UsersRound className="size-5" />
              </div>

              <div className="flex-1">
                <p className="font-medium">Santa Cena</p>

                <p className="mt-0.5 text-sm text-muted-foreground">
                  Configurar el equipo del barrio
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={openAccount}
              className="flex w-full items-center gap-4 border-b p-4 text-left transition-colors hover:bg-muted/50 active:bg-muted"
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
              className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-muted/50 active:bg-muted"
              onClick={() => {
                setAboutOpen(true);
              }}
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

      <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <SheetContent
          side="bottom"
          className="
      rounded-t-[28px]
      px-5 pb-8 pt-3
      lg:data-[side=bottom]:left-1/2
      lg:data-[side=bottom]:right-auto
      lg:data-[side=bottom]:w-[520px]
      lg:data-[side=bottom]:max-w-[calc(100vw-2rem)]
      lg:data-[side=bottom]:-translate-x-1/2
    "
        >
          <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-gray-200" />

          <div>
            <p className="text-sm text-muted-foreground">Avisos</p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Notificaciones
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Recibí avisos relacionados con la disponibilidad y las respuestas
              de los jóvenes.
            </p>
          </div>

          <div className="mt-8">
            {pushEnabled ? (
              <div className="space-y-3">
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                  <p className="font-semibold text-green-700">
                    Notificaciones activadas
                  </p>

                  <p className="mt-1 text-sm text-green-700/80">
                    Este dispositivo puede recibir avisos de BendiceMe.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDisableNotifications}
                  disabled={pushLoading}
                  className="
                    flex h-12 w-full
                    items-center justify-center
                    rounded-2xl
                    border border-red-200
                    bg-red-50
                    px-4
                    text-sm font-semibold text-red-700
                    transition-colors
                    hover:bg-red-100
                    disabled:opacity-60
                  "
                >
                  {pushLoading
                    ? "Desactivando..."
                    : "Desactivar notificaciones"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleEnableNotifications}
                disabled={pushLoading}
                className="
            flex h-12 w-full
            items-center justify-center
            rounded-2xl
            bg-green-600
            px-4
            text-sm font-semibold text-white
            transition-colors
            hover:bg-green-700
            disabled:opacity-60
          "
              >
                {pushLoading ? "Activando..." : "Activar notificaciones"}
              </button>
            )}

            {pushError && (
              <p className="mt-3 text-sm text-red-600">{pushError}</p>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet
        open={sacramentSettingsOpen}
        onOpenChange={setSacramentSettingsOpen}
      >
        <SheetContent
          side="bottom"
          className="
      rounded-t-[28px]
      px-5 pb-8 pt-3
      lg:data-[side=bottom]:left-1/2
      lg:data-[side=bottom]:right-auto
      lg:data-[side=bottom]:w-[520px]
      lg:data-[side=bottom]:max-w-[calc(100vw-2rem)]
      lg:data-[side=bottom]:-translate-x-1/2
    "
        >
          <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-gray-200" />

          <div>
            <p className="text-sm text-muted-foreground">Configuración</p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Santa Cena
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Estas cantidades se aplican a todos los asesores de{" "}
              <span className="font-medium text-foreground">{wardName}</span>.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {/* BENDICEN */}
            <div className="rounded-2xl border bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">Bendicen</p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Cantidad fija para la Santa Cena
                  </p>
                </div>

                <div className="flex size-11 items-center justify-center rounded-xl bg-muted text-lg font-semibold">
                  2
                </div>
              </div>
            </div>

            {/* REPARTEN */}
            <div className="rounded-2xl border bg-white p-4">
              <div>
                <p className="font-semibold">Reparten</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Jóvenes necesarios para repartir
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={decreasePassCount}
                  disabled={passCount <= 1}
                  className="
              flex size-11 items-center justify-center
              rounded-xl border
              text-xl font-medium
              transition-colors
              hover:bg-muted
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
                >
                  −
                </button>

                <span className="text-2xl font-semibold">{passCount}</span>

                <button
                  type="button"
                  onClick={increasePassCount}
                  disabled={passCount >= 20}
                  className="
              flex size-11 items-center justify-center
              rounded-xl border
              text-xl font-medium
              transition-colors
              hover:bg-muted
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
                >
                  +
                </button>
              </div>
            </div>

            {/* PREPARAN */}
            <div className="rounded-2xl border bg-white p-4">
              <div>
                <p className="font-semibold">Preparan</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Cantidad mínima que debe preparar la Santa Cena
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={decreasePrepareCount}
                  disabled={minPrepareCount <= 1}
                  className="
              flex size-11 items-center justify-center
              rounded-xl border
              text-xl font-medium
              transition-colors
              hover:bg-muted
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
                >
                  −
                </button>

                <span className="text-2xl font-semibold">
                  {minPrepareCount}
                </span>

                <button
                  type="button"
                  onClick={increasePrepareCount}
                  disabled={minPrepareCount >= passCount + 2}
                  className="
              flex size-11 items-center justify-center
              rounded-xl border
              text-xl font-medium
              transition-colors
              hover:bg-muted
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-green-50 p-4">
            <p className="text-sm leading-relaxed text-green-800">
              El equipo tendrá{" "}
              <span className="font-semibold">{passCount + 2} jóvenes</span>: 2
              para bendecir y {passCount} para repartir. Al menos{" "}
              {minPrepareCount}{" "}
              {minPrepareCount === 1 ? "deberá preparar" : "deberán preparar"}{" "}
              la Santa Cena.
            </p>
          </div>

          {sacramentSettingsError && (
            <p className="mt-4 text-sm text-red-600">
              {sacramentSettingsError}
            </p>
          )}

          <button
            type="button"
            onClick={handleSaveSacramentSettings}
            disabled={savingSacramentSettings}
            className="
        mt-6 flex h-12 w-full
        items-center justify-center
        rounded-2xl
        bg-green-600
        px-4
        text-sm font-semibold text-white
        transition-colors
        hover:bg-green-700
        disabled:opacity-60
      "
          >
            {savingSacramentSettings ? "Guardando..." : "Guardar configuración"}
          </button>
        </SheetContent>
      </Sheet>

      <Sheet open={accountOpen} onOpenChange={setAccountOpen}>
        <SheetContent
          side="bottom"
          className="
      rounded-t-[28px]
      px-5 pb-8 pt-3
      lg:data-[side=bottom]:left-1/2
      lg:data-[side=bottom]:right-auto
      lg:data-[side=bottom]:w-[520px]
      lg:data-[side=bottom]:max-w-[calc(100vw-2rem)]
      lg:data-[side=bottom]:-translate-x-1/2
    "
        >
          <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-gray-200" />

          <div>
            <p className="text-sm text-muted-foreground">Cuenta</p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Información del asesor
            </h2>
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Rol
              </p>

              <p className="mt-2 font-medium">Asesor</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Barrio
              </p>

              <p className="mt-2 font-medium">{wardName}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Correo
              </p>

              <p className="mt-2 break-all font-medium">
                {advisorEmail || "Sin correo"}
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={aboutOpen} onOpenChange={setAboutOpen}>
        <SheetContent
          side="bottom"
          className="
      rounded-t-[28px]
      px-5 pb-8 pt-3
      lg:data-[side=bottom]:left-1/2
      lg:data-[side=bottom]:right-auto
      lg:data-[side=bottom]:w-[520px]
      lg:data-[side=bottom]:max-w-[calc(100vw-2rem)]
      lg:data-[side=bottom]:-translate-x-1/2
    "
        >
          <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-gray-200" />

          <div>
            <p className="text-sm text-muted-foreground">Acerca de</p>

            <BrandLogo />

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Una herramienta para simplificar la organización de jóvenes,
              disponibilidad y asignaciones para la Santa Cena.
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Versión
              </p>

              <p className="mt-2 font-medium">MVP</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Propósito
              </p>

              <p className="mt-2 text-sm leading-relaxed">
                Facilitar la organización de los equipos de la Santa Cena y la
                coordinación entre jóvenes y asesores.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Soporte
              </p>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Si encontrás un error, algo no funciona como esperabas o querés
                enviar una sugerencia, podés contactarte conmigo.
              </p>

              <a
                href={`mailto:alvaro.mediina2003@gmail.com?subject=${encodeURIComponent(
                  "BendiceMe - Reporte de problema",
                )}&body=${encodeURIComponent(
                  `Hola,

                    Encontré un problema en BendiceMe.

                    ¿Qué ocurrió?


                    ¿Qué esperaba que ocurriera?


                    ¿En qué sección ocurrió?
                    Inicio / Santa Cena / Jóvenes / Más

                    Información adicional:


                    Gracias.`,
                )}`}
                className="
            mt-4 flex h-12 w-full
            items-center justify-center
            rounded-2xl
            bg-green-600
            px-4
            text-sm font-semibold text-white
            transition-colors
            hover:bg-green-700
          "
              >
                Contactar soporte
              </a>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                alvaro.mediina2003@gmail.com
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}
