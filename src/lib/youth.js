export function getOfficeLabel(office) {
    switch (office) {
        case "deacon":
            return "Diácono";

        case "teacher":
            return "Maestro";

        case "priest":
            return "Presbítero";

        default:
            return "Sin oficio";
    }
}
