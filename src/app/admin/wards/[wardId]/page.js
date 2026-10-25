"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import AdminWardView from "@/components/admin/admin-ward-view";
import AdminWardSkeleton from "@/components/admin/admin-ward-skeleton";
import { supabase } from "@/lib/supabase";

export default function AdminWardPage() {
  const params = useParams();
  const router = useRouter();

  const wardId = params.wardId;

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
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

  if (loading) {
    return <AdminWardSkeleton />;
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
      <AdminWardView wardId={wardId} onBack={() => router.push("/admin")} />
    </main>
  );
}
