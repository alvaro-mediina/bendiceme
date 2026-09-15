"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export default function TestSupabase() {
    const [youth, setYouth] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadYouth = async () => {
            const { data, error } = await supabase
                .from("youth")
                .select("*");
            
            console.log(data);
            if (error) {
                console.error(error);
            } else {
                setYouth(data);
            }

            setLoading(false);
        };

        loadYouth();
    }, []);

    if (loading) {
        return <p>Cargando...</p>;
    }

    return (
        <div>
            {youth.map((person) => (
                <div key={person.id}>
                    {person.name} - {person.office}
                </div>
            ))}
        </div>
    );
}