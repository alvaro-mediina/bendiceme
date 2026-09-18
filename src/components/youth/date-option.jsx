import { Check } from "lucide-react";

export default function DateOption({
    sunday,
    selected,
    disabled = false,
    disabledReason = null,
    onToggle,
}) {
    const sundayDate = new Date(`${sunday.date}T00:00:00`);

    const day = sundayDate.getDate();

    const month = sundayDate
        .toLocaleDateString("es-AR", {
            month: "short",
        })
        .toUpperCase()
        .replace(".", "");

    const label = sundayDate.toLocaleDateString(
        "es-AR",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
        }
    );

    return (
        <button
            type="button"
            onClick={onToggle}
            disabled={disabled}
            aria-pressed={selected}
            className={`
                flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors
                ${
                    disabled
                        ? "cursor-not-allowed border-amber-200 bg-amber-50 text-amber-950"
                        : selected
                        ? "border-green-500 bg-green-50"
                        : "bg-white hover:border-green-300 hover:bg-green-50"
                }
            `}
        >
            <div
                className={`
                    flex size-14 shrink-0 flex-col items-center justify-center rounded-xl
                    ${
                        disabled
                            ? "bg-amber-100 text-amber-800"
                            : selected
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

            <div className="flex-1">
                <p className="text-sm font-medium capitalize sm:text-[15px]">
                    {label}
                </p>

                {disabled && disabledReason && (
                    <p className="mt-1 text-sm font-medium text-amber-700">
                        ⛪ {disabledReason}
                    </p>
                )}
            </div>
            
            {!disabled &&
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
                    {selected &&  (
                        <Check className="size-4" />
                    )}
                </div>
            }
        </button>
    );
}