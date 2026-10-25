"use client";

import { useEffect, useState } from "react";
import { Building2, Plus, ChevronDown } from "lucide-react";

import AdminHomeSkeleton from "@/components/admin/admin-home-skeleton";
import { supabase } from "@/lib/supabase";

function createSlug(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminView({ onOpenWard }) {
  const [wards, setWards] = useState([]);
  const [loadingWards, setLoadingWards] = useState(true);

  const [name, setName] = useState("");
  const [passCount, setPassCount] = useState(3);
  const [minPrepareCount, setMinPrepareCount] = useState(2);

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const [showCreateWard, setShowCreateWard] = useState(false);

  useEffect(() => {
    const loadWards = async () => {
      setLoadingWards(true);

      const { data: wardsData, error: wardsError } = await supabase
        .from("wards")
        .select(
          `
            id,
            name,
            slug,
            youth_onboarding_requests (
              id,
              status
            )
          `,
        )
        .order("name");

      if (wardsError) {
        console.error("Error cargando barrios:", wardsError);

        setError(wardsError.message ?? "No se pudieron cargar los barrios.");

        setLoadingWards(false);
        return;
      }

      const wardsWithPendingRequests = (wardsData ?? []).map((ward) => ({
        ...ward,

        pendingRequestsCount: (ward.youth_onboarding_requests ?? []).filter(
          (request) => request.status === "pending",
        ).length,
      }));

      setWards(wardsWithPendingRequests);

      setLoadingWards(false);
    };

    loadWards();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("admin-ward-requests")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "youth_onboarding_requests",
        },
        async () => {
          const { data: wardsData, error: wardsError } = await supabase
            .from("wards")
            .select(
              `
              id,
              name,
              slug,
              youth_onboarding_requests (
                id,
                status
              )
            `,
            )
            .order("name");

          if (wardsError) {
            console.error("Error actualizando solicitudes:", wardsError);
            return;
          }

          const wardsWithPendingRequests = (wardsData ?? []).map((ward) => ({
            ...ward,

            pendingRequestsCount: (ward.youth_onboarding_requests ?? []).filter(
              (request) => request.status === "pending",
            ).length,
          }));

          setWards(wardsWithPendingRequests);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCreateWard = async (event) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const slug = createSlug(trimmedName);

    if (!trimmedName) {
      setError("Ingresá un nombre para el barrio.");
      return;
    }

    setCreating(true);
    setError(null);

    const { data, error } = await supabase
      .from("wards")
      .insert({
        name: trimmedName,
        slug,
        pass_count: passCount,
        min_prepare_count: minPrepareCount,
      })
      .select("id, name, slug, pass_count, min_prepare_count")
      .single();

    if (error) {
      console.error("Error creando barrio:", error);

      setError("No se pudo crear el barrio.");
      setCreating(false);
      return;
    }

    setWards((current) =>
      [
        ...current,
        {
          ...data,
          pendingRequestsCount: 0,
        },
      ].sort((a, b) => a.name.localeCompare(b.name)),
    );

    setName("");
    setPassCount(3);
    setMinPrepareCount(2);
    setCreating(false);
    setShowCreateWard(false);
  };

  if (loadingWards) {
    return <AdminHomeSkeleton />;
  }

  return (
    <section className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
          Administración
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Barrios</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Administrá los barrios que utilizan BendiceMe.
        </p>
      </header>

      <section className="rounded-3xl border bg-white">
        <button
          type="button"
          onClick={() => setShowCreateWard((current) => !current)}
          className="
              flex w-full items-center
              gap-3 p-5 text-left
            "
        >
          <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-green-50 text-green-700">
            <Plus className="size-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">Nuevo barrio</h2>

            <p className="text-sm text-muted-foreground">
              Creá la estructura inicial del barrio.
            </p>
          </div>

          <ChevronDown
            className={`
        size-5 shrink-0
        text-muted-foreground
        transition-transform duration-200
        ${showCreateWard ? "rotate-180" : ""}
      `}
          />
        </button>

        {showCreateWard && (
          <form onSubmit={handleCreateWard} className="border-t px-5 pb-5 pt-5">
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium">Nombre</label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Barrio Centro"
                  className="
              mt-2 h-11 w-full rounded-xl border
              bg-white px-3 text-sm outline-none
              transition-colors focus:border-green-500
            "
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Reparten</label>

                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={passCount}
                    onChange={(event) =>
                      setPassCount(Number(event.target.value))
                    }
                    className="
                mt-2 h-11 w-full rounded-xl border
                bg-white px-3 text-sm outline-none
                focus:border-green-500
              "
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Preparan</label>

                  <input
                    type="number"
                    min="1"
                    max={passCount + 2}
                    value={minPrepareCount}
                    onChange={(event) =>
                      setMinPrepareCount(Number(event.target.value))
                    }
                    className="
                mt-2 h-11 w-full rounded-xl border
                bg-white px-3 text-sm outline-none
                focus:border-green-500
              "
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={creating}
                className="
            h-11 w-full rounded-xl
            bg-green-600
            text-sm font-semibold text-white
            transition-colors
            hover:bg-green-700
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
              >
                {creating ? "Creando..." : "Crear barrio"}
              </button>
            </div>
          </form>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Barrios registrados</h2>

          <span className="text-sm text-muted-foreground">{wards.length}</span>
        </div>

        <div className="mt-4 space-y-3">
          {wards.map((ward) => (
            <button
              key={ward.id}
              type="button"
              onClick={() => onOpenWard(ward.id)}
              className="
          flex w-full items-center gap-4 rounded-2xl
          border bg-white p-4 text-left
          transition-colors
          hover:border-green-200 hover:bg-green-50/30
        "
            >
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-green-50 text-green-700">
                <Building2 className="size-5" />
              </div>

              <div className="min-w-0">
                <p className="truncate font-medium">{ward.name}</p>

                <p className="mt-2 text-sm text-muted-foreground">
                  {ward.pendingRequestsCount === 0
                    ? "Sin solicitudes pendientes"
                    : `${ward.pendingRequestsCount} ${
                        ward.pendingRequestsCount === 1
                          ? "solicitud pendiente"
                          : "solicitudes pendientes"
                      }`}
                </p>
              </div>
            </button>
          ))}

          {wards.length === 0 && (
            <div className="rounded-2xl border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Todavía no hay barrios registrados.
              </p>
            </div>
          )}
        </div>
      </section>
    </section>
  );
}
