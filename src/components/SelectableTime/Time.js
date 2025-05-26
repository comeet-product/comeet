export default function Time({
    text,
    onClick,
    disabled = false,
    className = "",
}) {
    const sizeStyle = "w-[77px] h-[30px]";

    const borderRadiusStyle = "rounded-[5px]";

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
        ${sizeStyle}
        ${borderRadiusStyle}
        bg-gray-200
        text-black
        text-[15.009px]
        font-normal
        transition-colors
        flex
        items-center
        justify-center
        py-4 px-2
        whitespace-nowrap
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
        >
            {text}
        </button>
    );
}
