"use client";
import React, { useState, useRef, useEffect } from "react";

export default function Calendar({ onChange = () => {}, selectedDates = [] }) {
    // ===== 상수 정의 =====
    const MAX_SELECTED_DATES = 31;

    const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const MONTH_NAMES = [
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

    // ===== 상태 관리 =====
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isDateSelectorOpen, setIsDateSelectorOpen] = useState(false);

    // 즉시 시각적 피드백을 위한 로컬 선택 상태
    const [localSelectedDates, setLocalSelectedDates] = useState(
        new Set(selectedDates)
    );

    // 토스트 관련 상태
    const [toastState, setToastState] = useState({
        show: false,
        message: "",
    });

    const dateSelectorRef = useRef(null);
    const calendarRef = useRef(null);

    // ===== 유틸리티 함수들 =====
    const formatDate = (year, month, day) => {
        const monthStr = String(month + 1).padStart(2, "0");
        const dayStr = String(day).padStart(2, "0");
        return `${year}-${monthStr}-${dayStr}`;
    };

    const showToast = (message, duration = 1500) => {
        setToastState({ show: true, message });
        setTimeout(() => setToastState({ show: false, message: "" }), duration);
    };

    // ===== 달력 계산 함수들 =====
    const getCalendarData = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const startingDay = firstDayOfMonth.getDay();

        const days = [];
        for (let i = 0; i < startingDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);
        while (days.length % 7 !== 0) days.push(null);

        const today = new Date().getDate();
        const isCurrentMonth =
            new Date().getFullYear() === year &&
            new Date().getMonth() === month;

        return {
            year,
            month,
            days,
            daysInMonth,
            startingDay,
            today,
            isCurrentMonth,
        };
    };

    const getYearOptions = () => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 11 }, (_, i) => currentYear + i);
    };

    // ===== 새로운 터치 처리 로직 (reference.js 방식) =====

    // 날짜 선택/해제 함수
    const toggleDateSelection = (day) => {
        if (day === null) return;

        const { year, month } = getCalendarData();
        const dateStr = formatDate(year, month, day);

        console.log("=== DATE TOGGLE ===");
        console.log("Toggling day:", day, "dateStr:", dateStr);

        const newLocalDates = new Set(localSelectedDates);

        if (newLocalDates.has(dateStr)) {
            newLocalDates.delete(dateStr);
            console.log("Date removed:", dateStr);
        } else {
            if (newLocalDates.size >= MAX_SELECTED_DATES) {
                showToast("날짜 선택은 최대 31일까지 가능합니다.");
                console.log("Max dates reached");
                return;
            }
            newLocalDates.add(dateStr);
            console.log("Date added:", dateStr);
        }

        console.log("New selected dates:", [...newLocalDates]);
        setLocalSelectedDates(newLocalDates);
        onChange([...newLocalDates]);
        console.log("=== TOGGLE COMPLETE ===");
    };

    // 전역 터치 이벤트 핸들러 (reference.js 방식)
    const handleGlobalTouch = (e) => {
        // Calendar 영역 내에서만 처리
        if (!calendarRef.current?.contains(e.target)) {
            return;
        }

        console.log("=== GLOBAL TOUCH EVENT ===");
        console.log("Touch type:", e.type);
        console.log("Target:", e.target);

        // 날짜 셀인지 확인
        const dayElement = e.target.closest("[data-day]");
        if (!dayElement) {
            console.log("Not a day element");
            return;
        }

        const day = parseInt(dayElement.getAttribute("data-day"));
        if (!day) {
            console.log("Invalid day:", day);
            return;
        }

        // 터치 시작 시에만 선택 처리
        if (e.type === "touchstart") {
            console.log("Processing touch start for day:", day);
            e.preventDefault(); // 기본 동작 방지
            toggleDateSelection(day);
        }
    };

    // ===== 네비게이션 핸들러들 =====
    const handlePrevMonth = () => {
        const { year, month } = getCalendarData();
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        const { year, month } = getCalendarData();
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleYearSelect = (selectedYear) => {
        const { month } = getCalendarData();
        setCurrentDate(new Date(selectedYear, month, 1));
        setIsDateSelectorOpen(false);
    };

    const handleMonthSelect = (selectedMonth) => {
        const { year } = getCalendarData();
        setCurrentDate(new Date(year, selectedMonth, 1));
        setIsDateSelectorOpen(false);
    };

    // ===== Effect 관리 =====
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dateSelectorRef.current &&
                !dateSelectorRef.current.contains(event.target)
            ) {
                setIsDateSelectorOpen(false);
            }
        };

        document.addEventListener("mouseup", handleClickOutside);
        return () => {
            document.removeEventListener("mouseup", handleClickOutside);
        };
    }, []);

    // 전역 터치 이벤트 등록 (reference.js 방식)
    useEffect(() => {
        console.log("Setting up global touch listeners");
        window.addEventListener("touchstart", handleGlobalTouch, {
            passive: false,
        });
        window.addEventListener("touchend", handleGlobalTouch, {
            passive: false,
        });

        return () => {
            console.log("Cleaning up global touch listeners");
            window.removeEventListener("touchstart", handleGlobalTouch);
            window.removeEventListener("touchend", handleGlobalTouch);
        };
    }, [localSelectedDates]); // localSelectedDates 의존성 추가

    // selectedDates prop 변경 시 localSelectedDates 동기화
    useEffect(() => {
        setLocalSelectedDates(new Set(selectedDates));
    }, [selectedDates]);

    // ===== 렌더링 데이터 준비 =====
    const { year, month, days, today, isCurrentMonth } = getCalendarData();
    const yearOptions = getYearOptions();

    // ===== JSX 렌더링 =====
    return (
        <div className="flex flex-col w-full items-start">
            {/* Toast Message */}
            {toastState.show && (
                <div className="fixed bottom-[65px] left-1/2 transform -translate-x-1/2 z-50">
                    <div className="bg-red-500 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
                        {toastState.message}
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-6 w-full">
                {/* 년월 표시 */}
                <div
                    className="flex items-center relative"
                    ref={dateSelectorRef}
                >
                    <div
                        className="flex items-center cursor-pointer"
                        onClick={() =>
                            setIsDateSelectorOpen(!isDateSelectorOpen)
                        }
                    >
                        <span className="text-[16px] text-black font-semibold tracking-[-0.38px] whitespace-nowrap">
                            {year}
                        </span>
                        <span className="ml-1 text-[16px] text-black font-semibold tracking-[-0.38px] min-w-[25px] whitespace-nowrap">
                            {MONTH_NAMES[month]}
                        </span>
                        <span className="ml-1 text-[#3674B5] text-[16px] flex items-center">
                            &gt;
                        </span>
                    </div>

                    {/* 년월 선택 드롭다운 */}
                    {isDateSelectorOpen && (
                        <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-lg z-10 flex">
                            {/* 년도 선택 */}
                            <div className="w-24 max-h-60 overflow-y-auto border-r">
                                {yearOptions.map((y) => (
                                    <div
                                        key={y}
                                        onClick={() => handleYearSelect(y)}
                                        className={`px-3 py-2 cursor-pointer transition-colors duration-200 ease-in-out hover:bg-[#3674B5]/10
                                            ${
                                                y === year
                                                    ? "bg-[#3674B5]/20 text-[#3674B5]"
                                                    : "text-black"
                                            }
                                        `}
                                    >
                                        {y}
                                    </div>
                                ))}
                            </div>
                            {/* 월 선택 */}
                            <div className="w-20 max-h-60 overflow-y-auto">
                                {MONTH_NAMES.map((m, index) => (
                                    <div
                                        key={m}
                                        onClick={() => handleMonthSelect(index)}
                                        className={`px-3 py-2 cursor-pointer transition-colors duration-200 ease-in-out hover:bg-[#3674B5]/10
                                            ${
                                                index === month
                                                    ? "bg-[#3674B5]/20 text-[#3674B5]"
                                                    : "text-black"
                                            }
                                        `}
                                    >
                                        {m}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 월 이동 화살표 */}
                <div className="flex items-center gap-6">
                    <span
                        onClick={handlePrevMonth}
                        className="w-5 h-5 flex items-center justify-center cursor-pointer text-[#3674B5] transition-colors duration-150 ease-in-out hover:text-[#3674B5]/80 font-medium"
                    >
                        &lt;
                    </span>
                    <span
                        onClick={handleNextMonth}
                        className="w-5 h-5 flex items-center justify-center cursor-pointer text-[#3674B5] transition-colors duration-150 ease-in-out hover:text-[#3674B5]/80 font-medium"
                    >
                        &gt;
                    </span>
                </div>
            </div>

            {/* Calendar Content Container */}
            <div className="flex flex-col w-full flex-1">
                {/* Weekdays */}
                <div className="grid grid-cols-7 text-center mb-2 w-full">
                    {WEEKDAYS.map((day) => (
                        <div
                            key={day}
                            className="flex items-center justify-center h-10 text-sm text-gray-500"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div
                    className="grid grid-cols-7 gap-2 w-full"
                    style={{ touchAction: "none" }}
                    ref={calendarRef}
                >
                    {days.map((day, index) => {
                        const dateStr = day
                            ? formatDate(year, month, day)
                            : null;
                        const isSelected =
                            day !== null && localSelectedDates.has(dateStr);

                        return (
                            <div
                                key={index}
                                data-day={day}
                                onClick={() => day && toggleDateSelection(day)}
                                onSelectStart={(e) => e.preventDefault()}
                                onDragStart={(e) => e.preventDefault()}
                                className={`
                                    w-full aspect-square flex items-center justify-center select-none text-base
                                    transition-colors duration-200 ease-in-out
                                    ${
                                        day === null
                                            ? "invisible"
                                            : "cursor-pointer active:scale-95 transform transition-transform duration-100"
                                    }
                                    ${
                                        day !== null &&
                                        isCurrentMonth &&
                                        day === today
                                            ? "text-blue-600 font-bold"
                                            : "text-black"
                                    }
                                    ${
                                        isSelected
                                            ? "bg-blue-100 rounded-full"
                                            : ""
                                    }
                                    ${
                                        day !== null &&
                                        !isSelected &&
                                        (!isCurrentMonth || day !== today)
                                            ? "md:hover:bg-gray-200 rounded-full"
                                            : ""
                                    }
                                `}
                                style={{
                                    userSelect: "none",
                                    WebkitUserSelect: "none",
                                    MozUserSelect: "none",
                                    msUserSelect: "none",
                                    WebkitTouchCallout: "none",
                                    WebkitTapHighlightColor: "transparent",
                                    touchAction: "none",
                                }}
                            >
                                {day}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
