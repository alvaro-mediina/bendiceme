"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ChevronRight, Plus } from "lucide-react";
import { motion } from "motion/react";
import { supabase } from "@/lib/supabase";
import { fadeUp, staggerContainer } from "@/lib/animations";
import YouthSelectorSkeleton from "../youth/youth-selector-skeleton";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { getOfficeLabel } from "@/lib/youth";

export default function AdvisorYouth({ wardId }) {
  const [search, setSearch] = useState("");
  const [youth, setYouth] = useState([]);
  const [loadingYouth, setLoadingYouth] = useState(true);
  const [youthError, setYouthError] = useState(null);
  const [selectedYouth, setSelectedYouth] = useState(null);
  const [editingYouth, setEditingYouth] = useState(false);
  const [editName, setEditName] = useState("");
  const [editOffice, setEditOffice] = useState("teacher");
  const [savingYouth, setSavingYouth] = useState(false);
  const [editError, setEditError] = useState(null);
  const [deactivatingYouth, setDeactivatingYouth] = useState(false);
  const [deactivateError, setDeactivateError] = useState(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [creatingYouth, setCreatingYouth] = useState(false);
  const [newName, setNewName] = useState("");
  const [newOffice, setNewOffice] = useState("deacon");
  const [creatingYouthLoading, setCreatingYouthLoading] = useState(false);
  const [createYouthError, setCreateYouthError] = useState(null);

  useEffect(() => {
    if (!wardId) {
      return;
    }

    const loadYouth = async () => {
      setLoadingYouth(true);
      setYouthError(null);

      const { data, error } = await supabase
        .from("youth")
        .select(
          `
                    id,
                    name,
                    office,
                    active
                `,
        )
        .eq("ward_id", wardId)
        .eq("active", true)
        .order("name", {
          ascending: true,
        });

      if (error) {
        console.error("Error cargando jóvenes:", error);

        setYouthError("No se pudieron cargar los jóvenes.");

        setLoadingYouth(false);
        return;
      }

      setYouth(data ?? []);
      setLoadingYouth(false);
    };

    loadYouth();
  }, [wardId]);

  const filteredYouth = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return youth;
    }

    return youth.filter((person) => person.name.toLowerCase().includes(query));
  }, [search, youth]);

  const activeYouthCount = youth.length;

  const handleSaveYouth = async () => {
    if (!selectedYouth) {
      return;
    }

    const trimmedName = editName.trim();

    if (!trimmedName) {
      setEditError("El nombre no puede estar vacío.");

      return;
    }

    setSavingYouth(true);
    setEditError(null);

    const { data, error } = await supabase
      .from("youth")
      .update({
        name: trimmedName,
        office: editOffice,
      })
      .eq("id", selectedYouth.id)
      .eq("ward_id", wardId)
      .select(
        `
                id,
                name,
                office,
                active
            `,
      )
      .single();

    if (error) {
      console.error("Error actualizando joven:", error);

      setEditError("No se pudo actualizar el joven.");

      setSavingYouth(false);
      return;
    }

    setYouth((current) =>
      current.map((person) => (person.id === data.id ? data : person)),
    );

    setSelectedYouth(data);

    setEditingYouth(false);
    setSavingYouth(false);
  };

  const handleDeactivateYouth = async () => {
    if (!selectedYouth) {
      return;
    }

    setDeactivatingYouth(true);
    setDeactivateError(null);

    const { error } = await supabase
      .from("youth")
      .update({
        active: false,
      })
      .eq("id", selectedYouth.id)
      .eq("ward_id", wardId);

    if (error) {
      console.error("Error desactivando joven:", error);

      setDeactivateError("No se pudo desactivar el joven.");

      setDeactivatingYouth(false);
      return;
    }

    setYouth((current) =>
      current.filter((person) => person.id !== selectedYouth.id),
    );

    setSelectedYouth(null);
    setEditingYouth(false);
    setDeactivatingYouth(false);
  };

  const handleCreateYouth = async () => {
    const trimmedName = newName.trim();

    if (!trimmedName) {
      setCreateYouthError("El nombre no puede estar vacío.");
      return;
    }

    const normalizedName = trimmedName.toLowerCase();

    const alreadyExists = youth.some(
      (person) => person.name.trim().toLowerCase() === normalizedName,
    );

    if (alreadyExists) {
      setCreateYouthError("Ya existe un joven con ese nombre.");
      return;
    }

    setCreatingYouthLoading(true);
    setCreateYouthError(null);

    const { data, error } = await supabase
      .from("youth")
      .insert({
        name: trimmedName,
        office: newOffice,
        active: true,
        ward_id: wardId,
      })
      .select(
        `
      id,
      name,
      office,
      active
    `,
      )
      .single();

    if (error) {
      console.error("Error agregando joven:", error);

      setCreateYouthError("No se pudo agregar el joven.");

      setCreatingYouthLoading(false);
      return;
    }

    setYouth((current) =>
      [...current, data].sort((a, b) =>
        a.name.localeCompare(b.name, "es", {
          sensitivity: "base",
        }),
      ),
    );

    setCreatingYouth(false);
    setCreatingYouthLoading(false);
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={fadeUp}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
          Jóvenes
        </p>

        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
          Tus jóvenes
        </h1>

        {loadingYouth ? (
          <div className="mt-2 h-4 w-28 animate-pulse rounded-lg bg-gray-200" />
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            {activeYouthCount} jóvenes activos
          </p>
        )}
      </motion.div>

      <motion.div variants={fadeUp} className="mt-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar joven..."
            className="
                            h-12 w-full rounded-2xl border
                            bg-white pl-10 pr-4
                            text-sm outline-none
                            transition-colors
                            placeholder:text-muted-foreground
                            focus:border-green-300
                        "
          />
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="mt-6">
        <div className="flex flex-col gap-3">
          {loadingYouth ? (
            <YouthSelectorSkeleton />
          ) : youthError ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {youthError}
            </div>
          ) : (
            <motion.div variants={fadeUp}>
              <div className="flex flex-col gap-3">
                {filteredYouth.map((person) => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => setSelectedYouth(person)}
                    className="
                                                flex w-full
                                                items-center
                                                justify-between
                                                rounded-2xl border
                                                bg-white p-4
                                                text-left
                                                transition-colors
                                                hover:border-green-200
                                                hover:bg-green-50/30
                                            "
                  >
                    <div>
                      <p className="font-semibold">{person.name}</p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {getOfficeLabel(person.office)}
                      </p>
                    </div>

                    <ChevronRight className="size-5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="mt-6">
        <button
          type="button"
          onClick={() => {
            setNewName("");
            setNewOffice("deacon");
            setCreateYouthError(null);
            setCreatingYouth(true);
          }}
          disabled={creatingYouthLoading}
          className="
                        flex h-12 w-full
                        items-center justify-center
                        gap-2 rounded-2xl
                        border border-green-200
                        bg-green-50
                        text-sm font-semibold
                        text-green-700
                        transition-colors
                        hover:bg-green-100
                    "
        >
          <Plus className="size-4" />
          Agregar joven
        </button>
      </motion.div>

      <Sheet
        open={Boolean(selectedYouth) || creatingYouth}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedYouth(null);
            setEditingYouth(false);
            setConfirmDeactivate(false);
            setCreatingYouth(false);
            setCreateYouthError(null);
          }
        }}
      >
        <SheetContent
          side="bottom"
          className="
                    rounded-t-[28px]
                    px-5 pb-8 pt-3

                    lg:data-[side=bottom]:left-1/2
                    lg:data-[side=bottom]:right-auto
                    lg:data-[side=bottom]:w-[520px]
                    lg:data-[side=bottom]:max-w-[calc(100vw-2rem)]
                    lg:data-[side=bottom]:-translate-x-1/2

                "
        >
          {creatingYouth ? (
            <>
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
                  Nuevo joven
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-tight">
                  Agregar joven
                </h2>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="text-sm font-medium">Nombre</label>

                  <input
                    type="text"
                    value={newName}
                    onChange={(event) => setNewName(event.target.value)}
                    placeholder="Nombre completo"
                    className="
										mt-2 h-12 w-full
										rounded-2xl border
										bg-background px-4
										text-sm outline-none
										transition-colors
										focus:border-green-300
									"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Oficio</label>

                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {[
                      ["deacon", "Diácono"],
                      ["teacher", "Maestro"],
                      ["priest", "Presbítero"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setNewOffice(value)}
                        className={`
												h-12 rounded-2xl border
												text-sm font-semibold
												transition-colors
												${
                          newOffice === value
                            ? "border-green-600 bg-green-600 text-white"
                            : "bg-background hover:border-green-300 hover:bg-green-50/50"
                        }
											`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {createYouthError && (
                  <p className="text-sm font-medium text-red-600">
                    {createYouthError}
                  </p>
                )}
              </div>

              <div className="mt-7 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCreatingYouth(false)}
                  disabled={creatingYouthLoading}
                  className="
									h-12 flex-1
									rounded-2xl border
									bg-background
									text-sm font-semibold
									hover:bg-muted/50
								"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleCreateYouth}
                  disabled={creatingYouthLoading || !newName.trim()}
                  className="
									h-12 flex-1
									rounded-2xl
									bg-green-600
									text-sm font-semibold
									text-white
									hover:bg-green-700
									disabled:opacity-60
									disabled:cursor-not-allowed
								"
                >
                  {creatingYouthLoading ? "Agregando..." : "Agregar joven"}
                </button>
              </div>
            </>
          ) : selectedYouth ? (
            selectedYouth && (
              <>
                <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />

                {editingYouth ? (
                  <>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
                        Editar joven
                      </p>

                      <h2 className="mt-2 text-2xl font-bold tracking-tight">
                        {selectedYouth.name}
                      </h2>
                    </div>

                    <div className="mt-6 space-y-5">
                      <div>
                        <label className="text-sm font-medium">Nombre</label>

                        <input
                          type="text"
                          value={editName}
                          onChange={(event) => setEditName(event.target.value)}
                          className="
                                                mt-2 h-12 w-full
                                                rounded-2xl border
                                                bg-background px-4
                                                text-sm outline-none
                                                transition-colors
                                                focus:border-green-300
                                            "
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Oficio</label>

                        <div className="mt-2 grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setEditOffice("deacon")}
                            className={`
                                                    h-12 rounded-2xl border
                                                    text-sm font-semibold
                                                    transition-colors
                                                    ${
                                                      editOffice === "deacon"
                                                        ? "border-green-600 bg-green-600 text-white"
                                                        : "bg-background hover:border-green-300 hover:bg-green-50/50"
                                                    }
                                                `}
                          >
                            Diácono
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditOffice("teacher")}
                            className={`
                                                    h-12 rounded-2xl border
                                                    text-sm font-semibold
                                                    transition-colors
                                                    ${
                                                      editOffice === "teacher"
                                                        ? "border-green-600 bg-green-600 text-white"
                                                        : "bg-background hover:border-green-300 hover:bg-green-50/50"
                                                    }
                                                `}
                          >
                            Maestro
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditOffice("priest")}
                            className={`
                                                    h-12 rounded-2xl border
                                                    text-sm font-semibold
                                                    transition-colors
                                                    ${
                                                      editOffice === "priest"
                                                        ? "border-green-600 bg-green-600 text-white"
                                                        : "bg-background hover:border-green-300 hover:bg-green-50/50"
                                                    }
                                                `}
                          >
                            Presbítero
                          </button>
                        </div>
                      </div>
                    </div>

                    {editError && (
                      <p className="text-sm font-medium text-red-600">
                        {editError}
                      </p>
                    )}

                    <div className="mt-7 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingYouth(false)}
                        className="
                                            h-12 flex-1
                                            rounded-2xl border
                                            bg-background
                                            text-sm font-semibold
                                            transition-colors
                                            hover:bg-muted/50
                                        "
                      >
                        Cancelar
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveYouth}
                        disabled={savingYouth}
                        className="
                                            h-12 flex-1
                                            rounded-2xl
                                            bg-green-600
                                            text-sm font-semibold
                                            text-white
                                            transition-colors
                                            hover:bg-green-700
                                            disabled:cursor-not-allowed
                                            disabled:opacity-60
                                        "
                      >
                        {savingYouth ? "Guardando..." : "Guardar cambios"}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col items-center text-center">
                      <div className="grid size-16 place-items-center rounded-full bg-green-100 text-lg font-bold text-green-700">
                        {selectedYouth.name
                          .split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")}
                      </div>

                      <h2 className="mt-4 text-2xl font-bold tracking-tight">
                        {selectedYouth.name}
                      </h2>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {getOfficeLabel(selectedYouth.office)}
                      </p>

                      <span className="mt-3 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        Activo
                      </span>
                    </div>

                    <div className="mt-7">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Datos
                      </p>

                      <div className="mt-3 overflow-hidden rounded-2xl border bg-background">
                        <div className="flex items-center justify-between gap-4 border-b px-4 py-3.5">
                          <span className="text-sm text-muted-foreground">
                            Nombre
                          </span>

                          <span className="text-right text-sm font-medium">
                            {selectedYouth.name}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                          <span className="text-sm text-muted-foreground">
                            Oficio
                          </span>

                          <span className="text-right text-sm font-medium">
                            {selectedYouth.office === "priest"
                              ? "Presbítero"
                              : "Maestro"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {deactivateError && (
                      <p className="text-center text-sm font-medium text-red-600">
                        {deactivateError}
                      </p>
                    )}

                    <div className="mt-7 space-y-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditName(selectedYouth.name);

                          setEditOffice(selectedYouth.office);

                          setEditingYouth(true);
                        }}
                        className="
                                            h-12 w-full rounded-2xl
                                            bg-green-600
                                            text-sm font-semibold
                                            text-white
                                            transition-colors
                                            hover:bg-green-700
                                        "
                      >
                        Editar joven
                      </button>

                      {confirmDeactivate ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                          <p className="text-sm font-semibold text-red-700">
                            ¿Desactivar a {selectedYouth.name}?
                          </p>

                          <p className="mt-1 text-sm text-red-600">
                            Ya no aparecerá entre los jóvenes activos.
                          </p>

                          <div className="mt-4 flex gap-3">
                            <button
                              type="button"
                              onClick={() => setConfirmDeactivate(false)}
                              disabled={deactivatingYouth}
                              className="
														h-11 flex-1 rounded-xl
														border bg-white
														text-sm font-semibold
														transition-colors
														hover:bg-muted/50
													"
                            >
                              Cancelar
                            </button>

                            <button
                              type="button"
                              onClick={handleDeactivateYouth}
                              disabled={deactivatingYouth}
                              className="
														h-11 flex-1 rounded-xl
														bg-red-600
														text-sm font-semibold
														text-white
														transition-colors
														hover:bg-red-700
														disabled:cursor-not-allowed
														disabled:opacity-60
													"
                            >
                              {deactivatingYouth
                                ? "Desactivando..."
                                : "Sí, desactivar"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeactivate(true)}
                          className="
												h-12 w-full rounded-2xl
												border border-red-200
												bg-red-50
												text-sm font-semibold
												text-red-700
												transition-colors
												hover:bg-red-100
											"
                        >
                          Desactivar joven
                        </button>
                      )}
                    </div>
                  </>
                )}
              </>
            )
          ) : null}
        </SheetContent>
      </Sheet>
    </motion.section>
  );
}
