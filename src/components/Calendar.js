"use client";
import React, { useState, useRef, useEffect } from "react";

export default function Calendar({ onChange = () => {}, selectedDates = [] }) {
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

    // 터치 처리 상태 (TimetableSelect 방식 재적용)
    const [pendingTouchDay, setPendingTouchDay] = useState(null);
    const [touchTimeout, setTouchTimeout] = useState(null);
    const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 });
    const [isSelectionEnabled, setIsSelectionEnabled] = useState(true);
    const TAP_THRESHOLD = 80; // 80ms 후 탭으로 확정
    const MOVE_THRESHOLD = 8; // 8px 이상 움직이면 드래그

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
    const handleDragStart = (day, event) => {
        if (day === null) return;

        const isTouch = event.type === "touchstart";
        const isMouseDrag = event.buttons && event.type === "mousedown";

        // 터치 이벤트 처리 - TimetableSelect 방식
        if (isTouch) {
            const touch = event.touches[0];
            setTouchStartPos({ x: touch.clientX, y: touch.clientY });
            handleTouchPending(day);
            return;
        }

        // 마우스 이벤트 처리 (기존 로직)
        if (!isMouseDrag) {
            handleTapSelection(day);
            return;
        }

        // 마우스 드래그 시작
        const dateStr = formatDate(year, month, day);
        const isAddMode = !selectedDates.includes(dateStr);

        if (isAddMode && selectedDates.length >= 31) {
            setToastMessage("날짜 선택은 최대 31일까지 가능합니다.");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 1500);
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

        // 수평/수직 드래그 모두 지원 - 직사각형 범위 선택
        const startDay = dragState.startDay;
        const endDay = day;

        // 날짜를 행(주)과 열(요일)로 변환
        const getRowCol = (dayNum) => {
            const dayIndex = dayNum - 1; // 0-based index
            const totalCells = startingDay + daysInMonth;
            let cellIndex = startingDay + dayIndex;
            return {
                row: Math.floor(cellIndex / 7),
                col: cellIndex % 7,
            };
        };

        const startPos = getRowCol(startDay);
        const endPos = getRowCol(endDay);

        // 직사각형 범위 계산
        const minRow = Math.min(startPos.row, endPos.row);
        const maxRow = Math.max(startPos.row, endPos.row);
        const minCol = Math.min(startPos.col, endPos.col);
        const maxCol = Math.max(startPos.col, endPos.col);

        let currentDragDates = new Set(selectedDates);

        // 직사각형 범위 내의 모든 유효한 날짜 처리
        for (let row = minRow; row <= maxRow; row++) {
            for (let col = minCol; col <= maxCol; col++) {
                const cellIndex = row * 7 + col;
                const dayNum = cellIndex - startingDay + 1;

                // 유효한 날짜인지 확인
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

        // 31일 제한 체크
        if (currentDragDates.size > 31) {
            setToastMessage("날짜 선택은 최대 31일까지 가능합니다.");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 1500);
            handleDragEnd(); // 드래그 종료
            return;
        }

        // 변경사항 적용
        onChange([...currentDragDates]);
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

    // 터치 무브 핸들러 - TimetableSelect 방식 (수평 드래그 허용)
    const handleTouchMove = (event) => {
        if (!pendingTouchDay && !dragState.isDragging) return;

        const touch = event.touches[0];
        const dx = Math.abs(touch.clientX - touchStartPos.x);
        const dy = Math.abs(touch.clientY - touchStartPos.y);
        const moved = dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD;

        // 움직임이 감지되면 드래그 시작
        if (moved && pendingTouchDay && !dragState.isDragging) {
            handleDragSelectionStart(pendingTouchDay);
        }

        // 드래그 중이면 범위 선택 처리
        if (dragState.isDragging) {
            event.preventDefault(); // 페이지 스크롤 방지
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

    // 터치 엔드 핸들러 - TimetableSelect 방식
    const handleTouchEnd = () => {
        // 대기 중인 터치 타이머 정리
        if (touchTimeout) {
            clearTimeout(touchTimeout);
            setTouchTimeout(null);
        }
        setPendingTouchDay(null);

        // 드래그 중이었다면 종료
        if (dragState.isDragging) {
            handleDragEnd();
        }
    };

    // 드롭다운 외부 클릭 감지 및 터치 타이머 cleanup
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

        // cleanup 함수에서 터치 타이머 정리
        return () => {
            document.removeEventListener("mouseup", handleClickOutside);

            if (touchTimeout) {
                clearTimeout(touchTimeout);
            }
        };
    }, [touchTimeout]);

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

    // 현재 년도부터 +10년까지만 표시 (이전 년도 제거)
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear + i);

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

    // 터치 대기 시작 (TimetableSelect 방식)
    const handleTouchPending = (day) => {
        if (!isSelectionEnabled || day === null) return;

        // 기존 타이머가 있다면 클리어
        if (touchTimeout) {
            clearTimeout(touchTimeout);
        }

        // 대기 중인 날짜 설정
        setPendingTouchDay(day);

        // 일정 시간 후 개별 선택으로 확정 (드래그가 시작되지 않았을 때만)
        const timer = setTimeout(() => {
            if (!dragState.isDragging) {
                handleTapSelection(day);
            }
            setPendingTouchDay(null);
        }, TAP_THRESHOLD);

        setTouchTimeout(timer);
    };

    // 드래그 선택 시작 (움직임이 감지되었을 때)
    const handleDragSelectionStart = (day) => {
        if (!isSelectionEnabled || day === null) return;

        // 대기 중인 터치 취소
        if (touchTimeout) {
            clearTimeout(touchTimeout);
            setTouchTimeout(null);
        }
        setPendingTouchDay(null);

        const dateStr = formatDate(year, month, day);
        const isAddMode = !selectedDates.includes(dateStr);

        // 31일 제한 체크
        if (isAddMode && selectedDates.length >= 31) {
            setToastMessage("날짜 선택은 최대 31일까지 가능합니다.");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 1500);
            return;
        }

        setDragState({
            isDragging: true,
            startDay: day,
            isAddMode,
        });

        // 시작 날짜 즉시 선택/해제
        onChange(toggleDate(dateStr, selectedDates, isAddMode));
    };

    // 개별 터치/클릭 선택 (드래그가 아닌 단순 탭)
    const handleTapSelection = (day) => {
        if (!isSelectionEnabled || day === null) return;

        const dateStr = formatDate(year, month, day);
        const willAdd = !selectedDates.includes(dateStr);

        // 31일 제한 체크
        if (willAdd && selectedDates.length >= 31) {
            setToastMessage("날짜 선택은 최대 31일까지 가능합니다.");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 1500);
            return;
        }

        // 날짜 토글
        onChange(toggleDate(dateStr, selectedDates));
    };

    return (
        <div className="flex flex-col w-full items-start">
            {/* Toast Message */}
            {showToast && (
                <div className="fixed bottom-[65px] left-1/2 transform -translate-x-1/2 z-50">
                    <div className="bg-red-500 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
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
                                {monthNames.map((m, index) => (
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
                        const isPendingTouch = pendingTouchDay === day;
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
