import React from "react";
import Time from "./AvailableTime";

export default function AvailableDate({
    date = "5월 19일", // 기본값 설정
    timeText = "30분", // 기본값 설정
    backgroundColor = "rgba(54, 116, 181, 0.60)", // 기본값 설정
    onClick,
    disabled = false,
    className = "",
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                w-full
                min-w-[143px]
                rounded-md
                bg-white
                border border-gray-200
                flex items-center
                relative
                py-0.5
                px-3
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                ${className}
            `}
        >
            <div className="flex items-center gap-2 mx-auto">
                <span className="text-sm text-gray-900">{date}</span>
                <Time text={timeText} backgroundColor={backgroundColor} />
            </div>
            <svg
                className="absolute right-2 top-1/2 -translate-y-1/2"
                width="6"
                height="10"
                viewBox="0 0 6 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M1 9L5 5L1 1"
                    stroke="#9CA3AF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </button>
    );
}
