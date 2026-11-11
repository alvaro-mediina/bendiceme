import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVisibleSundays } from "@/lib/sundays";

const fields = "id, ward_id, date, topic, teacher_name, teacher_youth_id";

async function getAccess(request, editing = false) {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return { error: "No hay una sesión válida.", status: 401 };

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return { error: "No hay una sesión válida.", status: 401 };

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles").select("role, ward_id").eq("user_id", user.id).maybeSingle();
  if (profileError) throw profileError;

  const roles = editing ? ["advisor", "owner"] : ["youth", "advisor", "owner"];
  if (!profile?.ward_id || !roles.includes(profile.role)) {
    return { error: "No tenés permiso para esta operación.", status: 403 };
  }

  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );

  return {
    wardId: profile.ward_id,
    userId: user.id,
    canEdit: ["advisor", "owner"].includes(profile.role),
    userClient,
  };
}

function validateClass(body) {
  const date = typeof body.date === "string" ? body.date : "";
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  const teacherYouthId = String(body.teacherYouthId ?? "").trim();
  const parsedDate = new Date(date + "T00:00:00Z");

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isFinite(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== date ||
    parsedDate.getUTCDay() !== 0
  ) {
    return { error: "Elegí una fecha válida que sea domingo." };
  }
  const { dates } = getVisibleSundays(new Date(), "America/Argentina/Cordoba");
  if (!dates.includes(date)) {
    return { error: "Seleccioná uno de los domingos disponibles." };
  }

  if (!topic || topic.length > 200) {
    return { error: "Ingresá un tema de hasta 200 caracteres." };
  }
  const validTeacherId = /^[1-9]\d*$/.test(teacherYouthId) ||
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(teacherYouthId);
  if (!validTeacherId) {
    return { error: "Seleccioná un joven de tu barrio como maestro." };
  }
  return { values: { date, topic, teacher_youth_id: teacherYouthId } };
}

function validateAids(body, editing) {
  if (!editing && body.aids !== undefined) {
    return { error: "Agregá las ayudas desde Editar clase, después de publicarla." };
  }

  if (!editing || body.aids === undefined) return {};
  if (body.aids === null || typeof body.aids !== "object" || Array.isArray(body.aids)) {
    return { error: "Las ayudas de la clase son inválidas." };
  }

  const { scriptures, keyTips } = body.aids;
  if (typeof scriptures !== "string" || scriptures.length > 4000) {
    return { error: "Escrituras debe tener hasta 4000 caracteres." };
  }
  if (typeof keyTips !== "string" || keyTips.length > 8000) {
    return { error: "Consejos clave debe tener hasta 8000 caracteres." };
  }

  return { values: { scriptures: scriptures.trim(), key_tips: keyTips.trim() } };
}

