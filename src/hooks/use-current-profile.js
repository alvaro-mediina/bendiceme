"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function useCurrentProfile() {
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [profileError, setProfileError] = useState(null);

    useEffect(() => {
        const loadProfile = async () => {
            setLoadingProfile(true);
            setProfileError(null);

            const {
                data: { session },
                error: sessionError,
            } = await supabase.auth.getSession();

            if (sessionError) {
                throw sessionError;
            }

            if (!session) {
                setProfile(null);
                setLoadingProfile(false);
                return;
            }

            try {
                const {
                    data: { user },
                    error: userError,
                } = await supabase.auth.getUser();

                if (userError) {
                    throw userError;
                }

                if (!user) {
                    setProfile(null);
                    return;
                }

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

                setProfile({
                    ...data,
                    user,
                });
            } catch (error) {
                console.error("Error cargando perfil:", error);

                setProfileError("No se pudo cargar el perfil.");

                setProfile(null);
            } finally {
                setLoadingProfile(false);
            }
        };

        loadProfile();
    }, []);

    return {
        profile,
        loadingProfile,
        profileError,
    };
}
