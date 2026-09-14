import { Check } from "lucide-react";

export default function DateOption({
    selected,
    onSelect,
    day,
    month,
    label,
}) {
    return (
        <button
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            className={`
                flex w-full items-center gap-4 rounded-2xl border p-4
                text-left transition-all
                ${
                    selected
                        ? "border-green-600 bg-green-50"
                        : "border-border bg-white hover:border-green-300"
                }
            `}
        >
            <div
                className={`
                    flex size-14 shrink-0 flex-col items-center justify-center rounded-xl
                    ${
                        selected
                            ? "bg-green-600 text-white"
                            : "bg-muted text-foreground"
                    }
                `}
            >
                <span className="text-lg font-semibold leading-none">
                    {day}
                </span>

                <span className="mt-1 text-[10px] font-semibold">
                    {month}
                </span>
            </div>

            <span className="flex-1 text-sm font-medium sm:text-[15px]">
                {label}
            </span>

            <div
                className={`
                    grid size-6 shrink-0 place-items-center rounded-full border
                    ${
                        selected
                            ? "border-green-600 bg-green-600 text-white"
                            : "border-muted-foreground/30"
                    }
                `}
            >
                {selected && (
                    <Check className="size-4" />
                )}
            </div>
        </button>
    );
}