export default function Button({
    size = "large",
    text,
    onClick,
    disabled = false,
    className = "",
    color = "primary",
}) {
    const sizeStyle =
        size === "large"
            ? "w-[313px] h-[59px] rounded-[5px] text-[20px]"
            : "w-[90px] h-[36px] rounded-[20px] text-[17px]";

    const colorStyle =
        color === "primary"
            ? "bg-[#3674B5] hover:bg-blue-600"
            : "bg-gray-500 hover:bg-gray-600";

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
        ${sizeStyle}
        ${colorStyle}
        text-white
        font-medium
        transition-colors
        flex
        items-center
        justify-center
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
    `}
        >
            {text}
        </button>
    );
}
