"use client";

import { useEffect, useState } from "react";
import { Building2, Plus } from "lucide-react";

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

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const [wards, setWards] = useState([]);
  const [loadingWards, setLoadingWards] = useState(true);

  const [name, setName] = useState("");
  const [passCount, setPassCount] = useState(3);
  const [minPrepareCount, setMinPrepareCount] = useState(2);

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (profileError || profile?.role !== "owner") {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      setAuthorized(true);
      setLoading(false);
    };

    checkAccess();
  }, []);

  useEffect(() => {
    if (!authorized) {
      return;
    }

    const loadWards = async () => {
      setLoadingWards(true);

      const { data, error } = await supabase
        .from("wards")
        .select("id, name, pass_count, min_prepare_count")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error creando barrio:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });

        setError(error.message ?? "No se pudo crear el barrio.");
        setCreating(false);
        return;
      }

      setWards(data ?? []);
      setLoadingWards(false);
    };

    loadWards();
  }, [authorized]);

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
      [...current, data].sort((a, b) => a.name.localeCompare(b.name)),
    );

    setName("");
    setPassCount(3);
    setMinPrepareCount(2);
    setCreating(false);
  };

  if (loading) {
    return (
      <main className="mx-auto min-h-dvh w-full max-w-3xl px-4 py-8 sm:px-6">
        <div className="space-y-5">
          <div className="h-8 w-44 animate-pulse rounded-xl bg-muted" />
          <div className="h-40 animate-pulse rounded-3xl bg-muted" />
          <div className="h-56 animate-pulse rounded-3xl bg-muted" />
        </div>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="grid min-h-dvh place-items-center px-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Acceso no autorizado</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Esta sección es exclusiva para la administración de BendiceMe.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-3xl px-4 py-8 sm:px-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
          Administración
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Barrios</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Administrá los barrios que utilizan BendiceMe.
        </p>
      </header>

      <form
        onSubmit={handleCreateWard}
        className="mt-8 rounded-3xl border bg-white p-5"
      >
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-green-50 text-green-700">
            <Plus className="size-5" />
          </div>

          <div>
            <h2 className="font-semibold">Nuevo barrio</h2>

            <p className="text-sm text-muted-foreground">
              Creá la estructura inicial del barrio.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
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
                onChange={(event) => setPassCount(Number(event.target.value))}
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
              h-11 w-full rounded-xl bg-green-600
              text-sm font-semibold text-white
              transition-colors hover:bg-green-700
              disabled:cursor-not-allowed disabled:opacity-60
            "
          >
            {creating ? "Creando..." : "Crear barrio"}
          </button>
        </div>
      </form>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Barrios registrados</h2>

          {!loadingWards && (
            <span className="text-sm text-muted-foreground">
              {wards.length}
            </span>
          )}
        </div>

        {loadingWards ? (
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-20 animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {wards.map((ward) => (
              <div
                key={ward.id}
                className="flex items-center gap-4 rounded-2xl border bg-white p-4"
              >
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-green-50 text-green-700">
                  <Building2 className="size-5" />
                </div>

                <div className="min-w-0">
                  <p className="truncate font-medium">{ward.name}</p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {ward.pass_count} reparten · mínimo {ward.min_prepare_count}{" "}
                    preparan
                  </p>
                </div>
              </div>
            ))}

            {wards.length === 0 && (
              <div className="rounded-2xl border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Todavía no hay barrios registrados.
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
