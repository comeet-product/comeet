import React from "react";
import Time from "./AvailableTime";

export default function AvailableDate({
    date = "5월 19일", // 기본값 설정
    timeText = "30분", // 기본값 설정
    backgroundColor = "main", // 기본값 설정
    onClick,
    disabled = false,
    className = "",
    isSelected = false, // 선택된 상태
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                w-full
                min-w-[143px]
                rounded-md
                flex items-center
                relative
                py-0.5
                px-3
                transition-all duration-200
                ${isSelected 
                    ? "bg-main/10 border-2 border-main" 
                    : "bg-white border border-gray-200 hover:bg-gray-50"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                ${className}
            `}
        >
            <div className="flex items-center gap-2 mx-auto">
                <span className={`text-sm ${isSelected ? "text-blue-900 font-medium" : "text-gray-900"}`}>
                    {date}
                </span>
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
                    stroke={isSelected ? "main" : "#9CA3AF"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </button>
    );
}
