export default function PageContainer({ children }) {
    return (
        <div className="flex min-h-dvh justify-center px-4 py-6 sm:items-center sm:py-10">
            {children}
        </div>
    );
}