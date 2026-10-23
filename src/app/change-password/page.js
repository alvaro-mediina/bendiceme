"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState(null);

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        router.replace("/");
        return;
      }

      const user = session.user;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, must_change_password")
        .eq("user_id", user.id)
        .single();

      if (profileError || !profile) {
        router.replace("/login");
        return;
      }

      if (profile.role !== "youth" || !profile.must_change_password) {
        router.replace("/");
        return;
      }

      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSaving(true);

    const { error: passwordError } = await supabase.auth.updateUser({
      password,
    });

    if (passwordError) {
      console.error("Error cambiando contraseña:", passwordError);

      setError("No se pudo cambiar la contraseña.");

      setSaving(false);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setError("No se encontró una sesión válida.");

      setSaving(false);
      return;
    }

    const response = await fetch("/api/auth/complete-password-setup", {
      method: "POST",

      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error completando setup:", data);

      setError(data.error ?? "No se pudo completar la configuración.");

      setSaving(false);
      return;
    }

    router.replace("/");
  };

  if (loading) {
    return (
      <main className="grid min-h-dvh place-items-center px-4">
        <div className="w-full max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
            Primer ingreso
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Creá tu contraseña
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Estamos preparando tu cuenta...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-8">
      <div className="w-full max-w-md">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
          Primer ingreso
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Creá tu contraseña
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Antes de continuar, elegí una contraseña personal para tu cuenta.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="text-sm font-medium">Nueva contraseña</label>

            <div className="relative mt-2">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                className="
        h-12 w-full
        rounded-2xl border
        bg-white px-4 pr-12
        text-sm outline-none
        transition-colors
        focus:border-green-300
      "
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="
                  absolute right-3 top-1/2
                  -translate-y-1/2
                  text-muted-foreground
                  transition-colors
                  hover:text-foreground
                "
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Confirmar contraseña</label>

            <div className="relative mt-2">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                className="
                  h-12 w-full
                  rounded-2xl border
                  bg-white px-4 pr-12
                  text-sm outline-none
                  transition-colors
                  focus:border-green-300
                "
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="
                  absolute right-3 top-1/2
                  -translate-y-1/2
                  text-muted-foreground
                  transition-colors
                  hover:text-foreground
                "
                aria-label={
                  showConfirmPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={saving || !password || !confirmPassword}
            className="
              h-12 w-full
              rounded-2xl
              bg-green-600
              text-sm font-semibold
              text-white
              transition-colors
              hover:bg-green-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {saving ? "Guardando..." : "Guardar contraseña"}
          </button>
        </form>
      </div>
    </main>
  );
}
