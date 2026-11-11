"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

async function requestClasses(options = {}) {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!session) throw new Error("No hay una sesión válida.");

  const response = await fetch("/api/sunday-school/classes", {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "No se pudo completar la operación.");
  return data;
}

export default function useSundaySchoolClasses(wardId) {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const requestId = useRef(0);
  const editSnapshot = useRef({ pending: true, classes: [] });

  const loadClasses = useCallback(() => {
    const currentRequest = ++requestId.current;
    editSnapshot.current.pending = true;

    return requestClasses()
      .then((data) => {
        if (currentRequest !== requestId.current) return;
        editSnapshot.current.classes = data.classes;
        setClasses(data.classes);
        setTeachers(data.teachers ?? []);
        setError(null);
      })
      .catch((error) => {
        if (currentRequest === requestId.current) {
          editSnapshot.current.classes = [];
          setClasses((current) => current.map((item) => ({ ...item, aids: undefined })));
          setError(error.message);
        }
      })
      .finally(() => {
        if (currentRequest === requestId.current) {
          editSnapshot.current.pending = false;
          setLoading(false);
          setRefreshing(false);
        }
      });
  }, []);

  const refresh = () => {
    setRefreshing(true);
    return loadClasses();
  };

  useEffect(() => {
    let active = true;
    const currentEditSnapshot = editSnapshot.current;
    loadClasses();
    const handleClassChange = () => {
      if (!active) return;
      setRefreshing(true);
      // Drop cached aids immediately, since the teacher may have changed.
      setClasses((current) => current.map((item) => ({ ...item, aids: undefined })));
      loadClasses();
    };
    const channel = supabase.channel(`sunday-school-${wardId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "sunday_school_classes",
        filter: `ward_id=eq.${wardId}`,
      }, handleClassChange)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "sunday_school_classes",
        filter: `ward_id=eq.${wardId}`,
      }, handleClassChange)
      // DELETE events cannot be filtered by ward reliably. Refetch the API,
      // which always scopes its response to the authenticated user's ward.
      .on("postgres_changes", {
        event: "DELETE",
        schema: "public",
        table: "sunday_school_classes",
      }, handleClassChange)
      .subscribe((status) => {
        if (status === "SUBSCRIBED") handleClassChange();
      });

    return () => {
      active = false;
      currentEditSnapshot.pending = true;
      requestId.current += 1;
      supabase.removeChannel(channel);
    };
  }, [wardId, loadClasses]);

  const saveClass = async (values) => {
    await requestClasses({
      method: values.id ? "PATCH" : "POST",
      body: JSON.stringify(values),
    });
    await refresh();
  };

  const deleteClass = async (id) => {
    await requestClasses({
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    requestId.current += 1;
    setClasses((current) => current.filter((item) => item.id !== id));
    await refresh();
  };

  const getClassForEditing = (id) => {
    // Check the live request state too: an onClick from the previous render
    // must not open a form while Realtime is revalidating the private aids.
    if (editSnapshot.current.pending) return null;
    return editSnapshot.current.classes.find((item) => item.id === id) ?? null;
  };

  return {
    classes,
    teachers,
    loading,
    refreshing,
    error,
    refresh,
    saveClass,
    deleteClass,
    getClassForEditing,
  };
}
