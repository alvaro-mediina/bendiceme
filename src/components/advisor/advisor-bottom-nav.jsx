"use client";

import {
    Home,
    Church,
    Users,
    Ellipsis,
} from "lucide-react";

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
        icon: Users,
    },
    {
        id: "more",
        label: "Más",
        icon: Ellipsis,
    },
];

export default function AdvisorBottomNav({
    activeView,
    onChangeView,
}) {
    return (
        <nav className="fixed inset-x-0 bottom-4 z-50 px-4 lg:hidden">
            <div className="mx-auto flex max-w-md items-center justify-around rounded-3xl border bg-background/95 px-2 py-2 shadow-lg backdrop-blur">
                {items.map((item) => {
                    const Icon = item.icon;
                    const active =
                        activeView === item.id;

                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                                onChangeView(
                                    item.id,
                                )
                            }
                            className={`
                                flex min-w-16 flex-col items-center gap-1
                                rounded-2xl px-3 py-2
                                text-[11px] font-medium
                                transition-colors
                                ${
                                    active
                                        ? "bg-green-50 text-green-700"
                                        : "text-muted-foreground hover:text-foreground"
                                }
                            `}
                        >
                            <Icon className="size-5" />

                            <span>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}