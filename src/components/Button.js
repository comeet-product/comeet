export default function Button({
    size = "large",
    children,
    onClick,
    disabled = false,
    className = "",
    color = "primary",
}) {
    const sizeStyle =
        size === "large"
            ? "w-full py-3 rounded-md text-lg"
            : "py-2 px-4 rounded-lg text-base";

    const colorStyle =
        color === "primary"
            ? "bg-main"
            : "bg-gray-500";

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
        ${sizeStyle}
        ${disabled ? "bg-gray-300" : colorStyle}
        text-white
        font-medium
        transition-all
        flex
        items-center
        justify-center
        ${disabled ? "cursor-not-allowed" : "hover:opacity-70"}
        ${className}
    `}
        >
            {children}
        </button>
    );
}