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

    const isPending =
        pendingTouchSlot &&
        pendingTouchSlot.dayIndex === dayIndex &&
        pendingTouchSlot.halfIndex === halfIndex;

    // 디바이스 타입 감지
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            // 터치 디바이스 여부와 화면 크기로 모바일 판단
            const hasTouch =
                "ontouchstart" in window || navigator.maxTouchPoints > 0;
            const isSmallScreen = window.innerWidth <= 768;
            setIsMobile(hasTouch && isSmallScreen);
        };

        checkIsMobile();
        window.addEventListener("resize", checkIsMobile);
        return () => window.removeEventListener("resize", checkIsMobile);
    }, []);

    // ===== 모바일 전용 터치 이벤트 핸들러 (현재 방식 유지) =====

    // 모바일 전용 터치 관련 로컬 상태
    const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 });
    const [localTouchMoved, setLocalTouchMoved] = useState(false);
    const [touchStartTimestamp, setTouchStartTimestamp] = useState(0);

    const TOUCH_MOVE_THRESHOLD = 8; // 8px 이상 움직이면 드래그로 간주

    const handleMobileTouchStart = (e) => {
        // 선택 기능이 비활성화되어 있거나 두 손가락 이상의 터치라면 무시
        if (!isSelectionEnabled || e.touches.length > 1) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        const touch = e.touches[0];

        // 터치 시작 위치와 시간 기록
        setTouchStartPos({ x: touch.clientX, y: touch.clientY });
        setTouchStartTimestamp(Date.now());
        setLocalTouchMoved(false);

        // 상위 컴포넌트의 터치 시작 핸들러 호출
        if (onTouchStart) {
            onTouchStart(dayIndex, halfIndex, touch.clientY);
        }
    };

    const handleMobileTouchMove = (e) => {
        // 터치가 하나일 때만 처리
        if (e.touches.length !== 1) {
            return;
        }

        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - touchStartPos.x);
        const deltaY = Math.abs(touch.clientY - touchStartPos.y);

        // 움직임이 충분히 감지되면 localTouchMoved 설정
        if (
            (deltaX > TOUCH_MOVE_THRESHOLD || deltaY > TOUCH_MOVE_THRESHOLD) &&
            !localTouchMoved
        ) {
            setLocalTouchMoved(true);
        }

        // 상위 컴포넌트의 터치 이동 핸들러 호출
        if (onTouchMove) {
            onTouchMove(dayIndex, halfIndex, touch.clientY);
        }

        // 이미 드래그 선택 중이면 드래그 이동도 처리
        if (isDragSelecting && onDragSelectionMove) {
            // 터치 포인트 아래의 엘리먼트 찾기
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

                // 드래그 이동 처리
                onDragSelectionMove(newDayIndex, newHalfIndex);
            }
        }
    };

    const handleMobileTouchEnd = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // 상위 컴포넌트의 터치 종료 핸들러 호출
        if (onTouchEnd) {
            onTouchEnd();
        }

        // 상태 초기화
        setTimeout(() => {
            setTouchStartPos({ x: 0, y: 0 });
            setLocalTouchMoved(false);
            setTouchStartTimestamp(0);
        }, 50);
    };

    // ===== PC 전용 마우스 이벤트 핸들러 (Calendar.js 방식) =====

    const handlePCMouseDown = (e) => {
        if (!isSelectionEnabled) return;

        e.preventDefault();
        e.stopPropagation();

        // 상위 컴포넌트의 마우스 시작 핸들러 호출 (즉시 선택 포함)
        if (onMouseStart) {
            onMouseStart(dayIndex, halfIndex, e.clientX, e.clientY);
        }
    };

    const handlePCMouseMove = (e) => {
        // 상위 컴포넌트의 마우스 이동 핸들러 호출
        if (onMouseMove) {
            onMouseMove(dayIndex, halfIndex, e.clientX, e.clientY);
        }
    };

    const handlePCMouseEnter = (e) => {
        // 전역 드래그 중일 때만 드래그 이동 처리
        if (isDragSelecting && onDragSelectionMove) {
            onDragSelectionMove(dayIndex, halfIndex);
        }
    };

    const handlePCMouseUp = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // 상위 컴포넌트의 마우스 종료 핸들러 호출
        if (onMouseEnd) {
            onMouseEnd();
        }
    };

    // PC에서는 onClick 이벤트 사용하지 않음 (mouseDown에서 즉시 처리)
    const handlePCClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // PC에서는 마우스 다운에서 이미 처리되므로 여기서는 아무것도 하지 않음
    };

    // ===== 모바일 전용 클릭 핸들러 =====

    const handleMobileClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // 모바일에서는 클릭 이벤트로 탭 선택 처리 (백업용)
        if (isSelectionEnabled && onTapSelection && !localTouchMoved) {
            onTapSelection(dayIndex, halfIndex);
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
                backgroundColor: isSelected
                    ? `#3674B5${Math.round(slotOpacity * 2.55)
                          .toString(16)
                          .padStart(2, "0")}` // main color with dynamic opacity
                    : isPending
                    ? "#3674B526" // main color with 10% opacity (26 in hex = ~15% opacity)
                    : "transparent",
                userSelect: "none",
                WebkitUserSelect: "none",
                touchAction: isMobile ? "manipulation" : "none",
            }}
            // 조건부 이벤트 핸들러 (디바이스별 분기)
            {...(isMobile
                ? {
                      // 모바일: 터치 이벤트 + 클릭 백업
                      onClick: handleMobileClick,
                      onTouchStart: handleMobileTouchStart,
                      onTouchMove: handleMobileTouchMove,
                      onTouchEnd: handleMobileTouchEnd,
                  }
                : {
                      // PC: 마우스 이벤트만
                      onClick: handlePCClick,
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
