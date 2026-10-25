import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

export async function POST(request) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return Response.json(
        {
          error: "No autorizado.",
        },
        {
          status: 401,
        },
      );
    }

    const accessToken = authorization.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return Response.json(
        {
          error: "Sesión inválida.",
        },
        {
          status: 401,
        },
      );
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role, must_change_password")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return Response.json(
        {
          error: "No se encontró el perfil.",
        },
        {
          status: 404,
        },
      );
    }

    if (profile.role !== "youth") {
      return Response.json(
        {
          error: "Esta acción solo corresponde a jóvenes.",
        },
        {
          status: 403,
        },
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        must_change_password: false,
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error completando setup:", updateError);

      return Response.json(
        {
          error: "No se pudo completar la configuración.",
        },
        {
          status: 500,
        },
      );
    }

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error("Error completando setup de contraseña:", error);

    return Response.json(
      {
        error: "Ocurrió un error inesperado.",
      },
      {
        status: 500,
      },
    );
  }
}
