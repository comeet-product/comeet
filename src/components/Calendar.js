"use client";
import React, { useState, useRef, useEffect } from "react";

export default function Calendar({ onChange, selectedDates = [] }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isDateSelectorOpen, setIsDateSelectorOpen] = useState(false);
    const [dragState, setDragState] = useState({
        isDragging: false,
        startDay: null,
        isAddMode: true,
    });
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const dateSelectorRef = useRef(null);

    // 날짜 선택 관련 유틸리티 함수
    const toggleDate = (dateStr, dates, isAdd = null) => {
        const newDates = new Set(dates);

        // 추가하려는 경우 미리 31일 초과 체크
        const shouldAdd = isAdd === null ? !newDates.has(dateStr) : isAdd;
        if (shouldAdd && newDates.size >= 31) {
            // 31일 초과 시 변경 없이 기존 날짜 배열 반환
            return [...dates];
        }

        // 실제 날짜 추가 또는 제거
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
        const monthStr = String(month + 1).padStart(2, "0");
        const dayStr = String(day).padStart(2, "0");
        return `${year}-${monthStr}-${dayStr}`;
    };

    // 이벤트 핸들러
    const handleDateClick = (day) => {
        if (day === null) return;

        const dateStr = formatDate(year, month, day);

        // 클릭 시도 전에 31일 초과 여부 먼저 체크
        const willAdd = !selectedDates.includes(dateStr);
        if (willAdd && selectedDates.length >= 31) {
            setToastMessage("날짜 선택은 최대 31일까지 가능합니다.");
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
            }, 1500);
            return; // 31일 초과 시 선택 방지
        }

        // 31개 미만일 경우에만 toggleDate 호출 및 onChange 실행
        const newDates = toggleDate(dateStr, selectedDates);
        // toggleDate가 31일 초과로 인해 기존 배열을 반환한 경우 (이 로직은 위에서 막지만 안전망 차원)
        if (newDates.length === selectedDates.length && willAdd) {
            // 이미 위에서 return 되므로 이 블록은 실행되지 않아야 하지만, 로직 변경 시 안전망
            setToastMessage("날짜 선택은 최대 31일까지 가능합니다.");
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
            }, 1500);
        } else {
            onChange(newDates);
        }
    };

    const handleDragStart = (day, event) => {
        if (day === null) return;

        // 일반 클릭
        if (!event.buttons) {
            handleDateClick(day);
            return;
        }

        const dateStr = formatDate(year, month, day);
        const isAddMode = !selectedDates.includes(dateStr);

        // 드래그 시작 시점에도 31일 이상 선택되어 있다면 드래그 시작 방지 및 토스트 표시 (추가 모드일 때만)
        if (isAddMode && selectedDates.length >= 31) {
            setToastMessage("날짜 선택은 최대 31일까지 가능합니다.");
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
            }, 1500);
            setDragState({
                isDragging: false,
                startDay: null,
                isAddMode: true,
            }); // 드래그 상태 초기화
            return;
        }

        // 드래그 시작
        setDragState({
            isDragging: true,
            startDay: day,
            isAddMode,
        });

        // 드래그 시작 날짜 선택 상태 변경 (31일 제한은 이미 위에서 체크됨)
        // 드래그 시작 날짜가 이미 31개 포함 상태에서 제거 모드일때는 토글 호출, 추가 모드일때는 이미 위에서 걸러짐
        if (!isAddMode || selectedDates.length < 31) {
            onChange(toggleDate(dateStr, selectedDates, isAddMode));
        }
    };

    const handleDragEnter = (day) => {
        if (
            !dragState.isDragging ||
            day === null ||
            dragState.startDay === null
        )
            return;

        const start = Math.min(dragState.startDay, day);
        const end = Math.max(dragState.startDay, day);

        let potentialNewDates = new Set(selectedDates);

        // 드래그 범위의 모든 날짜를 잠재적 새 날짜에 추가/제거
        for (let i = start; i <= end; i++) {
            const dateStr = formatDate(year, month, i);
            if (dragState.isAddMode) {
                potentialNewDates.add(dateStr);
            } else {
                potentialNewDates.delete(dateStr);
            }
        }

        // 31일 초과 체크
        if (potentialNewDates.size > 31) {
            setToastMessage("날짜 선택은 최대 31일까지 가능합니다.");
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
            }, 1500);
            handleDragEnd(); // 드래그 종료
            return; // 변경 적용 안 함
        }

        // 31일 초과하지 않으면 변경 사항 반영
        // 드래그 중 실시간 선택 상태 변경
        let currentDragDates = new Set(selectedDates);
        for (let i = 1; i <= daysInMonth; i++) {
            // 현재 달의 모든 날짜를 순회
            const dateStr = formatDate(year, month, i);
            const isWithinDragRange = i >= start && i <= end;

            if (dragState.isAddMode) {
                // 드래그 범위 내 날짜는 추가
                if (isWithinDragRange) {
                    currentDragDates.add(dateStr);
                }
            } else {
                // 드래그 범위 내 날짜는 제거
                if (isWithinDragRange) {
                    currentDragDates.delete(dateStr);
                }
            }
        }

        // 31일 제한을 통과한 경우에만 onChange 호출
        if (currentDragDates.size <= 31) {
            onChange([...currentDragDates]);
        }
    };

    const handleDragEnd = () => {
        setDragState({
            isDragging: false,
            startDay: null,
            isAddMode: true,
        });
        // 드래그 종료 시 마지막 상태로 onChange 호출 (handleDragEnter에서 이미 호출될 수 있음)
        // 필요에 따라 여기에 마지막 selectedDates 상태를 onChange로 전달
        // onChange([...selectedDates]); // 현재 selectedDates 상태로 업데이트
    };

    // 드롭다운 외부 클릭 감지
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

    // 달력 관련 계산
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
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
    const isCurrentMonth =
        new Date().getFullYear() === year && new Date().getMonth() === month;

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
        <div className="flex flex-col w-full items-start">
            {/* Toast Message */}
            {showToast && (
                <div className="fixed bottom-[65px] left-1/2 transform -translate-x-1/2 z-50">
                    <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
                        {toastMessage}
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
                                        className={`px-3 py-2 cursor-pointer hover:bg-[#3674B5]/10
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
                                {monthNames.map((m, index) => (
                                    <div
                                        key={m}
                                        onClick={() => handleMonthSelect(index)}
                                        className={`px-3 py-2 cursor-pointer hover:bg-[#3674B5]/10
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
                    onMouseLeave={handleDragEnd}
                    onMouseUp={handleDragEnd}
                >
                    {days.map((day, index) => {
                        const dateStr = day
                            ? formatDate(year, month, day)
                            : null;
                        return (
                            <div
                                key={index}
                                onMouseDown={(e) => handleDragStart(day, e)}
                                onMouseEnter={() => handleDragEnter(day)}
                                className={`
                                    w-full aspect-square flex items-center justify-center select-none text-base
                                    ${
                                        day === null
                                            ? "invisible"
                                            : "cursor-pointer"
                                    }
                                    ${
                                        day !== null &&
                                        isCurrentMonth &&
                                        day === today
                                            ? "text-blue-600 font-bold"
                                            : "text-black"
                                    }
                                    ${
                                        day !== null &&
                                        selectedDates?.includes(dateStr)
                                            ? "bg-blue-100 rounded-full"
                                            : ""
                                    }
                                    ${
                                        day !== null &&
                                        !selectedDates.includes(dateStr) &&
                                        (!isCurrentMonth || day !== today)
                                            ? "hover:bg-gray-200 rounded-full"
                                            : ""
                                    }                                `}
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
