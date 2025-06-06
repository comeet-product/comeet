"use client";

import React from "react";
import { useState } from "react";
import { X } from "lucide-react";

export default function TutorialPage({ onClose }) {
    return (
        <div className="fixed inset-0 bg-black/85 backdrop-sm z-50 flex items-center justify-center p-4">
            {/* Tutorial Content */}
            <div className="max-h-[80vh] overflow-y-auto max-w-sm w-full text-white">
                {/* Header */}
                <div className="flex items-center justify-end p-4 text-white">
                    <button onClick={onClose} className="p-1">
                        <X className="h-4 w-4 text-white" />
                    </button>
                </div>

                {/* Tutorial Sections - Vertical Layout */}
                <div className="divide-gray-300">
                    {/* Section 1: Drag to Select */}
                    <div className="p-4">
                        {/* Timetable Container - Adjust background/border */}
                        <div className="relative h-28 overflow-hidden mb-1">
                            {/* Timetable structure for Section 1 - Adjust backgrounds */}
                            <div className="grid grid-cols-3 gap-px h-full text-center text-xs font-medium rounded-md border border-gray-400">
                                {/* Header Row (Days) - Adjust backgrounds/text color */}
                                <div className="text-white py-1 border-r border-gray-400">
                                    Day 1
                                </div>
                                <div className="text-white py-1 border-r border-gray-400">
                                    Day 2
                                </div>
                                <div className="text-white py-1">Day 3</div>

                                {/* Time Slots 09:00 - 13:00 - Adjust backgrounds */}
                                {[9, 10, 11, 12].map((hour) => (
                                    <React.Fragment
                                        key={`hour-${hour}-section1`}
                                    >
                                        <div className="pl-1 py-1 border-t border-r border-gray-400"></div>
                                        <div className="pl-1 py-1 border-t border-r border-gray-400"></div>
                                        <div className="pl-1 py-1 border-t border-gray-400"></div>
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Drag gesture visual - Gray circle and arrow (should remain visible) */}
                            <div className="absolute left-1/4 top-[calc(50%-20px)] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                                {/* Gray circle with custom drag animation */}
                                <div
                                    className="w-8 h-8 bg-gray-400 rounded-full opacity-80 shadow-lg mb-1"
                                    style={{
                                        animation:
                                            "dragDown 3s ease-in-out infinite",
                                    }}
                                />
                                {/* Downward arrow (keep opacity) */}
                                <svg
                                    className="w-20 h-20"
                                    style={{
                                        color: "rgba(54, 116, 181, 0.80)",
                                    }}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.5"
                                        d="M12 3v16M15 18L12 21L9 18"
                                    ></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                    {/* Text below section - Adjust color */}
                    <p className="text-sm text-center -mt-1">
                        위에서 아래로 드래그해서 가능한 시간을 선택하세요.
                    </p>

                    {/* Section 2: Pinch to Zoom */}
                    <div className="p-4">
                        {/* Timetable Container - Adjust background/border */}
                        <div className="relative h-28 overflow-hidden mb-1 rounded-md border border-gray-400">
                            {/* Timetable structure for Section 2 - Adjust backgrounds */}
                            <div className="grid grid-cols-3 gap-px h-full text-center text-xs font-medium">
                                {/* Header Row (Days) - Adjust backgrounds/text color */}
                                <div className="text-white py-1 border-r border-gray-400">
                                    Day 1
                                </div>
                                <div className="text-white py-1 border-r border-gray-400">
                                    Day 2
                                </div>
                                <div className="text-white py-1">Day 3</div>

                                {/* Time Slots 09:00 - 13:00 - Adjust backgrounds */}
                                {[9, 10, 11, 12].map((hour) => (
                                    <React.Fragment
                                        key={`hour-${hour}-section2`}
                                    >
                                        <div className="pl-1 py-1 border-t border-r border-gray-400"></div>
                                        <div className="pl-1 py-1 border-t border-r border-gray-400"></div>
                                        <div className="pl-1 py-1 border-t border-gray-400"></div>
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Pinch gesture visual - Gray circles and diagonal arrows (should remain visible) */}
                            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                                {/* Outward diagonal arrows (keep opacity) */}
                                <svg
                                    className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20"
                                    style={{
                                        color: "rgba(54, 116, 181, 0.80)",
                                    }}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 12 L6 6 M6 6 L8 6 M6 6 L6 8 M12 12 L18 18 M18 18 L16 18 M18 18 L18 16"
                                    ></path>
                                </svg>
                                {/* Top-left finger - Gray with custom pinch animation */}
                                <div
                                    className="absolute w-8 h-8 bg-gray-400 rounded-full opacity-80 shadow-lg"
                                    style={{
                                        animation:
                                            "pinchTopLeft 3s ease-in-out infinite",
                                    }}
                                />
                                {/* Bottom-right finger - Gray with custom pinch animation */}
                                <div
                                    className="absolute w-8 h-8 bg-gray-400 rounded-full opacity-80 shadow-lg"
                                    style={{
                                        animation:
                                            "pinchBottomRight 3s ease-in-out infinite",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    {/* Text below section - Adjust color */}
                    <p className="text-sm text-center">
                        두 손가락으로 확대·축소해서 편하게 선택할 수 있어요.
                    </p>

                    {/* Section 3: Swipe to Scroll */}
                    <div className="p-4">
                        {/* Timetable Container - Adjust background/border */}
                        <div className="relative h-28 overflow-hidden mb-1 rounded-md border border-gray-400">
                            {/* Timetable structure for Section 3 - Adjust backgrounds */}
                            <div className="grid grid-cols-3 gap-px h-full text-center text-xs font-medium">
                                {/* Header Row (Days) - Adjust backgrounds/text color */}
                                <div className="text-white py-1 border-r border-gray-400">
                                    Day 1
                                </div>
                                <div className="text-white py-1 border-r border-gray-400">
                                    Day 2
                                </div>
                                <div className="text-white py-1">Day 3</div>

                                {/* Time Slots 09:00 - 13:00 - Adjust backgrounds */}
                                {[9, 10, 11, 12].map((hour) => (
                                    <React.Fragment
                                        key={`hour-${hour}-section3`}
                                    >
                                        <div className="pl-1 py-1 border-t border-r border-gray-400"></div>
                                        <div className="pl-1 py-1 border-t border-r border-gray-400"></div>
                                        <div className="pl-1 py-1 border-t border-gray-400"></div>
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Swipe gesture visual - Gray circle and leftward arrow (should remain visible) */}
                            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-4 flex items-center">
                                {/* Leftward arrow (keep opacity) */}
                                <svg
                                    className="w-20 h-20 mr-2"
                                    style={{
                                        color: "rgba(54, 116, 181, 0.80)",
                                    }}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.5"
                                        d="M5 12h14M16 9L19 12L16 15M8 15L5 12L8 9"
                                    ></path>
                                </svg>
                                {/* Swipe hand/finger - Gray with custom swipe animation */}
                                <div
                                    className="w-8 h-8 bg-gray-400 rounded-full opacity-80 shadow-lg"
                                    style={{
                                        animation:
                                            "swipeLeft 3s ease-in-out infinite",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    {/* Text below section - Adjust color */}
                    <p className="text-sm text-center">
                        양쪽으로도 스크롤해서 볼 수 있어요.
                    </p>
                </div>

            </div>

            <style jsx>{`
                @keyframes dragDown {
                    0% {
                        transform: translateY(40px);
                    }
                    20% {
                        transform: translateY(40px);
                    }
                    50% {
                        transform: translateY(80px);
                    }
                    80% {
                        transform: translateY(40px);
                    }
                    100% {
                        transform: translateY(40px);
                    }
                }

                @keyframes swipeLeft {
                    0% {
                        transform: translateX(0);
                    }
                    20% {
                        transform: translateX(0);
                    }
                    50% {
                        transform: translateX(-40px);
                    }
                    80% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(0);
                    }
                }

                @keyframes pinchTopLeft {
                    0% {
                        transform: translate(-8px, -8px);
                    }
                    20% {
                        transform: translate(-8px, -8px);
                    }
                    50% {
                        transform: translate(-24px, -24px);
                    }
                    80% {
                        transform: translate(-8px, -8px);
                    }
                    100% {
                        transform: translate(-8px, -8px);
                    }
                }

                @keyframes pinchBottomRight {
                    0% {
                        transform: translate(8px, 8px);
                    }
                    20% {
                        transform: translate(8px, 8px);
                    }
                    50% {
                        transform: translate(24px, 24px);
                    }
                    80% {
                        transform: translate(8px, 8px);
                    }
                    100% {
                        transform: translate(8px, 8px);
                    }
                }
            `}</style>
        </div>
    );
}
