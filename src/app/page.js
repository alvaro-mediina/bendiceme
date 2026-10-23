"use client";

import { useState, useEffect } from "react";
import YouthHome from "@/components/youth/youth-home";
import AvailabilitySaved from "@/components/youth/availability-saved";
import YouthAssignments from "@/components/youth/youth-assignments";
import AdvisorView from "@/components/advisor/advisor-view";
import RoleSelector from "@/components/access/role-selector";
import AdvisorLogin from "@/components/advisor/advisor-login";
import useCurrentYouth from "@/hooks/use-current-youth";
import PageContainer from "@/components/layout/page-container";
import useCurrentProfile from "@/hooks/use-current-profile";
import YouthLogin from "@/components/youth/youth-login";
import AdvisorViewSkeleton from "@/components/advisor/advisor-view-skeleton";
import MaintenanceScreen from "@/components/maintenance-screen";
import { supabase } from "@/lib/supabase";

export default function Page() {
  const [screen, setScreen] = useState("role");
  const [advisorEmail, setAdvisorEmail] = useState("");
  const [advisorPassword, setAdvisorPassword] = useState("");
  const [advisorError, setAdvisorError] = useState(null);
  const {
    currentYouth,
    youthStartScreen,
    loadingYouthSession,
    refreshCurrentYouth,
    clearYouth,
  } = useCurrentYouth();
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [checkingAdvisorSession, setCheckingAdvisorSession] = useState(true);
  const [youthEmail, setYouthEmail] = useState("");
  const [youthPassword, setYouthPassword] = useState("");
  const [youthLoginError, setYouthLoginError] = useState(null);
  const [youthLoginLoading, setYouthLoginLoading] = useState(false);
  const [youthLogoutLoading, setYouthLogoutLoading] = useState(false);
  const { profile, loadingProfile, profileError } = useCurrentProfile();

  useEffect(() => {
    if (loadingYouthSession) {
      return;
    }

    if (currentYouth) {
      setScreen(youthStartScreen === "saved" ? "saved" : "home");
    }
  }, [loadingYouthSession, currentYouth, youthStartScreen]);

  useEffect(() => {
    const restoreAdvisorScreen = async () => {
      const advisorWasActive =
        sessionStorage.getItem("bendiceme-advisor-active") === "true";

      if (!advisorWasActive) {
        setCheckingAdvisorSession(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setScreen("advisor");
      } else {
        sessionStorage.removeItem("bendiceme-advisor-active");
      }

      setCheckingAdvisorSession(false);
    };

    restoreAdvisorScreen();
  }, []);

  if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true") {
    return <MaintenanceScreen />;
  }

  if (loadingYouthSession || checkingAdvisorSession) {
    return (
      <main
        className="
        mx-auto min-h-dvh w-full max-w-2xl
        px-4 pb-8 pt-5 sm:px-6 lg:pt-8
      "
      >
        <AdvisorViewSkeleton />
      </main>
    );
  }

  const handleYouthLogin = async (event) => {
    event.preventDefault();

    setYouthLoginLoading(true);
    setYouthLoginError(null);

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: youthEmail,
        password: youthPassword,
      });

    if (authError) {
      console.error("Error login joven:", authError);

      setYouthLoginError("El correo o la contraseña no son correctos.");

      setYouthLoginLoading(false);
      return;
    }

    const user = authData.user;

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select(
        `
            user_id,
            role,
            ward_id
        `,
      )
      .eq("user_id", user.id)
      .single();

    if (profileError || !profileData) {
      console.error("Error cargando perfil del joven:", profileError);

      await supabase.auth.signOut();

      setYouthLoginError("No se encontró un perfil asociado a esta cuenta.");

      setYouthLoginLoading(false);
      return;
    }

    if (profileData.role !== "youth") {
      await supabase.auth.signOut();

      setYouthLoginError("Esta cuenta no corresponde a un joven.");

      setYouthLoginLoading(false);
      return;
    }

    const { data: youthData, error: youthError } = await supabase
      .from("youth")
      .select("*")
      .eq("user_id", user.id)
      .eq("ward_id", profileData.ward_id)
      .single();

    if (youthError || !youthData) {
      console.error("Error cargando joven:", youthError);

      await supabase.auth.signOut();

      setYouthLoginError("Esta cuenta todavía no está vinculada a un joven.");

      setYouthLoginLoading(false);
      return;
    }

    const restoredYouth = await refreshCurrentYouth();

    if (!restoredYouth) {
      await supabase.auth.signOut({
        scope: "local",
      });

      setYouthLoginError("No se pudo cargar la cuenta del joven.");

      setYouthLoginLoading(false);
      return;
    }

    setYouthEmail("");
    setYouthPassword("");

    setYouthLoginLoading(false);

    setScreen(restoredYouth.startScreen);
  };

  if (screen === "role") {
    return (
      <PageContainer center>
        <RoleSelector
          onYouth={() => {
            setYouthEmail("");
            setYouthPassword("");
            setYouthLoginError(null);
            setYouthLogoutLoading(false);

            setScreen("youth-login");
          }}
          onAdvisor={async () => {
            setAdvisorEmail("");
            setAdvisorError(null);
            setAdvisorPassword("");

            const {
              data: { session },
            } = await supabase.auth.getSession();

            if (session) {
              sessionStorage.setItem("bendiceme-advisor-active", "true");

              setScreen("advisor");
              return;
            }

            setScreen("advisor-login");
          }}
        />
      </PageContainer>
    );
  }

  if (screen === "advisor-login") {
    return (
      <PageContainer center>
        <AdvisorLogin
          email={advisorEmail}
          password={advisorPassword}
          error={advisorError}
          loading={advisorLoading}
          onEmailChange={setAdvisorEmail}
          onPasswordChange={setAdvisorPassword}
          onBack={() => {
            setAdvisorEmail("");
            setAdvisorPassword("");
            setAdvisorError(null);
            setScreen("role");
          }}
          onSubmit={async (event) => {
            event.preventDefault();

            setAdvisorLoading(true);
            setAdvisorError(null);

            const { data: authData, error: authError } =
              await supabase.auth.signInWithPassword({
                email: advisorEmail.trim(),
                password: advisorPassword,
              });

            if (authError) {
              console.error("Error login asesor:", authError);

              setAdvisorError("El correo o la contraseña no son correctos.");

              setAdvisorLoading(false);
              return;
            }

            const user = authData.user;

            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select(
                `
        user_id,
        role,
        ward_id
      `,
              )
              .eq("user_id", user.id)
              .single();

            if (profileError || !profileData) {
              console.error("Error cargando perfil del asesor:", profileError);

              await supabase.auth.signOut({
                scope: "local",
              });

              setAdvisorError(
                "No se encontró un perfil asociado a esta cuenta.",
              );

              setAdvisorLoading(false);
              return;
            }

            if (!["advisor", "owner"].includes(profileData.role)) {
              await supabase.auth.signOut({
                scope: "local",
              });

              setAdvisorError("Esta cuenta no corresponde a un asesor.");

              setAdvisorLoading(false);
              return;
            }

            if (!profileData.ward_id) {
              await supabase.auth.signOut({
                scope: "local",
              });

              setAdvisorError(
                "Esta cuenta todavía no tiene un barrio asignado.",
              );

              setAdvisorLoading(false);
              return;
            }

            setAdvisorEmail("");
            setAdvisorPassword("");
            setAdvisorLoading(false);

            sessionStorage.setItem("bendiceme-advisor-active", "true");

            setScreen("advisor");
          }}
        />
      </PageContainer>
    );
  }

  if (screen === "advisor") {
    if (loadingProfile || !profile) {
      return (
        <main
          className="
          mx-auto min-h-dvh w-full max-w-2xl
          px-4 pb-8 pt-5 sm:px-6 lg:pt-8
        "
        >
          <AdvisorViewSkeleton />
        </main>
      );
    }

    if (!profile.ward_id) {
      return (
        <PageContainer center>
          <p className="text-sm text-red-600">
            No se pudo cargar el barrio del asesor.
          </p>
        </PageContainer>
      );
    }

    return (
      <AdvisorView
        wardId={profile.ward_id}
        onBack={() => setScreen("role")}
        onLogout={async () => {
          const { error } = await supabase.auth.signOut({
            scope: "local",
          });

          if (error) {
            console.error("Error cerrando sesión del asesor:", error);
          }

          sessionStorage.removeItem("bendiceme-advisor-active");
          sessionStorage.removeItem("bendiceme-advisor-view");

          setScreen("role");
        }}
      />
    );
  }

  if (screen === "youth-login") {
    return (
      <PageContainer center>
        <YouthLogin
          email={youthEmail}
          password={youthPassword}
          error={youthLoginError}
          loading={youthLoginLoading}
          onEmailChange={setYouthEmail}
          onPasswordChange={setYouthPassword}
          onBack={() => {
            setYouthEmail("");
            setYouthPassword("");
            setYouthLoginError(null);
            setScreen("role");
          }}
          onSubmit={handleYouthLogin}
        />
      </PageContainer>
    );
  }

  if (screen === "saved") {
    return (
      <PageContainer center>
        <AvailabilitySaved
          currentYouth={currentYouth}
          onEdit={() => setScreen("home")}
          onViewAssignments={() => setScreen("assignments")}
        />
      </PageContainer>
    );
  }

  if (screen === "assignments") {
    return (
      <PageContainer center>
        <YouthAssignments
          currentYouth={currentYouth}
          onBack={() => setScreen("home")}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer center>
      <YouthHome
        currentYouth={currentYouth}
        onSave={() => setScreen("saved")}
        onViewAssignments={() => setScreen("assignments")}
        onChangeYouth={async () => {
          setYouthLogoutLoading(true);

          const { error } = await supabase.auth.signOut({
            scope: "local",
          });

          if (error) {
            console.error("Error cerrando sesión del joven:", error);

            setYouthLogoutLoading(false);
            return;
          }

          clearYouth();

          setYouthLogoutLoading(false);

          setScreen("role");
        }}
        logoutLoading={youthLogoutLoading}
      />
    </PageContainer>
  );
}
