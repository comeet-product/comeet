import React from "react";

export default function AvailableTime({
    text = "30분",
    onClick,
    disabled = false,
    className = "",
    backgroundColor,
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{ backgroundColor }}
            className={`
                w-[40px] h-[18px]
                rounded-[5px]
                text-white
                text-[10.612px]
                font-normal
                leading-[17.178px]
                tracking-[-0.336px]
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
