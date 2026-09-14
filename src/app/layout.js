import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata = {
    title: "BendiceMe — Comunidad y servicio",
    description: "Organiza tus turnos y sirve a tu comunidad con BendiceMe.",
    generator: "v0.app",
};

export const viewport = {
    colorScheme: "light",
    themeColor: "#f8f5ed",
    userScalable: false,
};

export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <body className="antialiased">
                {children}
                {process.env.NODE_ENV === "production" && <Analytics />}
            </body>
        </html>
    );
}
