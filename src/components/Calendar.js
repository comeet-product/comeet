"use client";
import React, { useState } from "react";

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 1)); // 2025년 5월 (월은 0부터 시작)

    const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed

    // 현재 월의 첫 날짜 객체
    const firstDayOfMonth = new Date(year, month, 1);
    // 현재 월의 마지막 날짜 객체
    const lastDayOfMonth = new Date(year, month + 1, 0);
    // 현재 월의 총 날짜 수
    const daysInMonth = lastDayOfMonth.getDate();

    // 현재 월의 첫 날이 무슨 요일인지 (0: 일요일, 6: 토요일)
    const startingDay = firstDayOfMonth.getDay();

    // 달력에 표시될 날짜 배열 생성
    const days = [];
    // 첫 날 이전의 빈 칸 채우기
    for (let i = 0; i < startingDay; i++) {
        days.push(null);
    }
    // 현재 월의 날짜 채우기
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }
    // 마지막 날 이후의 빈 칸 채우기 (다음 달 날짜가 넘어가지 않도록)
    while (days.length % 7 !== 0) {
        days.push(null);
    }

    const today = new Date().getDate(); // 실제 오늘 날짜
    const isCurrentMonth =
        new Date().getFullYear() === year && new Date().getMonth() === month; // 현재 보고 있는 달력이 이번 달인지 확인
    const selectedDates = [26, 27, 28]; // 예시로 선택된 날짜를 설정

    const handlePrevMonth = () => {
        setCurrentDate(
            (prevDate) =>
                new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1)
        );
    };

    const handleNextMonth = () => {
        setCurrentDate(
            (prevDate) =>
                new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1)
        );
    };

    const monthNames = [
        "1월",
        "2월",
        "3월",
        "4월",
        "5월",
        "6월",
        "7월",
        "8월",
        "9월",
        "10월",
        "11월",
        "12월",
    ];

    return (
        <div className="flex flex-col w-[315px] h-[299px] items-start p-5 bg-white shadow">
            {/* Header */}
            <div className="flex justify-between items-center mb-[9.71px] w-full">
                {/* 년월 표시 */}
                <div className="flex items-center">
                    <div className="flex items-center">
                        <span className="text-[15.009px] font-[590] leading-[19.424px] tracking-[-0.38px] whitespace-nowrap">
                            {year}
                        </span>
                        <span className="ml-1 text-[15.009px] font-[590] leading-[19.424px] tracking-[-0.38px] min-w-[25px] whitespace-nowrap">
                            {monthNames[month]}
                        </span>
                    </div>
                    <span className="ml-1 text-[#3674B5] text-[15.009px] flex items-center">
                        &gt;
                    </span>
                </div>
                {/* 월 이동 화살표 */}
                <div className="flex items-center gap-[24.72px]">
                    <span
                        onClick={handlePrevMonth}
                        className="w-[13.244px] h-[21.19px] flex items-center justify-center cursor-pointer text-[#3674B5] hover:text-[#3674B5]/80 font-[510]"
                    >
                        &lt;
                    </span>
                    <span
                        onClick={handleNextMonth}
                        className="w-[13.244px] h-[21.19px] flex items-center justify-center cursor-pointer text-[#3674B5] hover:text-[#3674B5]/80 font-[510]"
                    >
                        &gt;
                    </span>
                </div>
            </div>

            {/* Calendar Content Container */}
            <div className="flex flex-col w-full flex-1 justify-center">
                {/* Weekdays */}
                <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-[2.65px] w-full">
                    {weekdays.map((day) => (
                        <div key={day} className="py-[2.65px]">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 text-center text-sm w-full gap-y-[6.18px]">
                    {days.map((day, index) => (
                        <div
                            key={index}
                            className={`
                                p-1 cursor-pointer w-7 h-7 flex items-center justify-center
                                ${day === null ? "invisible" : ""}
                                ${
                                    day !== null &&
                                    isCurrentMonth &&
                                    day === today
                                        ? "text-blue-600 font-bold"
                                        : ""
                                }
                                ${
                                    day !== null && selectedDates.includes(day)
                                        ? "bg-blue-100 rounded-full"
                                        : ""
                                }
                                ${
                                    day !== null &&
                                    !selectedDates.includes(day) &&
                                    (!isCurrentMonth || day !== today)
                                        ? "hover:bg-gray-200 rounded-full"
                                        : ""
                                }
                            `}
                        >
                            {day}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
