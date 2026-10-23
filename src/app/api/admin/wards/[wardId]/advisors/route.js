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

export async function GET(request, { params }) {
  try {
    const { wardId } = await params;

    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return Response.json({ error: "No autorizado." }, { status: 401 });
    }

    const accessToken = authorization.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return Response.json({ error: "Sesión inválida." }, { status: 401 });
    }

    const { data: ownerProfile, error: ownerError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (ownerError || !ownerProfile || ownerProfile.role !== "owner") {
      return Response.json(
        { error: "No tenés permisos para realizar esta acción." },
        { status: 403 },
      );
    }

    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("user_id, role, ward_id")
      .eq("ward_id", wardId)
      .eq("role", "advisor");

    if (profilesError) {
      console.error("Error cargando perfiles de asesores:", profilesError);

      return Response.json(
        { error: "No se pudieron cargar los asesores." },
        { status: 500 },
      );
    }

    const advisors = await Promise.all(
      (profiles ?? []).map(async (profile) => {
        const {
          data: { user: advisorUser },
          error: advisorError,
        } = await supabaseAdmin.auth.admin.getUserById(profile.user_id);

        if (advisorError) {
          console.error("Error cargando usuario asesor:", advisorError);
        }

        return {
          userId: profile.user_id,
          email: advisorUser?.email ?? null,
        };
      }),
    );

    return Response.json({
      advisors,
    });
  } catch (error) {
    console.error("Error inesperado cargando asesores:", error);

    return Response.json(
      { error: "Ocurrió un error inesperado." },
      { status: 500 },
    );
  }
}
