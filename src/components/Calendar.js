"use client";
import React, { useState, useRef, useEffect } from "react";

export default function Calendar({ onChange, selectedDates }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isDateSelectorOpen, setIsDateSelectorOpen] = useState(false);
    const [dragState, setDragState] = useState({
        isDragging: false,
        startDay: null,
        isAddMode: true
    });
    const dateSelectorRef = useRef(null);

    // 날짜 선택 관련 유틸리티 함수
    const toggleDate = (dateStr, dates, isAdd = null) => {
        const newDates = new Set(dates);
        if (isAdd === null) {
            // 토글 모드
            if (newDates.has(dateStr)) {
                newDates.delete(dateStr);
            } else {
                newDates.add(dateStr);
            }
        } else if (isAdd) {
            // 추가 모드
            newDates.add(dateStr);
        } else {
            // 제거 모드
            newDates.delete(dateStr);
        }
        return [...newDates];
    };

    const formatDate = (year, month, day) => {
        const monthStr = String(month + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        return `${year}-${monthStr}-${dayStr}`;
    };

    // 이벤트 핸들러
    const handleDateClick = (day) => {
        if (day === null) return;
        const dateStr = formatDate(year, month, day);
        onChange(toggleDate(dateStr, selectedDates));
    };

    const handleDragStart = (day, event) => {
        if (day === null) return;

        // 일반 클릭
        if (!event.buttons) {
            handleDateClick(day);
            return;
        }

        // 드래그 시작
        const dateStr = formatDate(year, month, day);
        const isAddMode = !selectedDates.includes(dateStr);
        setDragState({
            isDragging: true,
            startDay: day,
            isAddMode
        });

        // 드래그 시작 날짜 선택 상태 변경
        onChange(toggleDate(dateStr, selectedDates, isAddMode));
    };

    const handleDragEnter = (day) => {
        if (!dragState.isDragging || day === null || dragState.startDay === null) return;

        const start = Math.min(dragState.startDay, day);
        const end = Math.max(dragState.startDay, day);
        
        let newDates = new Set(selectedDates);
        
        // 드래그 범위의 모든 날짜에 대해 동일한 동작(추가 또는 제거) 수행
        for (let i = 1; i <= 31; i++) {
            const dateStr = formatDate(year, month, i);
            if (i >= start && i <= end) {
                if (dragState.isAddMode) {
                    newDates.add(dateStr);
                } else {
                    newDates.delete(dateStr);
                }
            }
        }
        
        onChange([...newDates]);
    };

    const handleDragEnd = () => {
        setDragState({
            isDragging: false,
            startDay: null,
            isAddMode: true
        });
    };

    // 드롭다운 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dateSelectorRef.current && !dateSelectorRef.current.contains(event.target)) {
                setIsDateSelectorOpen(false);
            }
        };

        document.addEventListener('mouseup', handleClickOutside);
        return () => {
            document.removeEventListener('mouseup', handleClickOutside);
        };
    }, []);

    // 달력 관련 계산
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
    const yearOptions = Array.from({ length: 21 }, (_, i) => year - 10 + i);

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDay = firstDayOfMonth.getDay();

    // 달력에 표시될 날짜 배열 생성
    const days = [];
    for (let i = 0; i < startingDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    while (days.length % 7 !== 0) days.push(null);

    const today = new Date().getDate();
    const isCurrentMonth = new Date().getFullYear() === year && new Date().getMonth() === month;

    // 네비게이션 핸들러
    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleYearSelect = (selectedYear) => {
        setCurrentDate(new Date(selectedYear, month, 1));
        setIsDateSelectorOpen(false);
    };

    const handleMonthSelect = (selectedMonth) => {
        setCurrentDate(new Date(year, selectedMonth, 1));
        setIsDateSelectorOpen(false);
    };

    return (
        <div className="flex flex-col w-[360px] h-[380px] items-start p-5 bg-white shadow">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 w-full">
                {/* 년월 표시 */}
                <div className="flex items-center relative" ref={dateSelectorRef}>
                    <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => setIsDateSelectorOpen(!isDateSelectorOpen)}
                    >
                        <span className="text-[16px] font-semibold tracking-[-0.38px] whitespace-nowrap">
                            {year}
                        </span>
                        <span className="ml-1 text-[16px] font-semibold tracking-[-0.38px] min-w-[25px] whitespace-nowrap">
                            {monthNames[month]}
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
                                        className={`px-3 py-2 cursor-pointer hover:bg-gray-100
                                            ${y === year ? 'bg-blue-50 text-blue-600' : ''}
                                        `}
                                    >
                                        {y}
                                    </div>
                                ))}
                            </div>
                            {/* 월 선택 */}
                            <div className="w-20 max-h-60 overflow-y-auto">
                                {monthNames.map((m, index) => (
                                    <div
                                        key={m}
                                        onClick={() => handleMonthSelect(index)}
                                        className={`px-3 py-2 cursor-pointer hover:bg-gray-100
                                            ${index === month ? 'bg-blue-50 text-blue-600' : ''}
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
                        className="w-5 h-5 flex items-center justify-center cursor-pointer text-[#3674B5] hover:text-[#3674B5]/80 font-medium"
                    >
                        &lt;
                    </span>
                    <span
                        onClick={handleNextMonth}
                        className="w-5 h-5 flex items-center justify-center cursor-pointer text-[#3674B5] hover:text-[#3674B5]/80 font-medium"
                    >
                        &gt;
                    </span>
                </div>
            </div>

            {/* Calendar Content Container */}
            <div className="flex flex-col w-full flex-1">
                {/* Weekdays */}
                <div className="grid grid-cols-7 text-center mb-2 w-full">
                    {weekdays.map((day) => (
                        <div key={day} className="flex items-center justify-center h-10 text-sm text-gray-500">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div 
                    className="grid grid-cols-7 gap-1 w-full"
                    onMouseLeave={handleDragEnd}
                    onMouseUp={handleDragEnd}
                >
                    {days.map((day, index) => {
                        const dateStr = day ? formatDate(year, month, day) : null;
                        return (
                            <div
                                key={index}
                                onMouseDown={(e) => handleDragStart(day, e)}
                                onMouseEnter={() => handleDragEnter(day)}
                                className={`
                                    w-11 h-11 flex items-center justify-center select-none
                                    ${day === null ? "invisible" : "cursor-pointer"}
                                    ${
                                        day !== null &&
                                        isCurrentMonth &&
                                        day === today
                                            ? "text-blue-600 font-bold"
                                            : ""
                                    }
                                    ${
                                        day !== null && selectedDates.includes(dateStr)
                                            ? "bg-blue-100 rounded-full"
                                            : ""
                                    }
                                    ${
                                        day !== null &&
                                        !selectedDates.includes(dateStr) &&
                                        (!isCurrentMonth || day !== today)
                                            ? "hover:bg-gray-200 rounded-full"
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
