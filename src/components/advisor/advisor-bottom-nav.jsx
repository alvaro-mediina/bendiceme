"use client";

import BottomNav from "@/components/layout/bottom-nav";
import { Home, Church, UsersRound, ShieldCheck, Ellipsis } from "lucide-react";

export default function AdvisorBottomNav({
  activeView,
  onChangeView,
  isOwner = false,
}) {
  const items = [
    {
      id: "home",
      label: "Inicio",
      icon: Home,
    },
    {
      id: "sacrament",
      label: "Santa Cena",
      icon: Church,
    },
    {
      id: "youth",
      label: "Jóvenes",
      icon: UsersRound,
    },

    ...(isOwner
      ? [
          {
            id: "admin",
            label: "Admin",
            icon: ShieldCheck,
          },
        ]
      : []),

    {
      id: "more",
      label: "Más",
      icon: Ellipsis,
    },
  ];

  return (
    <BottomNav
      items={items}
      activeView={activeView === "admin-ward" ? "admin" : activeView}
      onChangeView={onChangeView}
    />
  );
}
