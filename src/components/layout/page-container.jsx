export default function PageContainer({
    children,
    center = false,
}) {
    return (
        <div
            className={`
                flex min-h-dvh justify-center px-4 py-6 sm:py-8
                ${center ? "items-center" : ""}
            `}
        >
            {children}
        </div>
    );
}