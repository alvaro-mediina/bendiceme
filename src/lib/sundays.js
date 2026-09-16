import { supabase } from "@/lib/supabase";

function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function getSundaysOfMonth(date) {
    const year = date.getFullYear();
    const month = date.getMonth();

    const sundays = [];

    const firstDayOfMonth = new Date(year, month, 1);

    const daysUntilSunday = (7 - firstDayOfMonth.getDay()) % 7;

    const currentSunday = new Date(year, month, 1 + daysUntilSunday);

    while (currentSunday.getMonth() === month) {
        sundays.push(formatLocalDate(currentSunday));

        currentSunday.setDate(currentSunday.getDate() + 7);
    }

    return sundays;
}

function canCreateNextMonthSundays(now = new Date()) {
    const sundays = getSundaysOfMonth(now);

    const lastSundayString = sundays[sundays.length - 1];

    const lastSunday = new Date(`${lastSundayString}T13:00:00`);

    return now >= lastSunday;
}

export async function ensureAvailableSundays() {
    const now = new Date();

    const useNextMonth = canCreateNextMonthSundays(now);

    const activeMonthDate = useNextMonth
        ? new Date(now.getFullYear(), now.getMonth() + 1, 1)
        : new Date(now.getFullYear(), now.getMonth(), 1);

    const dates = getSundaysOfMonth(activeMonthDate);

    const rows = dates.map((date) => ({
        date,
        active: true,
    }));

    const { data, error } = await supabase
        .from("sundays")
        .upsert(rows, {
            onConflict: "date",
        })
        .select()
        .order("date", {
            ascending: true,
        });

    if (error) {
        console.error("Error creando domingos:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
        });

        throw error;
    }

    return {
        sundays: data,
        activeMonthDate,
    };
}

export function getVisibleSundays() {
    const now = new Date();

    const currentMonthSundays = getSundaysOfMonth(now);

    const lastSundayString =
        currentMonthSundays[currentMonthSundays.length - 1];

    const lastSundayAt13 = new Date(`${lastSundayString}T13:00:00`);

    const activeMonthDate =
        now >= lastSundayAt13
            ? new Date(now.getFullYear(), now.getMonth() + 1, 1)
            : new Date(now.getFullYear(), now.getMonth(), 1);

    const today = formatLocalDate(now);

    const dates = getSundaysOfMonth(activeMonthDate).filter((date) => {
        /*
         * Si pasamos al mes siguiente,
         * mostramos todos.
         */
        if (activeMonthDate.getMonth() !== now.getMonth()) {
            return true;
        }

        return date >= today;
    });

    return {
        dates,
        activeMonthDate,
    };
}

export function formatSunday(dateString) {
    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString("es-AR", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });
}
