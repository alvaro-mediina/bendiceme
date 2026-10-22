"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function useAdvisorYouth(wardId) {
    const [youth, setYouth] = useState([]);
    const [loadingYouth, setLoadingYouth] = useState(true);
    const [savingYouth, setSavingYouth] = useState(false);
    const [youthError, setYouthError] = useState(null);

    const loadYouth = useCallback(async () => {
        if (!wardId) {
            setYouth([]);
            setLoadingYouth(false);
            return;
        }

        setLoadingYouth(true);
        setYouthError(null);

        const { data, error } = await supabase
            .from("youth")
            .select(
                `
                id,
                name,
                office,
                active,
                user_id
            `,
            )
            .eq("ward_id", wardId)
            .order("name", {
                ascending: true,
            });

        if (error) {
            console.error("Error cargando jóvenes:", error);

            setYouthError("No se pudieron cargar los jóvenes.");

            setYouth([]);
            setLoadingYouth(false);
            return;
        }

        setYouth(data ?? []);
        setLoadingYouth(false);
    }, [wardId]);

    useEffect(() => {
        loadYouth();
    }, [loadYouth]);

    const createYouth = async ({ name, office }) => {
        if (!wardId) {
            return {
                success: false,
                error: "No se encontró el barrio.",
            };
        }

        setSavingYouth(true);
        setYouthError(null);

        try {
            const { data, error } = await supabase
                .from("youth")
                .insert({
                    ward_id: wardId,
                    name: name.trim(),
                    office,
                    active: true,
                })
                .select(
                    `
                    id,
                    name,
                    office,
                    active,
                    user_id
                `,
                )
                .single();

            if (error) {
                throw error;
            }

            setYouth((current) =>
                [...current, data].sort((a, b) => a.name.localeCompare(b.name)),
            );

            return {
                success: true,
                youth: data,
            };
        } catch (error) {
            console.error("Error creando joven:", error);

            setYouthError("No se pudo agregar el joven.");

            return {
                success: false,
                error: "No se pudo agregar el joven.",
            };
        } finally {
            setSavingYouth(false);
        }
    };

    const updateYouth = async (youthId, { name, office, active }) => {
        if (!wardId) {
            return {
                success: false,
                error: "No se encontró el barrio.",
            };
        }

        setSavingYouth(true);
        setYouthError(null);

        try {
            const updates = {};

            if (name !== undefined) {
                updates.name = name.trim();
            }

            if (office !== undefined) {
                updates.office = office;
            }

            if (active !== undefined) {
                updates.active = active;
            }

            const { data, error } = await supabase
                .from("youth")
                .update(updates)
                .eq("id", youthId)
                .eq("ward_id", wardId)
                .select(
                    `
                    id,
                    name,
                    office,
                    active,
                    user_id
                `,
                )
                .single();

            if (error) {
                throw error;
            }

            setYouth((current) =>
                current
                    .map((item) => (item.id === youthId ? data : item))
                    .sort((a, b) => a.name.localeCompare(b.name)),
            );

            return {
                success: true,
                youth: data,
            };
        } catch (error) {
            console.error("Error actualizando joven:", error);

            setYouthError("No se pudo actualizar el joven.");

            return {
                success: false,
                error: "No se pudo actualizar el joven.",
            };
        } finally {
            setSavingYouth(false);
        }
    };

    return {
        youth,
        loadingYouth,
        savingYouth,
        youthError,

        createYouth,
        updateYouth,
        reloadYouth: loadYouth,
    };
}
