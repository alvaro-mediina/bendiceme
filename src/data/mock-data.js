export const sundays = [
    {
        id: 1,
        day: "6",
        month: "SEP",
        label: "Domingo 6 de septiembre",
    },
    {
        id: 2,
        day: "13",
        month: "SEP",
        label: "Domingo 13 de septiembre",
    },
    {
        id: 3,
        day: "20",
        month: "SEP",
        label: "Domingo 20 de septiembre",
    },
    {
        id: 4,
        day: "27",
        month: "SEP",
        label: "Domingo 27 de septiembre",
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
