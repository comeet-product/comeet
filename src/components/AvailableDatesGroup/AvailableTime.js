import React from "react";

export default function AvailableTime({
    text = "30분",
    className = "",
    backgroundColor,
}) {
    return (
        <div
            style={{ backgroundColor }}
            className={`
                w-[40px] h-[18px]
                rounded-[5px]
                text-white
                text-[9px]
                font-normal
                leading-[17.178px]
                tracking-[-0.336px]
                flex
                items-center
                justify-center
                ${className}
            `}
        >
            {text}
        </div>
    );
}
