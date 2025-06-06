"use client";
import React, { useState, useRef, useEffect } from "react";

export default function Calendar({ onChange = () => {}, selectedDates = [] }) {
    // ===== 상수 정의 =====
    const TAP_THRESHOLD = 80;
    const MOVE_THRESHOLD = 8;
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

    // 드래그 관련 상태
    const [dragState, setDragState] = useState({
        isDragging: false,
        startDay: null,
        isAddMode: true,
    });

    // 터치 관련 상태
    const [touchState, setTouchState] = useState({
        pendingDay: null,
        timeout: null,
        startPos: { x: 0, y: 0 },
        isEnabled: true,
    });

    // 토스트 관련 상태
    const [toastState, setToastState] = useState({
        show: false,
        message: "",
    });

    const dateSelectorRef = useRef(null);

    // ===== 유틸리티 함수들 =====
    const formatDate = (year, month, day) => {
        const monthStr = String(month + 1).padStart(2, "0");
        const dayStr = String(day).padStart(2, "0");
        return `${year}-${monthStr}-${dayStr}`;
    };

    const toggleDate = (dateStr, dates, isAdd = null) => {
        const newDates = new Set(dates);
        const shouldAdd = isAdd === null ? !newDates.has(dateStr) : isAdd;

        if (shouldAdd && newDates.size >= MAX_SELECTED_DATES) {
            return [...dates];
        }

        if (isAdd === null) {
            newDates.has(dateStr)
                ? newDates.delete(dateStr)
                : newDates.add(dateStr);
        } else if (isAdd) {
            newDates.add(dateStr);
        } else {
            newDates.delete(dateStr);
        }

        return [...newDates];
    };

    const showToast = (message, duration = 1500) => {
        setToastState({ show: true, message });
        setTimeout(() => setToastState({ show: false, message: "" }), duration);
    };

    const getRowColFromDay = (dayNum, startingDay) => {
        const dayIndex = dayNum - 1;
        const cellIndex = startingDay + dayIndex;
        return {
            row: Math.floor(cellIndex / 7),
            col: cellIndex % 7,
        };
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

    // ===== 터치 관련 함수들 =====
    const clearTouchTimeout = () => {
        if (touchState.timeout) {
            clearTimeout(touchState.timeout);
            setTouchState((prev) => ({
                ...prev,
                timeout: null,
                pendingDay: null,
            }));
        }
    };

    const handleTouchPending = (day) => {
        if (!touchState.isEnabled || day === null) return;

        clearTouchTimeout();

        setTouchState((prev) => ({ ...prev, pendingDay: day }));

        const timer = setTimeout(() => {
            if (!dragState.isDragging) {
                handleTapSelection(day);
            }
            setTouchState((prev) => ({
                ...prev,
                pendingDay: null,
                timeout: null,
            }));
        }, TAP_THRESHOLD);

        setTouchState((prev) => ({ ...prev, timeout: timer }));
    };

    const handleTouchMove = (event) => {
        if (!touchState.pendingDay && !dragState.isDragging) return;

        const touch = event.touches[0];
        const dx = Math.abs(touch.clientX - touchState.startPos.x);
        const dy = Math.abs(touch.clientY - touchState.startPos.y);
        const moved = dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD;

        if (moved && touchState.pendingDay && !dragState.isDragging) {
            handleDragSelectionStart(touchState.pendingDay);
        }

        if (dragState.isDragging) {
            event.preventDefault();
            const element = document.elementFromPoint(
                touch.clientX,
                touch.clientY
            );
            const dayElement = element?.closest("[data-day]");

            if (dayElement) {
                const day = parseInt(dayElement.getAttribute("data-day"));
                if (day) {
                    handleDragEnter(day, event);
                }
            }
        }
    };

    const handleTouchEnd = () => {
        clearTouchTimeout();

        if (dragState.isDragging) {
            handleDragEnd();
        }
    };

    // ===== 드래그 관련 함수들 =====
    const calculateRectangleSelection = (startDay, endDay) => {
        const { startingDay, daysInMonth, year, month } = getCalendarData();
        const startPos = getRowColFromDay(startDay, startingDay);
        const endPos = getRowColFromDay(endDay, startingDay);

        const minRow = Math.min(startPos.row, endPos.row);
        const maxRow = Math.max(startPos.row, endPos.row);
        const minCol = Math.min(startPos.col, endPos.col);
        const maxCol = Math.max(startPos.col, endPos.col);

        let currentDragDates = new Set(selectedDates);

        for (let row = minRow; row <= maxRow; row++) {
            for (let col = minCol; col <= maxCol; col++) {
                const cellIndex = row * 7 + col;
                const dayNum = cellIndex - startingDay + 1;

                if (dayNum >= 1 && dayNum <= daysInMonth) {
                    const dateStr = formatDate(year, month, dayNum);

                    if (dragState.isAddMode) {
                        currentDragDates.add(dateStr);
                    } else {
                        currentDragDates.delete(dateStr);
                    }
                }
            }
        }

        return [...currentDragDates];
    };

    const handleDragSelectionStart = (day) => {
        if (!touchState.isEnabled || day === null) return;

        clearTouchTimeout();

        const { year, month } = getCalendarData();
        const dateStr = formatDate(year, month, day);
        const isAddMode = !selectedDates.includes(dateStr);

        if (isAddMode && selectedDates.length >= MAX_SELECTED_DATES) {
            showToast("날짜 선택은 최대 31일까지 가능합니다.");
            return;
        }

        setDragState({
            isDragging: true,
            startDay: day,
            isAddMode,
        });

        onChange(toggleDate(dateStr, selectedDates, isAddMode));
    };

    const handleDragEnter = (day, event) => {
        if (
            !dragState.isDragging ||
            day === null ||
            dragState.startDay === null
        )
            return;

        const newSelection = calculateRectangleSelection(
            dragState.startDay,
            day
        );

        if (newSelection.length > MAX_SELECTED_DATES) {
            showToast("날짜 선택은 최대 31일까지 가능합니다.");
            handleDragEnd();
            return;
        }

        onChange(newSelection);
    };

    const handleDragEnd = () => {
        setDragState({
            isDragging: false,
            startDay: null,
            isAddMode: true,
        });
    };

    // ===== 메인 이벤트 핸들러들 =====
    const handleDragStart = (day, event) => {
        if (day === null) return;

        const isTouch = event.type === "touchstart";
        const isMouseDrag = event.buttons && event.type === "mousedown";

        if (isTouch) {
            const touch = event.touches[0];
            setTouchState((prev) => ({
                ...prev,
                startPos: { x: touch.clientX, y: touch.clientY },
            }));
            handleTouchPending(day);
            return;
        }

        if (!isMouseDrag) {
            handleTapSelection(day);
            return;
        }

        // 마우스 드래그 시작
        const { year, month } = getCalendarData();
        const dateStr = formatDate(year, month, day);
        const isAddMode = !selectedDates.includes(dateStr);

        if (isAddMode && selectedDates.length >= MAX_SELECTED_DATES) {
            showToast("날짜 선택은 최대 31일까지 가능합니다.");
            return;
        }

        setDragState({
            isDragging: true,
            startDay: day,
            isAddMode,
        });

        onChange(toggleDate(dateStr, selectedDates, isAddMode));
    };

    const handleTapSelection = (day) => {
        if (!touchState.isEnabled || day === null) return;

        const { year, month } = getCalendarData();
        const dateStr = formatDate(year, month, day);
        const willAdd = !selectedDates.includes(dateStr);

        if (willAdd && selectedDates.length >= MAX_SELECTED_DATES) {
            showToast("날짜 선택은 최대 31일까지 가능합니다.");
            return;
        }

        onChange(toggleDate(dateStr, selectedDates));
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
            clearTouchTimeout();
        };
    }, [touchState.timeout]);

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
                    onMouseLeave={handleDragEnd}
                    onMouseUp={handleDragEnd}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {days.map((day, index) => {
                        const dateStr = day
                            ? formatDate(year, month, day)
                            : null;
                        const isPendingTouch = touchState.pendingDay === day;
                        const isSelected =
                            day !== null && selectedDates?.includes(dateStr);
                        const isDragStartDay =
                            dragState.isDragging && dragState.startDay === day;

                        return (
                            <div
                                key={index}
                                data-day={day}
                                onMouseDown={(e) => handleDragStart(day, e)}
                                onMouseEnter={() => handleDragEnter(day)}
                                onTouchStart={(e) => handleDragStart(day, e)}
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
                                        isDragStartDay
                                            ? "bg-blue-200 rounded-full ring-2 ring-blue-300 ring-opacity-50"
                                            : ""
                                    }
                                    ${
                                        isPendingTouch && !isSelected
                                            ? "bg-blue-50 rounded-full"
                                            : ""
                                    }
                                    ${
                                        day !== null &&
                                        !isSelected &&
                                        !isPendingTouch &&
                                        !isDragStartDay &&
                                        (!isCurrentMonth || day !== today)
                                            ? "md:hover:bg-gray-200 rounded-full"
                                            : ""
                                    }
                                `}
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
