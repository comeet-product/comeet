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
            : "py-2 px-4 rounded-3xl text-base";

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
        ${colorStyle}
        text-white
        font-medium
        transition-opacity
        flex
        items-center
        justify-center
        hover:opacity-70
        ${disabled ? "opacity-50" : ""}
        ${className}
    `}
        >
            {children}
        </button>
    );
}