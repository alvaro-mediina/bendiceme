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

function generateTemporaryPassword() {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";

  let password = "";

  for (let index = 0; index < 14; index += 1) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  return password;
}

export async function POST(request, { params }) {
  let createdUserId = null;

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

    if (ownerError || ownerProfile?.role !== "owner") {
      return Response.json(
        { error: "No tenés permisos para realizar esta acción." },
        { status: 403 },
      );
    }

    const body = await request.json();

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) {
      return Response.json(
        { error: "Ingresá un correo electrónico." },
        { status: 400 },
      );
    }

    const { data: ward, error: wardError } = await supabaseAdmin
      .from("wards")
      .select("id")
      .eq("id", wardId)
      .single();

    if (wardError || !ward) {
      return Response.json({ error: "El barrio no existe." }, { status: 404 });
    }

    const temporaryPassword = generateTemporaryPassword();

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: temporaryPassword,
        email_confirm: true,
      });

    if (authError || !authData.user) {
      console.error("Error creando usuario asesor:", authError);

      return Response.json(
        {
          error: authError?.message ?? "No se pudo crear la cuenta del asesor.",
        },
        { status: 400 },
      );
    }

    createdUserId = authData.user.id;

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        user_id: createdUserId,
        role: "advisor",
        ward_id: wardId,
      });

    if (profileError) {
      console.error("Error creando perfil del asesor:", profileError);

      await supabaseAdmin.auth.admin.deleteUser(createdUserId);

      return Response.json(
        {
          error: "Se creó la cuenta pero no se pudo asociar al barrio.",
        },
        { status: 500 },
      );
    }

    return Response.json(
      {
        advisor: {
          userId: createdUserId,
          email,
        },
        temporaryPassword,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error inesperado creando asesor:", error);

    if (createdUserId) {
      await supabaseAdmin.auth.admin.deleteUser(createdUserId).catch(() => {});
    }

    return Response.json(
      { error: "Ocurrió un error inesperado." },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { wardId } = await params;

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

    const { data: ownerProfile, error: ownerProfileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (ownerProfileError || ownerProfile?.role !== "owner") {
      return Response.json(
        {
          error: "No tenés permisos para eliminar asesores.",
        },
        {
          status: 403,
        },
      );
    }

    const body = await request.json();

    const advisorUserId = body.advisorUserId;

    if (!advisorUserId) {
      return Response.json(
        {
          error: "Falta el asesor a eliminar.",
        },
        {
          status: 400,
        },
      );
    }

    const { data: advisorProfile, error: advisorProfileError } =
      await supabaseAdmin
        .from("profiles")
        .select("user_id, role, ward_id")
        .eq("user_id", advisorUserId)
        .eq("ward_id", wardId)
        .single();

    if (advisorProfileError || !advisorProfile) {
      return Response.json(
        {
          error: "No se encontró el asesor.",
        },
        {
          status: 404,
        },
      );
    }

    if (advisorProfile.role !== "advisor") {
      return Response.json(
        {
          error: "La cuenta seleccionada no es un asesor.",
        },
        {
          status: 400,
        },
      );
    }

    const { error: deleteError } =
      await supabaseAdmin.auth.admin.deleteUser(advisorUserId);

    if (deleteError) {
      console.error("Error eliminando asesor:", deleteError);

      return Response.json(
        {
          error: "No se pudo eliminar el asesor.",
        },
        {
          status: 500,
        },
      );
    }

    return Response.json({
      success: true,
      userId: advisorUserId,
    });
  } catch (error) {
    console.error("Error inesperado eliminando asesor:", error);

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
