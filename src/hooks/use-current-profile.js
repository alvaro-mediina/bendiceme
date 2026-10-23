"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function useCurrentProfile() {
  const [profile, setProfile] = useState(null);

  const [loadingProfile, setLoadingProfile] = useState(true);

  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async (user, showLoading = false) => {
      if (showLoading) {
        setLoadingProfile(true);
      }

      setProfileError(null);

      if (!user) {
        if (mounted) {
          setProfile(null);
          setLoadingProfile(false);
        }

        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            `
        user_id,
        role,
        ward_id,
        ward:wards (
          id,
          name,
          slug,
          active
        )
      `,
          )
          .eq("user_id", user.id)
          .single();

        if (error) {
          throw error;
        }

        if (!mounted) {
          return;
        }

        setProfile({
          ...data,
          user,
        });
      } catch (error) {
        console.error("Error cargando perfil:", error);

        if (!mounted) {
          return;
        }

        setProfileError("No se pudo cargar el perfil.");

        setProfile(null);
      } finally {
        if (mounted) {
          setLoadingProfile(false);
        }
      }
    };

    const initializeProfile = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error obteniendo sesión:", error);

        if (mounted) {
          setProfileError("No se pudo cargar la sesión.");

          setLoadingProfile(false);
        }

        return;
      }

      await loadProfile(session?.user ?? null, true);
    };

    initializeProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setProfile(null);
        setLoadingProfile(false);

        return;
      }

      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        loadProfile(session?.user ?? null, false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    profile,
    loadingProfile,
    profileError,
  };
}
