"use client";

import { useState } from "react";
import { BookOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import useSundaySchoolClasses from "@/hooks/use-sunday-school-classes";
import { formatSunday, getVisibleSundays } from "@/lib/sundays";
import ClassPreparation from "./class-preparation";

const emptyClass = { date: "", topic: "", teacherYouthId: "" };
const inputClassName = "mt-2 w-full rounded-xl border bg-background px-3 py-2 text-base";

export default function SundaySchoolView({ wardId, canEdit = false }) {
  const { classes, teachers, loading, error, refresh, saveClass, deleteClass } = useSundaySchoolClasses(wardId);
  const [formOpen, setFormOpen] = useState(false);
  const [values, setValues] = useState(emptyClass);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [classToDelete, setClassToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const now = new Date();
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
  const visibleClasses = canEdit ? classes : classes.filter((item) => item.date >= today);
  const { dates: availableSundays } = getVisibleSundays(
    new Date(),
    "America/Argentina/Cordoba",
  );

  const openForm = (item) => {
    setValues(item ? {
      id: item.id,
      date: availableSundays.includes(item.date) ? item.date : "",
      topic: item.topic,
      teacherYouthId: teachers.some((teacher) => String(teacher.id) === String(item.teacher_youth_id))
        ? String(item.teacher_youth_id)
        : "",
      aids: {
        scriptures: item.aids?.scriptures ?? "",
        keyTips: item.aids?.keyTips ?? "",
      },
    } : emptyClass);
    setSaveError(null);
    setFormOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    const { dates } = getVisibleSundays(new Date(), "America/Argentina/Cordoba");
    if (!dates.includes(values.date)) {
      setSaveError("Seleccioná uno de los domingos disponibles.");
      return;
    }
    if (!teachers.some((teacher) => String(teacher.id) === values.teacherYouthId)) {
      setSaveError("Seleccioná un joven de tu barrio como maestro.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await saveClass(values);
      setFormOpen(false);
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!classToDelete || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteClass(classToDelete.id);
      setClassToDelete(null);
    } catch (error) {
      setDeleteError(error.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section>
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">Clases de tu barrio</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Escuela Dominical</h1>
      </header>

      {canEdit && (
        <Button className="mt-6 h-12 w-full rounded-2xl bg-green-600 px-4 text-base font-semibold text-white hover:bg-green-700" onClick={() => openForm()}>
          <Plus className="size-4" /> Nueva clase
        </Button>
      )}

      {error && (
        <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <p>{error}</p>
          <button type="button" onClick={refresh} className="mt-2 font-semibold underline">Volver a intentar</button>
        </div>
      )}

      {loading ? (
        <div aria-label="Cargando clases" className="mt-6 rounded-2xl border p-5">
          <div className="h-4 w-40 rounded skeleton-shimmer" />
          <div className="mt-3 h-6 w-3/4 rounded skeleton-shimmer" />
          <div className="mt-3 h-4 w-1/2 rounded skeleton-shimmer" />
        </div>
      ) : visibleClasses.length > 0 ? (
        <div className="mt-6 space-y-3">
          {visibleClasses.map((item) => (
            <article
              key={item.id}
              className={`rounded-2xl border p-5 ${item.isAssignedToMe ? "border-green-200 bg-green-50/60" : "bg-card"}`}
            >
              {item.isAssignedToMe && (
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-green-800">
                  <BookOpen className="size-4 shrink-0" />
                  Te toca enseñar
                </p>
              )}
              <p className="text-sm font-medium text-green-700">
                {new Date(item.date + "T00:00:00")
                  .toLocaleDateString("es-AR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                  .replace(/^./, (letter) => letter.toUpperCase())}
              </p>
              <h2 className="mt-2 break-words text-lg font-semibold">{item.topic}</h2>
              {!item.isAssignedToMe && (
                <p className="mt-2 break-words text-sm text-muted-foreground">
                  La clase la da {item.teacher_name}
                </p>
              )}
              {item.isAssignedToMe && <ClassPreparation aids={item.aids} />}
              {canEdit && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-12 w-full min-w-0 gap-1.5 rounded-2xl px-2 text-xs font-semibold sm:text-sm"
                    onClick={() => openForm(item)}
                  >
                    <Pencil className="size-4" /> Editar clase
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 w-full min-w-0 gap-1.5 rounded-2xl border-red-200 px-2 text-xs font-semibold text-red-700 hover:bg-red-50 hover:text-red-800 sm:text-sm"
                    onClick={() => {
                      setDeleteError(null);
                      setClassToDelete(item);
                    }}
                  >
                    <Trash2 className="size-4" /> Eliminar clase
                  </Button>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : !error && (
        <div className="mt-6 rounded-2xl border border-dashed p-6 text-center">
          <BookOpen className="mx-auto size-7 text-green-700" />
          <p className="mt-3 text-sm text-muted-foreground">
            {canEdit ? "Todavía no hay clases publicadas. Creá la primera clase de tu barrio." : "Todavía no hay próximas clases publicadas."}
          </p>
        </div>
      )}

      {canEdit && (
        <Sheet
          open={classToDelete !== null}
          onOpenChange={(open) => {
            if (!open && !deleting) setClassToDelete(null);
          }}
        >
          <SheetContent
            side="bottom"
            className="max-h-[85dvh] overflow-y-auto rounded-t-[28px] p-5 sm:mx-auto sm:max-w-xl"
          >
            <SheetTitle className="text-2xl font-semibold">Eliminar clase</SheetTitle>
            <SheetDescription>
              Esta acción elimina la clase para todos los jóvenes de tu barrio y no se puede deshacer.
            </SheetDescription>
            {classToDelete && (
              <div className="mt-4 rounded-2xl border p-4">
                <p className="break-words font-semibold">{classToDelete.topic}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatSunday(classToDelete.date)}
                </p>
              </div>
            )}
            {deleteError && (
              <p role="alert" className="mt-3 text-sm text-red-600">{deleteError}</p>
            )}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-12 w-full rounded-2xl px-2 text-sm font-semibold"
                disabled={deleting}
                onClick={() => setClassToDelete(null)}
              >
                Cancelar
              </Button>
              <Button
                disabled={deleting}
                className="h-12 w-full gap-1.5 rounded-2xl bg-red-600 px-2 text-sm font-semibold text-white hover:bg-red-700"
                onClick={confirmDelete}
              >
                <Trash2 className="size-4" />
                {deleting ? "Eliminando..." : "Eliminar clase"}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {canEdit && (
        <Sheet open={formOpen} onOpenChange={(open) => { if (!saving) setFormOpen(open); }}>
          <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-[28px] p-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-auto sm:max-w-xl">
            <SheetTitle className="text-2xl font-semibold">{values.id ? "Editar clase" : "Nueva clase"}</SheetTitle>
            <SheetDescription>Publicá la fecha, el tema y el maestro para los jóvenes de tu barrio.</SheetDescription>
            <form onSubmit={submit} className="mt-5 space-y-4">
              <fieldset disabled={saving} className="space-y-4">
                <label className="block text-sm font-medium">
                  Domingo
                  <select
                    required
                    disabled={availableSundays.length === 0}
                    value={values.date}
                    onChange={(event) => {
                      setValues((current) => ({ ...current, date: event.target.value }));
                      setSaveError(null);
                    }}
                    className={inputClassName}
                  >
                    <option value="">Seleccioná un domingo</option>
                    {availableSundays.map((date) => (
                      <option key={date} value={date}>
                        {formatSunday(date)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium">
                  Tema
                  <input required maxLength={200} value={values.topic} onChange={(event) => setValues({ ...values, topic: event.target.value })} className={inputClassName} />
                </label>
                <label className="block text-sm font-medium">
                  Maestro
                  <select
                    required
                    disabled={loading || teachers.length === 0}
                    value={values.teacherYouthId}
                    onChange={(event) => {
                      setValues((current) => ({ ...current, teacherYouthId: event.target.value }));
                      setSaveError(null);
                    }}
                    className={inputClassName}
                  >
                    <option value="">
                      {loading ? "Cargando jóvenes..." : "Seleccioná un joven"}
                    </option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={String(teacher.id)}>
                        {teacher.name}{teacher.active === false ? " (inactivo)" : ""}
                      </option>
                    ))}
                  </select>
                </label>
                {values.id && (
                  <section className="space-y-4 border-t pt-5">
                    <div>
                      <h2 className="text-base font-semibold">Ayudas para preparar la clase</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Sólo el joven asignado y los asesores de su barrio pueden ver estas ayudas.
                      </p>
                    </div>
                    <label className="block text-sm font-medium">
                      Escrituras
                      <textarea
                        rows={4}
                        maxLength={4000}
                        value={values.aids.scriptures}
                        onChange={(event) => setValues((current) => ({
                          ...current,
                          aids: { ...current.aids, scriptures: event.target.value },
                        }))}
                        className={`${inputClassName} min-h-28 resize-y`}
                      />
                    </label>
                    <label className="block text-sm font-medium">
                      Consejos clave
                      <textarea
                        rows={5}
                        maxLength={8000}
                        value={values.aids.keyTips}
                        onChange={(event) => setValues((current) => ({
                          ...current,
                          aids: { ...current.aids, keyTips: event.target.value },
                        }))}
                        className={`${inputClassName} min-h-32 resize-y`}
                      />
                    </label>
                  </section>
                )}
              </fieldset>
              {!loading && !error && teachers.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No hay jóvenes registrados en tu barrio. Agregá un joven para asignarlo como maestro.
                </p>
              )}
              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              {saveError && <p role="alert" className="text-sm text-red-600">{saveError}</p>}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-full rounded-2xl px-2 text-sm font-semibold"
                  disabled={saving}
                  onClick={() => setFormOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving || loading || Boolean(error) || teachers.length === 0}
                  className="h-12 w-full rounded-2xl bg-green-600 px-2 text-sm font-semibold text-white hover:bg-green-700"
                >
                  {saving ? "Guardando..." : values.id ? "Guardar cambios" : "Publicar clase"}
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      )}
    </section>
  );
}
