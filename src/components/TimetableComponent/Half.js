"use client";

import { useState, useEffect } from "react";

// 선택된 셀 테두리 색상 설정
const SELECTED_CELL_BORDER_COLOR = "rgb(14, 58, 205)"; // 진한 파란색

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
    onCellClick,
    pageStartDay,
}) {
    const slotId = `${dayIndex}-${halfIndex}`;

    // selectedSlots가 Map인지 Set인지 확인하여 처리
    let isSelected = false;
    let slotOpacity = 100; // 기본 투명도 100%
    let isUserSelected = false; // 사용자가 클릭해서 선택된 셀인지 구분

    if (selectedSlots instanceof Map) {
        // Map인 경우 (결과 데이터)
        const slotData = selectedSlots.get(slotId);
        if (slotData) {
            isSelected = true;
            slotOpacity = slotData.opacity;
            isUserSelected = slotData.isSelected || false; // 사용자 선택 여부 확인
        }
    } else if (selectedSlots instanceof Set || selectedSlots?.has) {
        // Set인 경우 (사용자 availability)
        isSelected = selectedSlots.has(slotId);
    }

    // 연결된 선택 셀들의 경계 계산 (외곽선 표시를 위해)
    const getSmartBorder = () => {
        if (!isUserSelected || !(selectedSlots instanceof Map)) {
            return {};
        }

        // 인접한 셀들이 선택되어 있는지 확인
        const checkAdjacent = (dIndex, hIndex) => {
            const adjacentSlotId = `${dIndex}-${hIndex}`;
            const adjacentData = selectedSlots.get(adjacentSlotId);
            return adjacentData?.isSelected || false;
        };

        // 상하좌우 인접 셀 확인
        const hasTop = checkAdjacent(dayIndex, halfIndex - 1);
        const hasBottom = checkAdjacent(dayIndex, halfIndex + 1);
        const hasLeft = checkAdjacent(dayIndex - 1, halfIndex);
        const hasRight = checkAdjacent(dayIndex + 1, halfIndex);

        // 가장 겉 테두리만 표시 (인접하지 않은 방향에만)
        return {
            borderTop: !hasTop ? `2px solid ${SELECTED_CELL_BORDER_COLOR}` : undefined,
            borderBottom: !hasBottom ? `2px solid ${SELECTED_CELL_BORDER_COLOR}` : undefined,
            borderLeft: !hasLeft ? `2px solid ${SELECTED_CELL_BORDER_COLOR}` : undefined,
            borderRight: !hasRight ? `2px solid ${SELECTED_CELL_BORDER_COLOR}` : undefined,
        };
    };

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

    // PC에서는 onClick 이벤트도 처리 (Result에서 사용)
    const handlePCClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('PC Click:', { dayIndex, halfIndex, onCellClick: !!onCellClick, isSelectionEnabled, pageStartDay });
        
        // TimetableResult에서 셀 클릭 처리
        if (onCellClick && !isSelectionEnabled) {
            onCellClick(dayIndex, halfIndex, pageStartDay || 0);
        }
        // PC에서 선택 기능이 활성화된 경우는 마우스 다운에서 이미 처리됨
    };

    // ===== 모바일 전용 클릭 핸들러 =====

    const handleMobileClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('Mobile Click:', { dayIndex, halfIndex, onCellClick: !!onCellClick, isSelectionEnabled, localTouchMoved, pageStartDay });

        // TimetableResult에서 셀 클릭 처리
        if (onCellClick && !isSelectionEnabled && !localTouchMoved) {
            onCellClick(dayIndex, halfIndex, pageStartDay || 0);
        }
        // 모바일에서 선택 기능이 활성화된 경우 탭 선택 처리 (백업용)
        else if (isSelectionEnabled && onTapSelection && !localTouchMoved) {
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
                          .padStart(2, "0")}` // 선택 여부와 관계없이 opacity에 따른 배경색
                    : isPending
                    ? "#3674B526" // main color with 10% opacity (26 in hex = ~15% opacity)
                    : "transparent",
                userSelect: "none",
                WebkitUserSelect: "none",
                touchAction: isMobile ? "manipulation" : "none",
                // 스마트 border 적용 (연결된 셀들의 외곽선만 표시)
                ...getSmartBorder(),
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
