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

async function getOwner(request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return {
      error: "No autorizado.",
      status: 401,
    };
  }

  const accessToken = authorization.replace("Bearer ", "");

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (userError || !user) {
    return {
      error: "Sesión inválida.",
      status: 401,
    };
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profileError || profile?.role !== "owner") {
    return {
      error: "No tenés permisos para realizar esta acción.",
      status: 403,
    };
  }

  return {
    user,
  };
}

export async function GET(request, { params }) {
  try {
    const { wardId } = await params;

    const auth = await getOwner(request);

    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const { data: requests, error } = await supabaseAdmin
      .from("youth_onboarding_requests")
      .select(
        `
          id,
          name,
          email,
          office,
          status,
          requested_by,
          created_at
        `,
      )
      .eq("ward_id", wardId)
      .eq("status", "pending")
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error("Error cargando solicitudes:", error);

      return Response.json(
        {
          error: "No se pudieron cargar las solicitudes.",
        },
        { status: 500 },
      );
    }

    const requestsWithAdvisor = await Promise.all(
      (requests ?? []).map(async (requestItem) => {
        const {
          data: { user },
        } = await supabaseAdmin.auth.admin.getUserById(
          requestItem.requested_by,
        );

        return {
          ...requestItem,
          requestedByEmail: user?.email ?? null,
        };
      }),
    );

    return Response.json({
      requests: requestsWithAdvisor,
    });
  } catch (error) {
    console.error("Error inesperado cargando solicitudes:", error);

    return Response.json(
      {
        error: "Ocurrió un error inesperado.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request, { params }) {
  let createdUserId = null;

  try {
    const { wardId } = await params;

    const auth = await getOwner(request);

    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();

    const requestId = body.requestId;
    const action = body.action;

    if (!requestId || !["approve", "reject"].includes(action)) {
      return Response.json(
        {
          error: "Solicitud inválida.",
        },
        { status: 400 },
      );
    }

    const { data: youthRequest, error: requestError } = await supabaseAdmin
      .from("youth_onboarding_requests")
      .select(
        `
        id,
        ward_id,
        name,
        email,
        office,
        status
      `,
      )
      .eq("id", requestId)
      .eq("ward_id", wardId)
      .single();

    if (requestError || !youthRequest) {
      return Response.json(
        {
          error: "No se encontró la solicitud.",
        },
        { status: 404 },
      );
    }

    if (youthRequest.status !== "pending") {
      return Response.json(
        {
          error: "Esta solicitud ya fue revisada.",
        },
        { status: 409 },
      );
    }

    if (action === "reject") {
      const { error: rejectError } = await supabaseAdmin
        .from("youth_onboarding_requests")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
          reviewed_by: auth.user.id,
        })
        .eq("id", youthRequest.id)
        .eq("status", "pending");

      if (rejectError) {
        console.error("Error rechazando solicitud:", rejectError);

        return Response.json(
          {
            error: "No se pudo rechazar la solicitud.",
          },
          { status: 500 },
        );
      }

      return Response.json({
        status: "rejected",
        requestId: youthRequest.id,
      });
    }

    const temporaryPassword = "sereungranjoven2026.";

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: youthRequest.email,
        password: temporaryPassword,
        email_confirm: true,
      });

    if (authError || !authData.user) {
      console.error("Error creando usuario:", authError);

      return Response.json(
        {
          error: authError?.message ?? "No se pudo crear la cuenta del joven.",
        },
        { status: 400 },
      );
    }

    createdUserId = authData.user.id;

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        user_id: createdUserId,
        ward_id: wardId,
        role: "youth",
        must_change_password: true,
      });

    if (profileError) {
      console.error("Error creando perfil:", profileError);

      await supabaseAdmin.auth.admin.deleteUser(createdUserId);

      return Response.json(
        {
          error: "No se pudo crear el perfil del joven.",
        },
        { status: 500 },
      );
    }

    const { data: createdYouth, error: youthError } = await supabaseAdmin
      .from("youth")
      .insert({
        name: youthRequest.name,
        office: youthRequest.office,
        ward_id: wardId,
        user_id: createdUserId,
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

    if (youthError) {
      console.error("Error creando joven:", youthError);

      await supabaseAdmin.auth.admin.deleteUser(createdUserId);

      return Response.json(
        {
          error: "No se pudo crear el joven.",
        },
        { status: 500 },
      );
    }

    const { error: approveError } = await supabaseAdmin
      .from("youth_onboarding_requests")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: auth.user.id,
      })
      .eq("id", youthRequest.id)
      .eq("status", "pending");

    if (approveError) {
      console.error("Error actualizando solicitud:", approveError);

      return Response.json(
        {
          error:
            "El joven se creó, pero no se pudo marcar la solicitud como aprobada.",
        },
        { status: 500 },
      );
    }

    return Response.json({
      status: "approved",

      youth: {
        id: createdYouth.id,
        name: createdYouth.name,
        office: createdYouth.office,
        active: createdYouth.active,
        userId: createdYouth.user_id,
        email: youthRequest.email,
      },

      temporaryPassword,
    });
  } catch (error) {
    console.error("Error revisando solicitud:", error);

    if (createdUserId) {
      await supabaseAdmin.auth.admin.deleteUser(createdUserId).catch(() => {});
    }

    return Response.json(
      {
        error: "Ocurrió un error inesperado.",
      },
      { status: 500 },
    );
  }
}