export async function GET(request) {
  try {
    const access = await getAccess(request);
    if (access.error) return Response.json({ error: access.error }, { status: access.status });

    const { data, error } = await supabaseAdmin.from("sunday_school_classes")
      .select(fields).eq("ward_id", access.wardId)
      .order("date").order("id");
    if (error) throw error;

    let teachers = [];
    if (access.canEdit) {
      const { data: youth, error: youthError } = await supabaseAdmin
        .from("youth")
        .select("id, name, active")
        .eq("ward_id", access.wardId)
        .order("name");
      if (youthError) throw youthError;
      teachers = youth ?? [];
    }

    let currentYouthId = null;
    if (!access.canEdit) {
      const { data: youth, error: youthError } = await supabaseAdmin
        .from("youth")
        .select("id")
        .eq("user_id", access.userId)
        .eq("ward_id", access.wardId)
        .maybeSingle();
      if (youthError) throw youthError;
      currentYouthId = youth?.id ?? null;
    }

    const classes = data ?? [];
    const assignedToMe = (item) =>
      currentYouthId !== null && String(item.teacher_youth_id) === String(currentYouthId);
    const privateClassIds = classes
      .filter((item) => access.canEdit || assignedToMe(item))
      .map((item) => item.id);

    let aids = [];
    if (privateClassIds.length > 0) {
      // Use the caller's session so RLS checks the current assignment again,
      // including a reassignment that happened after loading the class list.
      const { data: privateData, error: aidsError } = await access.userClient
        .from("sunday_school_class_aids")
        .select("class_id, scriptures, key_tips")
        .in("class_id", privateClassIds);
      if (aidsError) throw aidsError;
      aids = privateData ?? [];
    }
    const aidsByClass = new Map(aids.map((item) => [item.class_id, item]));

    return Response.json(
      {
        classes: classes.map((item) => {
          const result = { ...item, isAssignedToMe: assignedToMe(item) };
          const classAids = aidsByClass.get(item.id);
          if (classAids) {
            result.aids = {
              scriptures: classAids.scriptures,
              keyTips: classAids.key_tips,
            };
          }
          return result;
        }),
        teachers,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Error cargando clases:", error);
    return Response.json({ error: "No se pudieron cargar las clases." }, { status: 500 });
  }
}

async function saveClass(request, editing) {
  try {
    const access = await getAccess(request, true);
    if (access.error) return Response.json({ error: access.error }, { status: access.status });

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Datos inválidos." }, { status: 400 });
    }

    const validation = validateClass(body ?? {});
    if (validation.error) return Response.json({ error: validation.error }, { status: 400 });
    const aidsValidation = validateAids(body, editing);
    if (aidsValidation.error) {
      return Response.json({ error: aidsValidation.error }, { status: 400 });
    }
    if (editing && (typeof body.id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.id))) {
      return Response.json({ error: "Clase inválida." }, { status: 400 });
    }

    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from("youth")
      .select("id, name")
      .eq("id", validation.values.teacher_youth_id)
      .eq("ward_id", access.wardId)
      .maybeSingle();
    if (teacherError) throw teacherError;
    if (!teacher) {
      return Response.json(
        { error: "El maestro seleccionado no pertenece a tu barrio o ya no está registrado." },
        { status: 400 },
      );
    }

    const values = {
      ...validation.values,
      teacher_youth_id: teacher.id,
      teacher_name: teacher.name,
    };

    let result;
    if (editing && aidsValidation.values) {
      result = await supabaseAdmin.rpc("update_sunday_school_class_with_aids", {
        p_class_id: body.id,
        p_ward_id: String(access.wardId),
        p_values: values,
        p_scriptures: aidsValidation.values.scriptures,
        p_key_tips: aidsValidation.values.key_tips,
      }).maybeSingle();
    } else {
      const query = editing
        ? supabaseAdmin.from("sunday_school_classes").update(values)
          .eq("id", body.id).eq("ward_id", access.wardId)
        : supabaseAdmin.from("sunday_school_classes").insert({
          ...values, ward_id: access.wardId,
        });
      result = await query.select(fields).maybeSingle();
    }

    const { data, error } = result;
    if (error) throw error;
    if (!data) return Response.json({ error: "No se encontró la clase en tu barrio." }, { status: 404 });

    return Response.json({ class: data }, { status: editing ? 200 : 201 });
  } catch (error) {
    console.error("Error guardando clase:", error);
    return Response.json({ error: "No se pudo guardar la clase." }, { status: 500 });
  }
}

export async function POST(request) {
  return saveClass(request, false);
}

export async function PATCH(request) {
  return saveClass(request, true);
}

export async function DELETE(request) {
  try {
    const access = await getAccess(request, true);
    if (access.error) {
      return Response.json({ error: access.error }, { status: access.status });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Datos inválidos." }, { status: 400 });
    }

    const id = body?.id;
    if (typeof id !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return Response.json({ error: "Clase inválida." }, { status: 400 });
    }

    // Repeating a successful deletion is safe, even if the class is already gone.
    const { error } = await supabaseAdmin
      .from("sunday_school_classes")
      .delete()
      .eq("id", id)
      .eq("ward_id", access.wardId);
    if (error) throw error;

    return Response.json({ success: true, id });
  } catch (error) {
    console.error("Error eliminando clase:", error);
    return Response.json({ error: "No se pudo eliminar la clase." }, { status: 500 });
  }
}
