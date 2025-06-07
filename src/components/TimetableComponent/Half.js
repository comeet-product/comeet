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

    // 선택된 셀의 배경색 결정
    const getBackgroundColor = () => {
        if (isUserSelected) {
            // 사용자가 직접 선택한 셀은 주황색으로 표시
            return "rgb(44, 102, 239)";
        } else if (isSelected) {
            // 다른 사용자들의 선택은 기존 opacity 기반 색상
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
            // 더 정확한 모바일 감지
            const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
            const isSmallScreen = window.innerWidth <= 768;
            const userAgent = navigator.userAgent.toLowerCase();
            const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
            
            // 터치 기능이 있고 화면이 작거나 모바일 유저에이전트인 경우에만 모바일로 판단
            const mobileResult = hasTouch && (isSmallScreen || isMobileUA);
            
            console.log('🔍 Mobile Detection Details:', { 
                hasTouch, 
                isSmallScreen,
                isMobileUA,
                mobileResult,
                userAgent: navigator.userAgent,
                windowWidth: window.innerWidth 
            });
            
            setIsMobile(mobileResult);
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
    const [touchDirection, setTouchDirection] = useState(null); // 'vertical', 'horizontal', null

    const TOUCH_MOVE_THRESHOLD = 8; // 8px 이상 움직이면 드래그로 간주
    const DIRECTION_THRESHOLD = 15; // 방향 감지를 위한 임계값

    const handleMobileTouchStart = (e) => {
        console.log('🔥 TOUCH START EVENT FIRED!', {
            dayIndex, 
            halfIndex,
            touchesLength: e.touches.length,
            isMobile,
            onCellClick: !!onCellClick,
            isSelectionEnabled
        });
        
        // onCellClick이 있으면서 선택 기능이 비활성화된 경우(TimetableResult)나 
        // 선택 기능이 활성화된 경우(TimetableSelect) 모두 처리
        const shouldProcessTouch = (onCellClick && !isSelectionEnabled) || isSelectionEnabled;
        
        // 두 손가락 이상의 터치라면 무시
        if (!shouldProcessTouch || e.touches.length > 1) {
            console.log('❌ Touch ignored:', { shouldProcessTouch, touchesLength: e.touches.length });
            return;
        }

        const touch = e.touches[0];

        // 터치 시작 위치와 시간 기록
        setTouchStartPos({ x: touch.clientX, y: touch.clientY });
        setTouchStartTimestamp(Date.now());
        setLocalTouchMoved(false);
        setTouchDirection(null); // 방향 초기화

        console.log('✅ Touch start processed successfully');

        // 선택 기능이 활성화된 경우에만 preventDefault (TimetableSelect)
        if (isSelectionEnabled) {
            e.preventDefault();
            e.stopPropagation();
            
            // 상위 컴포넌트의 터치 시작 핸들러 호출
            if (onTouchStart) {
                onTouchStart(dayIndex, halfIndex, touch.clientY);
            }
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

        // 방향이 아직 결정되지 않았고 충분한 움직임이 감지된 경우
        if (!touchDirection && (deltaX > DIRECTION_THRESHOLD || deltaY > DIRECTION_THRESHOLD)) {
            if (deltaY > deltaX) {
                setTouchDirection('vertical'); // 세로 방향
                console.log('🔽 Vertical drag detected');
            } else {
                setTouchDirection('horizontal'); // 가로 방향  
                console.log('↔️ Horizontal drag detected - allowing scroll');
                return; // 가로 방향이면 이후 처리하지 않음 (스크롤 허용)
            }
        }

        // 가로 방향 드래그인 경우 처리하지 않음 (스크롤 허용)
        if (touchDirection === 'horizontal') {
            return;
        }

        // 움직임이 충분히 감지되면 localTouchMoved 설정
        if (
            (deltaX > TOUCH_MOVE_THRESHOLD || deltaY > TOUCH_MOVE_THRESHOLD) &&
            !localTouchMoved
        ) {
            setLocalTouchMoved(true);
        }

        // 세로 방향 드래그이고 선택 기능이 활성화된 경우에만 처리
        if (touchDirection === 'vertical' && isSelectionEnabled) {
            e.preventDefault();
            e.stopPropagation();

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
        }
    };

    const handleMobileTouchEnd = (e) => {
        console.log('👋 Touch end:', { touchDirection, localTouchMoved, isSelectionEnabled });

        // 세로 방향 드래그이고 선택 기능이 활성화된 경우에만 preventDefault
        if (touchDirection === 'vertical' && isSelectionEnabled) {
            e.preventDefault();
            e.stopPropagation();

            // 상위 컴포넌트의 터치 종료 핸들러 호출
            if (onTouchEnd) {
                onTouchEnd();
            }
        }

        // 상태 초기화
        setTimeout(() => {
            setTouchStartPos({ x: 0, y: 0 });
            setLocalTouchMoved(false);
            setTouchStartTimestamp(0);
            setTouchDirection(null);
        }, 50);
    };

    // ===== PC 전용 마우스 이벤트 핸들러 (Calendar.js 방식) =====

    // PC에서는 마우스 다운 이벤트 처리 (Result에서는 사용 안함, Select에서만 사용)
    const handlePCMouseDown = (e) => {
        if (!isSelectionEnabled) return; // TimetableResult에서는 마우스 다운 무시

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

    // ===== 공통 클릭 핸들러 (백업용) =====
    const handleCommonClick = (e) => {
        console.log('🖱️ Common Click Event Fired!', {
            dayIndex,
            halfIndex,
            isMobile,
            onCellClick: !!onCellClick,
            isSelectionEnabled,
            touchDirection,
            localTouchMoved,
            eventType: e.type
        });

        // 가로 방향 드래그였다면 클릭 무시 (스크롤로 간주)
        if (touchDirection === 'horizontal') {
            console.log('↔️ Ignoring click after horizontal drag');
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        // TimetableResult에서 셀 클릭 처리 (isSelectionEnabled가 false일 때)
        if (onCellClick && !isSelectionEnabled && !localTouchMoved) {
            console.log('✅ Calling onCellClick');
            onCellClick(dayIndex, halfIndex, pageStartDay || 0);
        }
        // 선택 기능이 활성화된 경우 (세로 방향 드래그가 아닌 탭)
        else if (isSelectionEnabled && onTapSelection && touchDirection !== 'vertical' && !localTouchMoved) {
            console.log('✅ Calling onTapSelection');
            onTapSelection(dayIndex, halfIndex);
        }
    };

    // 조건부 이벤트 핸들러 계산
    const shouldUseMobileEvents = isMobile && (((onCellClick && !isSelectionEnabled) || isSelectionEnabled));
    const shouldUsePCEvents = !isMobile;
    const shouldUseCommonClick = (onCellClick && !isSelectionEnabled) || isSelectionEnabled;
    
    console.log('Event Handler Conditions:', {
        isMobile,
        onCellClick: !!onCellClick,
        isSelectionEnabled,
        shouldUseMobileEvents,
        shouldUsePCEvents,
        shouldUseCommonClick,
        dayIndex,
        halfIndex
    });

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
                touchAction: "manipulation", // 모바일에서 더 나은 터치 응답성
            }}
            // 클릭 이벤트 (모든 디바이스 공통)
            onClick={shouldUseCommonClick ? handleCommonClick : undefined}
            // 선택 기능이 활성화된 경우에만 터치/마우스 이벤트 추가 (TimetableSelect)
            {...(isSelectionEnabled ? {
                ...(isMobile ? {
                    // 모바일: 터치 이벤트
                    onTouchStart: handleMobileTouchStart,
                    onTouchMove: handleMobileTouchMove,
                    onTouchEnd: handleMobileTouchEnd,
                } : {
                    // PC: 마우스 이벤트
                    onMouseDown: handlePCMouseDown,
                    onMouseMove: handlePCMouseMove,
                    onMouseEnter: handlePCMouseEnter,
                    onMouseUp: handlePCMouseUp,
                })
            } : {})}
            data-day-index={String(dayIndex)}
            data-half-index={String(halfIndex)}
        ></div>
    );
}
