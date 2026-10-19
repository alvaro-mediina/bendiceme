// "use client";

// import { useState, useEffect } from "react";
// import BrandLogo from "../brand-logo";
// import AdvisorTeamSummary from "./advisor-team-summary";
// import AdvisorSundaySelector from "./advisor-sunday-selector";
// import AdvisorYouthList from "./advisor-youth-list";
// import useAdvisorTeam from "@/hooks/use-advisor-team";
// import useAdvisorAvailability from "@/hooks/use-advisor-availability";
// import AdvisorViewSkeleton from "./advisor-view-skeleton";

// import { subscribeAdvisorToPush } from "@/lib/push";

// import {
//     ChevronLeft,
//     LogOut,
//     Bell
// } from "lucide-react";

// import { formatSunday } from "@/lib/sundays";
// import { Button } from "@/components/ui/button";
// import { motion } from "motion/react";

// import {
//     fadeUp,
//     staggerContainer,
// } from "@/lib/animations";
// import { supabase } from "@/lib/supabase";

// export default function AdvisorView({
//     wardId,
//     onBack,
//     onLogout,
// }) {
//     const {
//         sundays,
//         selectedSundayId,
//         setSelectedSundayId,
//         availableYouth,
//         loadingSundays,
//         loadingYouth,
//         availabilityError,
//     } = useAdvisorAvailability(wardId);

//     const {
//         team,
//         blessCount,
//         passCount,
//         prepareCount,
//         teamIsValid,
//         hasTeamChanges,
//         loadingTeam,
//         savingTeam,
//         saveMessage,
//         teamError,
//         selectRole,
//         togglePrepares,
//         saveTeam,
//     } = useAdvisorTeam(wardId, selectedSundayId);

//     const [mobileSummaryOpen, setMobileSummaryOpen] =
//         useState(false);

//     const availablePriests = availableYouth.filter(
//         (person) => person.office === "priest",
//     ).length;

//     const [pushLoading, setPushLoading] = useState(false);

//     const [pushEnabled, setPushEnabled] = useState(false);

//     const [pushError, setPushError] = useState(null);




//     if (loadingSundays) {
//         return <AdvisorViewSkeleton />;
//     }

//     const teamLoading =
//         loadingTeam || loadingYouth;

//     const TeamSkeleton = () => (
//         <div className="rounded-2xl border bg-white p-4 sm:p-5">
//             <div className="relative h-5 w-28 overflow-hidden rounded bg-gray-200">
//                 <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-gray-200/80 to-transparent" />
//             </div>

//             <div className="mt-5 flex flex-col gap-4">
//                 {[1, 2, 3].map((item) => (
//                     <div
//                         key={item}
//                         className="flex items-center justify-between"
//                     >
//                         <div className="relative h-4 w-24 overflow-hidden rounded bg-gray-200">
//                             <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-gray-200/80 to-transparent" />
//                         </div>

//                         <div className="relative h-4 w-10 overflow-hidden rounded bg-gray-200">
//                             <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-gray-200/80 to-transparent" />
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );

//     return (
        
//     );
// }

"use client";

import { useState } from "react";

import AdvisorHome from "./advisor-home";
import AdvisorSacrament from "./advisor-sacrament";
import AdvisorYouth from "./advisor-youth";
import AdvisorMore from "./advisor-more";
import AdvisorBottomNav from "./advisor-bottom-nav";

export default function AdvisorView({
    wardId,
    onBack,
    onLogout,
}) {
    const [activeView, setActiveView] =
        useState("home");

    return (
        <>
            <main className="mx-auto min-h-dvh w-full max-w-2xl px-4 pb-28 pt-5 sm:px-6 lg:pb-8 lg:pt-8">
                {activeView === "home" && (
                    <AdvisorHome
                        onNavigate={setActiveView}
                    />
                )}

                {activeView === "sacrament" && (
                    <AdvisorSacrament
                        wardId={wardId}
                        onBack={onBack}
                        onLogout={onLogout}
                    />
                )}

                {activeView === "youth" && (
                    <AdvisorYouth
                        wardId={wardId}
                    />
                )}

                {activeView === "more" && (
                    <AdvisorMore
                        onLogout={onLogout}
                    />
                )}
            </main>

            <AdvisorBottomNav
                activeView={activeView}
                onChangeView={setActiveView}
            />
        </>
    );
}