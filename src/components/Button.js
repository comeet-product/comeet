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
            ? "w-full h-[59px] rounded-[5px] text-[20px]"
            : "w-[90px] h-[36px] rounded-[20px] text-[17px]";

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
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
    `}
        >
            {children}
        </button>
    );
}