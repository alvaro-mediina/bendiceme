export const sundays = [
    {
        id: 1,
        date: "2026-09-06",
    },
    {
        id: 2,
        date: "2026-09-13",
    },
    {
        id: 3,
        date: "2026-09-20",
    },
    {
        id: 4,
        date: "2026-09-27",
    },
];

export const youth = [
    {
        id: 1,
        name: "Juan",
        office: "priest",
    },
    {
        id: 2,
        name: "Pedro",
        office: "priest",
    },
    {
        id: 3,
        name: "Mateo",
        office: "teacher",
    },
    {
        id: 4,
        name: "Lucas",
        office: "teacher",
    },
    {
        id: 5,
        name: "Samuel",
        office: "priest",
    },
];

export const assignments = [
    {
        sundayId: 3,
        youthId: 1,
        role: "bless",
        prepares: true,
        status: "confirmed",
    },
    {
        sundayId: 3,
        youthId: 2,
        role: "bless",
        prepares: false,
        status: "confirmed",
    },
    {
        sundayId: 3,
        youthId: 3,
        role: "pass",
        prepares: true,
        status: "confirmed",
    },
    {
        sundayId: 3,
        youthId: 4,
        role: "pass",
        prepares: false,
        status: "pending",
    },
];

export const currentYouthAssignment = {
    sundayId: 3,
    youthId: 3,
    role: "pass",
    prepares: true,
    status: "pending",
};
