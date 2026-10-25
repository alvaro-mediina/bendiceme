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

function generateTemporaryPassword() {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";

  let password = "";

  for (let index = 0; index < 14; index += 1) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  return password;
}

async function getOwnerFromRequest(request) {
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

    const auth = await getOwnerFromRequest(request);

    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const { data: youthRows, error: youthError } = await supabaseAdmin
      .from("youth")
      .select(
        `
          id,
          name,
          office,
          active,
          user_id,
          ward_id
        `,
      )
      .eq("ward_id", wardId)
      .eq("active", true)
      .order("name", {
        ascending: true,
      });

    if (youthError) {
      console.error("Error cargando jóvenes:", youthError);

      return Response.json(
        {
          error: "No se pudieron cargar los jóvenes.",
        },
        { status: 500 },
      );
    }

    const youth = await Promise.all(
      (youthRows ?? []).map(async (person) => {
        let email = null;

        if (person.user_id) {
          const {
            data: { user },
            error: userError,
          } = await supabaseAdmin.auth.admin.getUserById(person.user_id);

          if (!userError) {
            email = user?.email ?? null;
          }
        }

        return {
          id: person.id,
          name: person.name,
          office: person.office,
          active: person.active,
          userId: person.user_id,
          email,
        };
      }),
    );

    return Response.json({
      youth,
    });
  } catch (error) {
    console.error("Error inesperado cargando jóvenes:", error);

    return Response.json(
      {
        error: "Ocurrió un error inesperado.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request, { params }) {
  let createdUserId = null;

  try {
    const { wardId } = await params;

    const auth = await getOwnerFromRequest(request);

    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    const office = typeof body.office === "string" ? body.office : "";

    if (!name) {
      return Response.json(
        {
          error: "Ingresá el nombre del joven.",
        },
        { status: 400 },
      );
    }

    if (!email) {
      return Response.json(
        {
          error: "Ingresá el correo del joven.",
        },
        { status: 400 },
      );
    }

    const validOffices = ["deacon", "teacher", "priest"];

    if (!validOffices.includes(office)) {
      return Response.json(
        {
          error: "Seleccioná un oficio válido.",
        },
        { status: 400 },
      );
    }

    const { data: ward, error: wardError } = await supabaseAdmin
      .from("wards")
      .select("id")
      .eq("id", wardId)
      .single();

    if (wardError || !ward) {
      return Response.json(
        {
          error: "El barrio no existe.",
        },
        { status: 404 },
      );
    }

    const { data: existingYouth } = await supabaseAdmin
      .from("youth")
      .select("id")
      .eq("ward_id", wardId)
      .ilike("name", name)
      .eq("active", true)
      .maybeSingle();

    if (existingYouth) {
      return Response.json(
        {
          error: "Ya existe un joven activo con ese nombre en este barrio.",
        },
        { status: 409 },
      );
    }

    const temporaryPassword = generateTemporaryPassword();

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: temporaryPassword,
        email_confirm: true,
      });

    if (authError || !authData.user) {
      console.error("Error creando usuario joven:", authError);

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
        role: "youth",
        ward_id: wardId,
      });

    if (profileError) {
      console.error("Error creando perfil del joven:", profileError);

      await supabaseAdmin.auth.admin.deleteUser(createdUserId);

      return Response.json(
        {
          error: "Se creó la cuenta pero no se pudo crear el perfil del joven.",
        },
        { status: 500 },
      );
    }

    const { data: youth, error: youthError } = await supabaseAdmin
      .from("youth")
      .insert({
        name,
        office,
        active: true,
        ward_id: wardId,
        user_id: createdUserId,
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
          error: "Se creó la cuenta pero no se pudo crear el joven.",
        },
        { status: 500 },
      );
    }

    return Response.json(
      {
        youth: {
          id: youth.id,
          name: youth.name,
          office: youth.office,
          active: youth.active,
          userId: youth.user_id,
          email,
        },
        temporaryPassword,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error inesperado creando joven:", error);

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
