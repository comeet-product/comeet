"use client";

import { useState, useEffect } from "react";

export default function Half({
    dayIndex,
    halfIndex,
    isTop,
    isFirstHour,
    hasHourAbove,
    isFirstDay,
    hasDateHeaderAbove,
    selectedSlots,
    onSlotSelection,
    onTapSelection,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseStart,
    onMouseMove,
    onMouseEnd,
    onDragSelectionStart,
    onDragSelectionMove,
    onDragSelectionEnd,
    isSelectionEnabled,
    isDragSelecting,
    pendingTouchSlot,
    verticalDragThreshold,
}) {
    const slotId = `${dayIndex}-${halfIndex}`;

    // selectedSlots가 Map인지 Set인지 확인하여 처리
    let isSelected = false;
    let slotOpacity = 100; // 기본 투명도 100%

    if (selectedSlots instanceof Map) {
        // Map인 경우 (결과 데이터)
        const slotData = selectedSlots.get(slotId);
        if (slotData) {
            isSelected = true;
            slotOpacity = slotData.opacity;
        }
    } else if (selectedSlots instanceof Set || selectedSlots?.has) {
        // Set인 경우 (사용자 availability)
        isSelected = selectedSlots.has(slotId);
    }

    // 선택된 셀의 배경색 결정
    const getBackgroundColor = () => {
        if (isSelected) {
            return `#3674B5${Math.round(slotOpacity * 2.55)
                .toString(16)
                .padStart(2, "0")}`;
        } else if (isPending) {
            // 선택 대기 중인 셀
            return "#3674B526";
        } else {
            return "transparent";
        }
    };

    const isPending =
        pendingTouchSlot &&
        pendingTouchSlot.dayIndex === dayIndex &&
        pendingTouchSlot.halfIndex === halfIndex;

    // 디바이스 타입 감지
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
            const isSmallScreen = window.innerWidth <= 768;
            setIsMobile(hasTouch && isSmallScreen);
        };

        checkIsMobile();
        window.addEventListener("resize", checkIsMobile);
        return () => window.removeEventListener("resize", checkIsMobile);
    }, []);

    // ===== 모바일 전용 터치 이벤트 핸들러 =====

    // 모바일 전용 터치 관련 로컬 상태
    const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 });
    const [localTouchMoved, setLocalTouchMoved] = useState(false);
    const [touchStartTimestamp, setTouchStartTimestamp] = useState(0);

    const TOUCH_MOVE_THRESHOLD = 8; // 8px 이상 움직이면 드래그로 간주

    const handleMobileTouchStart = (e) => {
        if (!isSelectionEnabled || e.touches.length > 1) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        const touch = e.touches[0];

        setTouchStartPos({ x: touch.clientX, y: touch.clientY });
        setTouchStartTimestamp(Date.now());
        setLocalTouchMoved(false);

        if (onTouchStart) {
            onTouchStart(dayIndex, halfIndex, touch.clientY);
        }
    };

    const handleMobileTouchMove = (e) => {
        if (e.touches.length !== 1) {
            return;
        }

        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - touchStartPos.x);
        const deltaY = Math.abs(touch.clientY - touchStartPos.y);

        if (
            (deltaX > TOUCH_MOVE_THRESHOLD || deltaY > TOUCH_MOVE_THRESHOLD) &&
            !localTouchMoved
        ) {
            setLocalTouchMoved(true);
        }

        if (onTouchMove) {
            onTouchMove(dayIndex, halfIndex, touch.clientY);
        }

        if (isDragSelecting && onDragSelectionMove) {
            const elementBelow = document.elementFromPoint(
                touch.clientX,
                touch.clientY
            );

            if (
                elementBelow &&
                elementBelow.dataset.dayIndex &&
                elementBelow.dataset.halfIndex
            ) {
                const newDayIndex = parseInt(elementBelow.dataset.dayIndex);
                const newHalfIndex = parseInt(elementBelow.dataset.halfIndex);

                onDragSelectionMove(newDayIndex, newHalfIndex);
            }
        }
    };

    const handleMobileTouchEnd = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (onTouchEnd) {
            onTouchEnd();
        }

        setTimeout(() => {
            setTouchStartPos({ x: 0, y: 0 });
            setLocalTouchMoved(false);
            setTouchStartTimestamp(0);
        }, 50);
    };

    // ===== PC 전용 마우스 이벤트 핸들러 =====

    const handlePCMouseDown = (e) => {
        if (!isSelectionEnabled) return;

        e.preventDefault();
        e.stopPropagation();

        if (onMouseStart) {
            onMouseStart(dayIndex, halfIndex, e.clientX, e.clientY);
        }
    };

    const handlePCMouseMove = (e) => {
        if (onMouseMove) {
            onMouseMove(dayIndex, halfIndex, e.clientX, e.clientY);
        }
    };

    const handlePCMouseEnter = (e) => {
        if (isDragSelecting && onDragSelectionMove) {
            onDragSelectionMove(dayIndex, halfIndex);
        }
    };

    const handlePCMouseUp = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (onMouseEnd) {
            onMouseEnd();
        }
    };

    return (
        <div
            className={`time-slot w-full h-[17px] border-gray-500 cursor-pointer transition-colors duration-150 ${
                isTop === undefined
                    ? `border-[1.3px] ${hasHourAbove ? "border-t-0" : ""} ${
                          !isFirstDay ? "border-l-0" : ""
                      } ${hasDateHeaderAbove ? "border-t-0" : ""}`
                    : isTop
                    ? `border-[1px] border-b-[1px] border-b-gray-400 ${
                          !isFirstHour ? "border-t-0" : ""
                      } ${!isFirstDay ? "border-l-0" : ""} ${
                          hasDateHeaderAbove ? "border-t-0" : ""
                      }`
                    : `border-[1.3px] border-t-0 ${
                          !isFirstDay ? "border-l-0" : ""
                      }`
            }`}
            style={{
                backgroundColor: getBackgroundColor(),
                userSelect: "none",
                WebkitUserSelect: "none",
                touchAction: isMobile ? "none" : "none",
            }}
            {...(isMobile
                ? {
                      onTouchStart: handleMobileTouchStart,
                      onTouchMove: handleMobileTouchMove,
                      onTouchEnd: handleMobileTouchEnd,
                  }
                : {
                      onMouseDown: handlePCMouseDown,
                      onMouseMove: handlePCMouseMove,
                      onMouseEnter: handlePCMouseEnter,
                      onMouseUp: handlePCMouseUp,
                  })}
            data-day-index={String(dayIndex)}
            data-half-index={String(halfIndex)}
        ></div>
    );
}
