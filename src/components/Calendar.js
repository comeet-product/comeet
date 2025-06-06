"use client";
import React, { useState, useRef, useEffect } from "react";

export default function Calendar({ onChange = () => {}, selectedDates = [] }) {
    // ===== 상수 정의 =====
    const MOVE_THRESHOLD = 15; // 15px 이상 움직이면 드래그 (PC 전용)
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

    // PC 드래그 선택 상태 관리 - TimetableSelect와 동일
    const [isDragSelecting, setIsDragSelecting] = useState(false);
    const [dragStartDay, setDragStartDay] = useState(null);
    const [dragMode, setDragMode] = useState("select"); // 'select' or 'deselect'

    // PC 터치 처리 상태 - TimetableSelect와 동일
    const [pendingTouchDay, setPendingTouchDay] = useState(null);
    const [touchStartPosition, setTouchStartPosition] = useState(null);
    const [hasMoved, setHasMoved] = useState(false);
    const [isSelectionEnabled, setIsSelectionEnabled] = useState(true);

    // 즉시 시각적 피드백을 위한 로컬 선택 상태
    const [localSelectedDates, setLocalSelectedDates] = useState(
        new Set(selectedDates)
    );

    // 컴포넌트 초기화 추적
    const isInitializedRef = useRef(false);

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

    // ===== 모바일 터치 처리 로직 (현재 버전 유지 - reference.js 방식) =====

    // 모바일 전용 날짜 선택/해제 함수
    const toggleDateSelection = (day) => {
        if (day === null) return;

        const { year, month } = getCalendarData();
        const dateStr = formatDate(year, month, day);

        const newLocalDates = new Set(localSelectedDates);

        if (newLocalDates.has(dateStr)) {
            newLocalDates.delete(dateStr);
        } else {
            if (newLocalDates.size >= MAX_SELECTED_DATES) {
                showToast("날짜 선택은 최대 31일까지 가능합니다.");
                return;
            }
            newLocalDates.add(dateStr);
        }

        const datesArray = [...newLocalDates];
        setLocalSelectedDates(newLocalDates);
        onChange(datesArray);
    };

    // 모바일 전용 전역 터치 이벤트 핸들러 (현재 버전 유지)
    const handleGlobalTouch = (e) => {
        // Calendar 영역 내에서만 처리
        if (!calendarRef.current?.contains(e.target)) {
            return;
        }

        // 날짜 셀인지 확인
        const dayElement = e.target.closest("[data-day]");
        if (!dayElement) {
            return;
        }

        const day = parseInt(dayElement.getAttribute("data-day"));
        if (!day) {
            return;
        }

        // 터치 시작 시에만 선택 처리 (현재 방식 완전 유지)
        if (e.type === "touchstart") {
            e.preventDefault(); // 기본 동작 방지
            toggleDateSelection(day);
        }
    };

    // ===== PC 전용 TimetableSelect에서 가져온 선택/드래그 로직 =====

    // PC 전용 마우스 시작 처리 (즉시 선택 및 드래그 준비) - 무조건 선택
    const handleMouseStart = (day, clientX, clientY) => {
        if (day === null) {
            return;
        }

        // 마우스 시작 위치와 대기 날짜 설정
        setTouchStartPosition({ x: clientX, y: clientY });
        setPendingTouchDay(day);
        setHasMoved(false);

        // 마우스 시작 시 무조건 즉시 선택 (조건 없이, 단순하게)
        const { year, month } = getCalendarData();
        const dateStr = formatDate(year, month, day);

        console.log("Mouse started on day:", day, "dateStr:", dateStr);

        const newLocalDates = new Set(localSelectedDates);
        if (newLocalDates.has(dateStr)) {
            newLocalDates.delete(dateStr); // 이미 선택된 경우 해제
            console.log("Date removed on mouse start:", dateStr);
        } else {
            if (newLocalDates.size >= MAX_SELECTED_DATES) {
                showToast("날짜 선택은 최대 31일까지 가능합니다.");
                return;
            }
            newLocalDates.add(dateStr); // 선택되지 않은 경우 선택
            console.log("Date added on mouse start:", dateStr);
        }

        // 즉시 상태 업데이트
        setLocalSelectedDates(newLocalDates);
        onChange([...newLocalDates]);
    };

    // PC 전용 마우스 이동 처리 (드래그 감지) - TimetableSelect 그대로
    const handleMouseMove = (day, clientX, clientY) => {
        if (!touchStartPosition || !pendingTouchDay || !isSelectionEnabled) {
            return;
        }

        const dx = Math.abs(clientX - touchStartPosition.x);
        const dy = Math.abs(clientY - touchStartPosition.y);
        const moved = dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD;

        // 움직임이 감지되고 아직 드래그 모드가 아니면 드래그 시작
        if (!hasMoved && moved) {
            setHasMoved(true);

            // 드래그 선택 시작
            if (!isDragSelecting) {
                handleDragSelectionStart(pendingTouchDay);
            }
        }

        // 드래그 중이면 현재 위치까지 선택 확장
        if (isDragSelecting && hasMoved) {
            handleDragSelectionMove(day);
        }
    };

    // PC 전용 마우스 종료 처리 (드래그가 아니면 이미 선택된 상태 유지) - TimetableSelect 그대로
    const handleMouseEnd = () => {
        if (!isSelectionEnabled) {
            return;
        }

        // 드래그 선택 중이었다면 종료
        if (isDragSelecting) {
            handleDragSelectionEnd();
        }

        // 상태 초기화
        setTouchStartPosition(null);
        setPendingTouchDay(null);
        setHasMoved(false);
    };

    // 드래그 선택 시작 (움직임이 감지되었을 때) - TimetableSelect 그대로
    const handleDragSelectionStart = (day) => {
        if (!isSelectionEnabled) {
            return;
        }

        const { year, month } = getCalendarData();
        const dateStr = formatDate(year, month, day);
        const isCurrentlySelected = localSelectedDates.has(dateStr);

        // 현재 날짜의 선택 상태에 따라 드래그 모드 결정
        // 마우스 시작 시 이미 선택 처리되었으므로, 현재 선택 상태로 드래그 모드 결정
        const mode = isCurrentlySelected ? "select" : "deselect";

        setIsDragSelecting(true);
        setDragStartDay(day);
        setDragMode(mode);

        // 시작 날짜는 이미 마우스 시작 시점에 처리되었으므로 추가 처리 없음
        // 드래그 모드만 설정하고 실제 선택/해제는 드래그 이동 시 처리
    };

    // 드래그 선택 중 - Calendar.js는 직사각형 선택 지원
    const handleDragSelectionMove = (day) => {
        if (!isDragSelecting || !isSelectionEnabled || !dragStartDay) {
            return;
        }

        // 직사각형 범위의 모든 날짜 선택
        selectDatesInRange(dragStartDay, day);
    };

    // 드래그 선택 종료 - TimetableSelect 그대로
    const handleDragSelectionEnd = () => {
        setIsDragSelecting(false);
        setDragStartDay(null);
        setDragMode("select");
    };

    // 개별 터치/클릭 선택 (드래그가 아닌 단순 탭) - 단순화
    const handleTapSelection = (day) => {
        // 마우스 시작에서 이미 처리되므로 여기서는 추가 작업 없음
        console.log(
            "handleTapSelection called but already handled in mouse start"
        );
    };

    // 범위 내 날짜들 선택/해제 - 연속 날짜 선택 (16일→26일 = 16~26일)
    const selectDatesInRange = (startDay, endDay) => {
        if (!startDay || !endDay) return;

        const { daysInMonth, year, month } = getCalendarData();

        // 시작일과 끝일 정렬 (작은 값이 시작)
        const minDay = Math.min(startDay, endDay);
        const maxDay = Math.max(startDay, endDay);

        console.log(`Selecting range: ${minDay} to ${maxDay}`);

        const newSelectedDates = new Set(localSelectedDates);

        // 시작일부터 끝일까지 연속으로 선택
        for (let dayNum = minDay; dayNum <= maxDay; dayNum++) {
            if (dayNum >= 1 && dayNum <= daysInMonth) {
                const dateStr = formatDate(year, month, dayNum);

                if (dragMode === "select") {
                    newSelectedDates.add(dateStr);
                } else {
                    newSelectedDates.delete(dateStr);
                }
            }
        }

        if (newSelectedDates.size > MAX_SELECTED_DATES) {
            showToast("날짜 선택은 최대 31일까지 가능합니다.");
            handleDragSelectionEnd();
            return;
        }

        // 로컬 상태 즉시 업데이트 (즉시 시각적 피드백)
        setLocalSelectedDates(newSelectedDates);

        // 부모 컴포넌트에 변경사항 전달
        onChange([...newSelectedDates]);
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

    // 모바일 전용 전역 터치 이벤트 등록 (현재 버전 유지)
    useEffect(() => {
        window.addEventListener("touchstart", handleGlobalTouch, {
            passive: false,
        });
        window.addEventListener("touchend", handleGlobalTouch, {
            passive: false,
        });

        return () => {
            window.removeEventListener("touchstart", handleGlobalTouch);
            window.removeEventListener("touchend", handleGlobalTouch);
        };
    }, [localSelectedDates]);

    // 초기화 시에만 selectedDates와 동기화 (이후 완전히 무시)
    useEffect(() => {
        if (!isInitializedRef.current) {
            setLocalSelectedDates(new Set(selectedDates));
            isInitializedRef.current = true;
        }
        // 초기화 후에는 selectedDates prop 변경 완전히 무시
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
                    onMouseLeave={handleDragSelectionEnd}
                    onMouseUp={handleMouseEnd}
                >
                    {days.map((day, index) => {
                        const dateStr = day
                            ? formatDate(year, month, day)
                            : null;
                        const isSelected =
                            day !== null && localSelectedDates.has(dateStr);
                        const isDragStartDay =
                            isDragSelecting &&
                            dragStartDay === day &&
                            dragMode === "select";

                        return (
                            <div
                                key={index}
                                data-day={day}
                                onMouseDown={(e) =>
                                    handleMouseStart(day, e.clientX, e.clientY)
                                }
                                onMouseEnter={(e) =>
                                    handleMouseMove(day, e.clientX, e.clientY)
                                }
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
                                        isDragStartDay
                                            ? "bg-blue-200 rounded-full ring-2 ring-blue-300 ring-opacity-50"
                                            : ""
                                    }
                                    ${
                                        day !== null &&
                                        !isSelected &&
                                        !isDragStartDay &&
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
