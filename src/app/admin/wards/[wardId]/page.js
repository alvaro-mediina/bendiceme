"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2, UsersRound, UserRoundCog } from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function AdminWardPage() {
  const params = useParams();
  const router = useRouter();

  const wardId = params.wardId;

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [ward, setWard] = useState(null);
  const [error, setError] = useState(null);

  const [advisors, setAdvisors] = useState([]);
  const [loadingAdvisors, setLoadingAdvisors] = useState(true);
  const [advisorsError, setAdvisorsError] = useState(null);

  const [advisorEmail, setAdvisorEmail] = useState("");

  const [addingAdvisor, setAddingAdvisor] = useState(false);

  const [addAdvisorError, setAddAdvisorError] = useState(null);

  const [createdAdvisorCredentials, setCreatedAdvisorCredentials] =
    useState(null);

  useEffect(() => {
    if (!wardId) {
      return;
    }

    const loadWard = async () => {
      setLoading(true);
      setError(null);

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

      const { data: wardData, error: wardError } = await supabase
        .from("wards")
        .select(
          `
          id,
          name,
          slug,
          pass_count,
          min_prepare_count
        `,
        )
        .eq("id", wardId)
        .single();

      if (wardError) {
        console.error("Error cargando barrio:", wardError);
        setError("No se pudo cargar el barrio.");
        setLoading(false);
        return;
      }

      setWard(wardData);
      setLoading(false);
    };

    loadWard();
  }, [wardId]);

  useEffect(() => {
    if (!authorized || !wardId) {
      return;
    }

    const loadAdvisors = async () => {
      setLoadingAdvisors(true);
      setAdvisorsError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setAdvisorsError("No se encontró una sesión válida.");
        setLoadingAdvisors(false);
        return;
      }

      const response = await fetch(`/api/admin/wards/${wardId}/advisors`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error cargando asesores:", data);

        setAdvisorsError(data.error ?? "No se pudieron cargar los asesores.");

        setLoadingAdvisors(false);
        return;
      }

      setAdvisors(data.advisors ?? []);
      setLoadingAdvisors(false);
    };

    loadAdvisors();
  }, [authorized, wardId]);

  const handleAddAdvisor = async (event) => {
    event.preventDefault();

    const email = advisorEmail.trim().toLowerCase();

    if (!email) {
      setAddAdvisorError("Ingresá el correo del asesor.");
      return;
    }

    setAddingAdvisor(true);
    setAddAdvisorError(null);
    setCreatedAdvisorCredentials(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setAddAdvisorError("No se encontró una sesión válida.");
      setAddingAdvisor(false);
      return;
    }

    const response = await fetch(`/api/admin/wards/${wardId}/advisors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        email,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error agregando asesor:", data);

      setAddAdvisorError(data.error ?? "No se pudo agregar el asesor.");

      setAddingAdvisor(false);
      return;
    }

    setAdvisors((current) => [...current, data.advisor]);

    setCreatedAdvisorCredentials({
      email: data.advisor.email,
      password: data.temporaryPassword,
    });

    setAdvisorEmail("");
    setAddingAdvisor(false);
  };

  if (loading) {
    return (
      <main className="mx-auto min-h-dvh w-full max-w-3xl px-4 py-8 sm:px-6">
        <div className="space-y-6">
          <div className="h-8 w-40 animate-pulse rounded-xl bg-muted" />
          <div className="h-40 animate-pulse rounded-3xl bg-muted" />
          <div className="h-40 animate-pulse rounded-3xl bg-muted" />
          <div className="h-40 animate-pulse rounded-3xl bg-muted" />
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

  if (error || !ward) {
    return (
      <main className="grid min-h-dvh place-items-center px-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold">No se pudo cargar el barrio</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {error ?? "El barrio no existe."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-3xl px-4 py-8 sm:px-6">
      <button
        type="button"
        onClick={() => router.push("/admin")}
        className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a barrios
      </button>

      <header className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
          Administración
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {ward.name}
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Administrá la configuración y los usuarios de este barrio.
        </p>
      </header>

      <section className="mt-8 rounded-3xl border bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-green-50 text-green-700">
            <Building2 className="size-5" />
          </div>

          <div>
            <h2 className="font-semibold">Santa Cena</h2>

            <p className="text-sm text-muted-foreground">
              Configuración actual del barrio
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Reparten</p>

            <p className="mt-1 text-2xl font-semibold">{ward.pass_count}</p>
          </div>

          <div className="rounded-2xl bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Preparan</p>

            <p className="mt-1 text-2xl font-semibold">
              {ward.min_prepare_count}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-green-50 text-green-700">
            <UserRoundCog className="size-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">Asesores</h2>

            <p className="text-sm text-muted-foreground">
              Administrá quienes pueden gestionar este barrio.
            </p>
          </div>
        </div>

        {loadingAdvisors ? (
          <div className="mt-6 space-y-3">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        ) : advisorsError ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{advisorsError}</p>
          </div>
        ) : advisors.length > 0 ? (
          <div className="mt-6 space-y-3">
            {advisors.map((advisor) => (
              <div
                key={advisor.userId}
                className="flex items-center gap-3 rounded-2xl border p-4"
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-green-50 text-sm font-semibold text-green-700">
                  {advisor.email?.[0]?.toUpperCase() ?? "A"}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {advisor.email ?? "Asesor sin correo"}
                  </p>

                  <p className="mt-0.5 text-xs text-muted-foreground">Asesor</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Este barrio todavía no tiene asesores.
            </p>
          </div>
        )}

        <form onSubmit={handleAddAdvisor} className="mt-5 space-y-3">
          <div>
            <label htmlFor="advisor-email" className="text-sm font-medium">
              Correo del nuevo asesor
            </label>

            <input
              id="advisor-email"
              type="email"
              value={advisorEmail}
              onChange={(event) => setAdvisorEmail(event.target.value)}
              placeholder="asesor@ejemplo.com"
              className="
        mt-2 h-11 w-full rounded-xl border
        bg-white px-3 text-sm outline-none
        transition-colors focus:border-green-500
      "
            />
          </div>

          {addAdvisorError && (
            <p className="text-sm text-red-600">{addAdvisorError}</p>
          )}

          <button
            type="submit"
            disabled={addingAdvisor}
            className="
      h-11 w-full rounded-xl
      bg-green-600 text-sm font-semibold
      text-white transition-colors
      hover:bg-green-700
      disabled:cursor-not-allowed
      disabled:opacity-60
    "
          >
            {addingAdvisor ? "Creando asesor..." : "Agregar asesor"}
          </button>
        </form>

        {createdAdvisorCredentials && (
          <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-semibold text-green-800">
              Asesor creado correctamente
            </p>

            <div className="mt-3 space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Correo: </span>

                <span className="font-medium">
                  {createdAdvisorCredentials.email}
                </span>
              </p>

              <p>
                <span className="text-muted-foreground">
                  Contraseña temporal:{" "}
                </span>

                <code className="rounded bg-white px-2 py-1 font-mono">
                  {createdAdvisorCredentials.password}
                </code>
              </p>
            </div>

            <p className="mt-3 text-xs text-green-800/70">
              Guardá esta contraseña ahora. No se podrá consultar nuevamente
              desde BendiceMe.
            </p>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-3xl border bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-green-50 text-green-700">
            <UsersRound className="size-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">Jóvenes</h2>

            <p className="text-sm text-muted-foreground">
              Administrá los jóvenes asociados al barrio.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Todavía no estamos cargando los jóvenes.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled
            className="h-11 rounded-xl border text-sm font-semibold opacity-50"
          >
            Agregar joven
          </button>

          <button
            type="button"
            disabled
            className="h-11 rounded-xl bg-green-600 text-sm font-semibold text-white opacity-50"
          >
            Importar jóvenes
          </button>
        </div>
      </section>
    </main>
  );
}
