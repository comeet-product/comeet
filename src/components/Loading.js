export default function Loading({ message = "로딩 중..." }) {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[rgba(54,116,181,0.60)]"></div>
            <p className="mt-4 text-gray-600">{message}</p>
        </div>
    );
}
