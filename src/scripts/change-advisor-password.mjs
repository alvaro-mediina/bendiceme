import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    },
);

const userId = "f28947d1-c588-4942-adff-f0d6826a98c0";
const newPassword = "sereunbuenlider2026.";

const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
});

if (error) {
    console.error("Error:", error);
    process.exit(1);
}

console.log("Contraseña actualizada correctamente.");
