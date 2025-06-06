"use client";

import { useState, useRef, useEffect } from "react";
import TimeHeader from "./TimeHeader";
import Timetable from "./Timetable";

export default function TimetableSelect({
    selectedSlots: externalSelectedSlots,
    onSlotsChange,
    meeting,
}) {
    // ===== 상수 정의 =====
    const MOVE_THRESHOLD = 15; // PC 전용: 15px 이상 움직이면 드래그
    const VERTICAL_DRAG_THRESHOLD = 8; // 모바일 전용: 8px 이상 수직 이동하면 드래그로 인식
    const MOBILE_SCROLL_SENSITIVITY = 0.2; // 모바일 x축 스크롤 민감도 (0.4 = 40% 속도)

    // States for gesture and view control
    const [visibleDayCount, setVisibleDayCount] = useState(7); // 기본값을 7로 고정
    const [startTouchX, setStartTouchX] = useState(0);
    const [startTouch1, setStartTouch1] = useState({ x: 0, y: 0 });
    const [startTouch2, setStartTouch2] = useState({ x: 0, y: 0 });
    const [initialDistance, setInitialDistance] = useState(0);
    const [gestureScale, setGestureScale] = useState(1);
    const [centerColumnIndex, setCenterColumnIndex] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);

    // 시간 슬롯 선택 상태 관리 - 외부 props 또는 내부 상태 사용
    const [internalSelectedSlots, setInternalSelectedSlots] = useState(
        new Set()
    );
    const selectedSlots = externalSelectedSlots || internalSelectedSlots;
    const setSelectedSlots = onSlotsChange || setInternalSelectedSlots;

    const [isSelectionEnabled, setIsSelectionEnabled] = useState(true);

    // 드래그 선택 상태 관리
    const [isDragSelecting, setIsDragSelecting] = useState(false);
    const [dragStartSlot, setDragStartSlot] = useState(null);
    const [dragMode, setDragMode] = useState("select"); // 'select' or 'deselect'

    // PC/모바일 공통 터치 처리 상태
    const [pendingTouchSlot, setPendingTouchSlot] = useState(null);
    const [touchStartPosition, setTouchStartPosition] = useState(null);
    const [hasMoved, setHasMoved] = useState(false);

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

    // Refs for DOM elements
    const containerRef = useRef(null);
    const timetableRef = useRef(null);
    const scrollTimeoutRef = useRef(null);

    // Constants - meeting 데이터 기반으로 계산
    const TOTAL_DAYS = meeting?.dates?.length || 9;
    const MIN_VISIBLE_DAYS = 1;
    const MAX_VISIBLE_DAYS = 7;
    const DATE_HEADER_HEIGHT = 28;

    // meeting 기반 시간 설정
    const getMeetingTimeInfo = () => {
        if (!meeting?.selectable_time) {
            return {
                startTime: 10,
                halfCount: 16,
            };
        }

        const startHHMM = meeting.selectable_time.start || 900; // 기본값 9:00 (900)
        const endHHMM = meeting.selectable_time.end || 1700; // 기본값 17:00 (1700)

        // 시작 시간 분석 (HHMM 형식)
        const startHour = Math.floor(startHHMM / 100);
        const startMinute = startHHMM % 100;

        // 종료 시간 분석 (HHMM 형식)
        const endHour = Math.floor(endHHMM / 100);
        const endMinute = endHHMM % 100;

        // 30분 단위로 정확한 시작 시간 계산
        // 9시 30분 = 9.5, 10시 = 10.0
        const startTimeInHalfHours =
            startHour * 2 + (startMinute >= 30 ? 1 : 0);
        const endTimeInHalfHours = endHour * 2 + (endMinute >= 30 ? 1 : 0);

        // 실제 표시할 시작 시간 (30분 단위 고려)
        const displayStartTime = startTimeInHalfHours / 2;

        // 총 30분 단위 슬롯 개수
        const totalHalfHours = endTimeInHalfHours - startTimeInHalfHours;

        return {
            startTime: displayStartTime, // 9.5 (9시 30분), 10.0 (10시)
            halfCount: totalHalfHours,
        };
    };

    const { startTime, halfCount } = getMeetingTimeInfo();

    // ===== 유틸리티 함수 =====
    const getSlotKey = (dayIndex, halfIndex) => `${dayIndex}-${halfIndex}`;

    const toggleSlot = (slotKey, slots, isAdd = null) => {
        const newSlots = new Set(slots);
        const shouldAdd = isAdd === null ? !newSlots.has(slotKey) : isAdd;

        if (isAdd === null) {
            newSlots.has(slotKey)
                ? newSlots.delete(slotKey)
                : newSlots.add(slotKey);
        } else if (isAdd) {
            newSlots.add(slotKey);
        } else {
            newSlots.delete(slotKey);
        }

        return newSlots;
    };

    // 터치 지점에서 컬럼 인덱스 계산
    const getColumnIndexFromTouch = (clientX) => {
        const timetable = timetableRef.current;
        if (!timetable) return 0;

        const timetableRect = timetable.getBoundingClientRect();
        const relativeX = clientX - timetableRect.left + timetable.scrollLeft;
        const columnWidth = timetable.scrollWidth / TOTAL_DAYS;
        const columnIndex = Math.floor(relativeX / columnWidth);

        return Math.max(0, Math.min(columnIndex, TOTAL_DAYS - 1));
    };

    // 컬럼의 visibility ratio 계산
    const getColumnVisibilityRatio = (columnIndex) => {
        const timetable = timetableRef.current;
        if (!timetable) return 0;

        const columnWidth = timetable.scrollWidth / TOTAL_DAYS;
        const columnStartX = columnIndex * columnWidth;
        const columnEndX = columnStartX + columnWidth;

        const viewportStartX = timetable.scrollLeft;
        const viewportEndX = viewportStartX + timetable.clientWidth;

        // 컬럼과 뷰포트의 교집합 계산
        const visibleStartX = Math.max(columnStartX, viewportStartX);
        const visibleEndX = Math.min(columnEndX, viewportEndX);
        const visibleWidth = Math.max(0, visibleEndX - visibleStartX);

        return visibleWidth / columnWidth;
    };

    // Auto-Align 함수 - 가장 가까운 컬럼으로 스냅
    const autoAlignToColumn = () => {
        // auto-align 기능 제거 - 자유로운 스크롤을 위해 비활성화
        return;
        
        // const timetable = timetableRef.current;
        // if (!timetable || visibleDayCount >= TOTAL_DAYS) return;

        // const columnWidth = timetable.scrollWidth / TOTAL_DAYS;
        // const viewportStartX = timetable.scrollLeft;
        // const viewportCenterX = viewportStartX + timetable.clientWidth / 2;

        // // 뷰포트 중심에 가장 가까운 컬럼 찾기
        // const centerColumnFloat = viewportCenterX / columnWidth;
        // const nearestColumn = Math.round(centerColumnFloat);

        // // 스크롤 가능한 범위 내에서 조정
        // const maxScrollColumns = TOTAL_DAYS - visibleDayCount;
        // let targetColumn = Math.max(
        //     0,
        //     Math.min(nearestColumn, maxScrollColumns)
        // );

        // // 현재 스크롤 위치가 컬럼 경계에 얼마나 가까운지 확인
        // const currentColumnFloat = viewportStartX / columnWidth;
        // const currentColumnIndex = Math.floor(currentColumnFloat);
        // const columnProgress = currentColumnFloat - currentColumnIndex;

        // // 이미 충분히 정렬되어 있다면 스킵 (5% 이내의 오차)
        // if (columnProgress < 0.05 || columnProgress > 0.95) {
        //     return;
        // }

        // // 타겟 컬럼의 시작 위치로 부드럽게 스크롤
        // const targetScrollLeft = targetColumn * columnWidth;

        // // 현재 위치와 충분히 다를 때만 스크롤 (2px 이상 차이)
        // if (Math.abs(timetable.scrollLeft - targetScrollLeft) > 2) {
        //     timetable.scrollTo({
        //         left: targetScrollLeft,
        //         behavior: "smooth",
        //     });
        // }
    };

    // 스크롤 종료 감지 (debounce)
    const handleScrollEnd = () => {
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(() => {
            setIsScrolling(false);
            // 드래그 선택 중이 아닐 때만 선택 기능 활성화
            if (!isDragSelecting) {
                setIsSelectionEnabled(true);
            }
            // Auto-align 제거 - 자유로운 스크롤을 위해 비활성화
            // autoAlignToColumn();
        }, 100); // 100ms 후 스크롤이 끝난 것으로 간주 (더 빠르게)
    };

    // 중심 컬럼을 기준으로 스크롤 위치 조정
    const adjustScrollForCenterColumn = (newVisibleCount, centerCol) => {
        const timetable = timetableRef.current;
        if (!timetable || newVisibleCount >= TOTAL_DAYS) {
            return;
        }

        // 중심 컬럼이 화면 중앙에 오도록 스크롤 위치 계산
        const targetCenterPosition =
            centerCol - Math.floor(newVisibleCount / 2);
        const maxScrollColumns = TOTAL_DAYS - newVisibleCount;
        const safeScrollPosition = Math.max(
            0,
            Math.min(targetCenterPosition, maxScrollColumns)
        );

        // 실제 픽셀 단위로 스크롤 위치 설정
        const columnWidth = timetable.scrollWidth / TOTAL_DAYS;
        const targetScrollLeft = safeScrollPosition * columnWidth;

        timetable.scrollLeft = targetScrollLeft;

        // 스크롤 위치 업데이트 (상태 저장 없이 직접 처리)

        // Auto-align 제거 - 자유로운 스크롤을 위해 비활성화
        // setTimeout(() => {
        //     autoAlignToColumn();
        // }, 100);
    };

    // 핀치와 스와이프를 구분하는 함수
    const isSameDirectionMove = (
        touch1Start,
        touch1Current,
        touch2Start,
        touch2Current
    ) => {
        const touch1DeltaX = touch1Current.clientX - touch1Start.x;
        const touch2DeltaX = touch2Current.clientX - touch2Start.x;

        const isSameDirectionX =
            (touch1DeltaX > 10 && touch2DeltaX > 10) ||
            (touch1DeltaX < -10 && touch2DeltaX < -10);

        const currentDistance = Math.hypot(
            touch1Current.clientX - touch2Current.clientX,
            touch1Current.clientY - touch2Current.clientY
        );

        const distanceDifference = Math.abs(currentDistance - initialDistance);

        return isSameDirectionX && distanceDifference < 30;
    };

    // ===== 모바일 전용 터치 처리 로직 (현재 방식 유지) =====

    // 모바일 전용 시간 슬롯 선택/해제 함수
    const handleMobileSlotSelection = (dayIndex, halfIndex) => {
        // 스크롤 중이거나 선택이 비활성화된 경우 무시
        if (isScrolling || !isSelectionEnabled) {
            return;
        }

        const slotId = `${dayIndex}-${halfIndex}`;
        setSelectedSlots((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(slotId)) {
                newSet.delete(slotId); // 이미 선택된 경우 해제
            } else {
                newSet.add(slotId); // 선택되지 않은 경우 선택
            }
            return newSet;
        });
    };

    // 모바일 전용 터치 시작 처리 (즉시 선택 및 드래그 준비)
    const handleMobileTouchStart = (dayIndex, halfIndex, clientY) => {
        if (!isSelectionEnabled) {
            return;
        }

        // 터치 시작 위치와 대기 슬롯 설정
        setTouchStartPosition({ y: clientY });
        setPendingTouchSlot({ dayIndex, halfIndex });
        setHasMoved(false);

        // 터치 시작 시 즉시 선택 처리 (자연스러운 UX)
        handleMobileTapSelection(dayIndex, halfIndex);
    };

    // 모바일 전용 터치 이동 처리 (수직 드래그 감지)
    const handleMobileTouchMove = (dayIndex, halfIndex, clientY) => {
        if (!touchStartPosition || !pendingTouchSlot || !isSelectionEnabled) {
            return;
        }

        const verticalDistance = clientY - touchStartPosition.y;

        // 수직 아래 방향으로 임계값 이상 이동했을 때 드래그 시작
        if (!hasMoved && verticalDistance >= VERTICAL_DRAG_THRESHOLD) {
            setHasMoved(true);

            // 드래그 선택 시작
            if (!isDragSelecting) {
                handleMobileDragSelectionStart(
                    pendingTouchSlot.dayIndex,
                    pendingTouchSlot.halfIndex
                );
            }
        }

        // 드래그 중이면 현재 위치까지 선택 확장
        if (isDragSelecting && hasMoved) {
            handleMobileDragSelectionMove(dayIndex, halfIndex);
        }
    };

    // 모바일 전용 터치 종료 처리 (드래그가 아니면 이미 선택된 상태 유지)
    const handleMobileTouchEnd = () => {
        if (!isSelectionEnabled) {
            return;
        }

        // 드래그 선택 중이었다면 종료
        if (isDragSelecting) {
            handleDragSelectionEnd();
        }

        // 드래그가 아니었다면 이미 터치 시작 시점에 선택 처리되었으므로 추가 처리 없음

        // 상태 초기화
        setTouchStartPosition(null);
        setPendingTouchSlot(null);
        setHasMoved(false);
    };

    // 모바일 전용 개별 터치/클릭 선택 (드래그가 아닌 단순 탭)
    const handleMobileTapSelection = (dayIndex, halfIndex) => {
        // 빠른 응답을 위해 필수 체크만 수행
        if (!isSelectionEnabled || isDragSelecting) {
            return;
        }

        const slotId = `${dayIndex}-${halfIndex}`;
        setSelectedSlots((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(slotId)) {
                newSet.delete(slotId); // 이미 선택된 경우 해제
            } else {
                newSet.add(slotId); // 선택되지 않은 경우 선택
            }
            return newSet;
        });
    };

    // 모바일 전용 드래그 선택 시작 (움직임이 감지되었을 때)
    const handleMobileDragSelectionStart = (dayIndex, halfIndex) => {
        if (!isSelectionEnabled) {
            return;
        }

        const slotId = `${dayIndex}-${halfIndex}`;
        const isCurrentlySelected = selectedSlots.has(slotId);

        // 현재 슬롯의 선택 상태에 따라 드래그 모드 결정
        // 터치 시작 시 이미 선택 처리되었으므로, 원래 상태를 확인하여 드래그 모드 결정
        const mode = isCurrentlySelected ? "select" : "deselect";

        setIsDragSelecting(true);
        setDragStartSlot({ dayIndex, halfIndex });
        setDragMode(mode);

        // 시작 슬롯은 이미 터치 시작 시점에 처리되었으므로 추가 처리 없음
        // 드래그 모드만 설정하고 실제 선택/해제는 드래그 이동 시 처리
    };

    // 모바일 전용 드래그 선택 중
    const handleMobileDragSelectionMove = (dayIndex, halfIndex) => {
        if (
            !isDragSelecting ||
            isScrolling ||
            !isSelectionEnabled ||
            !dragStartSlot
        ) {
            return;
        }

        // 같은 day가 아니면 무시
        if (dayIndex !== dragStartSlot.dayIndex) {
            return;
        }

        // 시작점보다 아래쪽(halfIndex가 더 큰)이 아니면 무시
        if (halfIndex < dragStartSlot.halfIndex) {
            return;
        }

        // 드래그 범위의 모든 슬롯 선택
        selectSlotsInRange(dragStartSlot, { dayIndex, halfIndex });
    };

    // ===== PC 전용 마우스 처리 로직 (Calendar.js 방식) =====

    // PC 전용 마우스 시작 처리 (즉시 선택 및 드래그 준비)
    const handlePCMouseStart = (dayIndex, halfIndex, clientX, clientY) => {
        if (dayIndex === null || halfIndex === null) return;

        // 마우스 시작 위치와 대기 슬롯 설정
        setTouchStartPosition({ x: clientX, y: clientY });
        setPendingTouchSlot({ dayIndex, halfIndex });
        setHasMoved(false);

        // 마우스 시작 시 즉시 선택 처리
        const slotKey = getSlotKey(dayIndex, halfIndex);
        const wasSelected = selectedSlots.has(slotKey);

        // 현재 슬롯 상태에 따라 드래그 모드 결정
        const newDragMode = wasSelected ? "deselect" : "select";
        setDragMode(newDragMode);

        // 즉시 선택/해제 적용
        const newSlots = toggleSlot(
            slotKey,
            selectedSlots,
            newDragMode === "select"
        );
        setSelectedSlots(newSlots);

        // 드래그 시작점 설정 (시각적 강조용)
        setDragStartSlot({ dayIndex, halfIndex });
    };

    // PC 전용 마우스 이동 처리
    const handlePCMouseMove = (dayIndex, halfIndex, clientX, clientY) => {
        if (!pendingTouchSlot || !touchStartPosition) return;

        const deltaX = Math.abs(clientX - touchStartPosition.x);
        const deltaY = Math.abs(clientY - touchStartPosition.y);
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // 임계값을 넘으면 드래그 시작
        if (distance > MOVE_THRESHOLD && !isDragSelecting) {
            setHasMoved(true);
            
            // 가로방향 움직임이 더 큰 경우 스크롤 처리
            if (deltaX > deltaY && visibleDayCount < TOTAL_DAYS) {
                setIsScrolling(true);
                setIsSelectionEnabled(false);
                
                const timetable = timetableRef.current;
                if (timetable) {
                    const scrollDelta = touchStartPosition.x - clientX;
                    timetable.scrollLeft += scrollDelta;
                    // 터치 시작 위치 업데이트 (연속 스크롤을 위해)
                    setTouchStartPosition({ x: clientX, y: clientY });
                }
                return;
            }
            
            // 세로방향 움직임이 더 큰 경우에만 드래그 선택 시작
            if (deltaY >= deltaX) {
                handlePCDragSelectionStart({ dayIndex, halfIndex });
            }
        }

        // 드래그 중이면 계속 드래그 처리 (세로방향만)
        if (isDragSelecting) {
            handlePCDragSelectionMove({ dayIndex, halfIndex });
        }
    };

    // PC 전용 마우스 종료 처리
    const handlePCMouseEnd = () => {
        if (isDragSelecting) {
            handleDragSelectionEnd();
        }

        // 스크롤 상태 초기화
        if (isScrolling) {
            setIsScrolling(false);
            setIsSelectionEnabled(true);
        }

        // 상태 초기화
        setPendingTouchSlot(null);
        setTouchStartPosition(null);
        setHasMoved(false);
        setDragStartSlot(null);
    };

    // PC 전용 드래그 선택 시작
    const handlePCDragSelectionStart = (slot) => {
        setIsDragSelecting(true);
        setIsSelectionEnabled(false);
        setDragStartSlot(slot);
    };

    // PC 전용 드래그 선택 이동 (세로방향만)
    const handlePCDragSelectionMove = (currentSlot) => {
        if (!dragStartSlot || !isDragSelecting) return;

        // PC에서도 모바일처럼 세로방향으로만 드래그 선택 (가로방향 선택 막기)
        if (dragStartSlot.dayIndex !== currentSlot.dayIndex) {
            return;
        }

        // 시작점보다 아래쪽(halfIndex가 더 큰)이 아니면 무시
        if (currentSlot.halfIndex < dragStartSlot.halfIndex) {
            return;
        }

        const dayIndex = dragStartSlot.dayIndex;
        const startHalfIndex = dragStartSlot.halfIndex;
        const endHalfIndex = currentSlot.halfIndex;

        setSelectedSlots((prev) => {
            const newSelectedSlots = new Set(prev);

            // 시작점부터 끝점까지 세로로 선택
            for (
                let halfIndex = startHalfIndex;
                halfIndex <= endHalfIndex;
                halfIndex++
            ) {
                const slotId = `${dayIndex}-${halfIndex}`;

                if (dragMode === "select") {
                    newSelectedSlots.add(slotId);
                } else {
                    newSelectedSlots.delete(slotId);
                }
            }

            return newSelectedSlots;
        });
    };

    // PC 전용 탭 선택 (단일 클릭)
    const handlePCTapSelection = (dayIndex, halfIndex) => {
        const slotKey = getSlotKey(dayIndex, halfIndex);
        const newSlots = toggleSlot(slotKey, selectedSlots);
        setSelectedSlots(newSlots);
    };

    // ===== 공통 함수들 =====

    // 드래그 선택 종료
    const handleDragSelectionEnd = () => {
        setIsDragSelecting(false);
        setDragStartSlot(null);
        setDragMode("select");
        setIsSelectionEnabled(true);
    };

    // 범위 내 슬롯들 선택/해제
    const selectSlotsInRange = (startSlot, endSlot) => {
        if (!startSlot || !endSlot) return;

        // PC와 모바일 모두 세로방향으로만 드래그 선택 허용
        if (startSlot.dayIndex !== endSlot.dayIndex) {
            return;
        }

        // 시작점보다 아래쪽(halfIndex가 더 큰)이 아니면 무시
        if (endSlot.halfIndex < startSlot.halfIndex) {
            return;
        }

        const dayIndex = startSlot.dayIndex;
        const startHalfIndex = startSlot.halfIndex;
        const endHalfIndex = endSlot.halfIndex;

        setSelectedSlots((prev) => {
            const newSelectedSlots = new Set(prev);

            // 시작점부터 끝점까지 세로로 선택
            for (
                let halfIndex = startHalfIndex;
                halfIndex <= endHalfIndex;
                halfIndex++
            ) {
                const slotId = `${dayIndex}-${halfIndex}`;

                if (dragMode === "select") {
                    newSelectedSlots.add(slotId);
                } else {
                    newSelectedSlots.delete(slotId);
                }
            }

            return newSelectedSlots;
        });
    };

    // ===== 통합 핸들러 (디바이스별 분기) =====

    const handleSlotSelection = (dayIndex, halfIndex) => {
        if (isMobile) {
            return handleMobileSlotSelection(dayIndex, halfIndex);
        }
        // PC는 사용하지 않음 (마우스 다운에서 즉시 처리)
    };

    const handleTouchStart = (dayIndex, halfIndex, clientY) => {
        if (isMobile) {
            return handleMobileTouchStart(dayIndex, halfIndex, clientY);
        }
        // PC는 터치 이벤트 사용하지 않음
    };

    const handleTouchMove = (dayIndex, halfIndex, clientY) => {
        if (isMobile) {
            return handleMobileTouchMove(dayIndex, halfIndex, clientY);
        }
        // PC는 터치 이벤트 사용하지 않음
    };

    const handleTouchEnd = () => {
        if (isMobile) {
            return handleMobileTouchEnd();
        }
        // PC는 터치 이벤트 사용하지 않음
    };

    const handleMouseStart = (dayIndex, halfIndex, clientX, clientY) => {
        if (!isMobile) {
            return handlePCMouseStart(dayIndex, halfIndex, clientX, clientY);
        }
        // 모바일은 마우스 이벤트 사용하지 않음
    };

    const handleMouseMove = (dayIndex, halfIndex, clientX, clientY) => {
        if (!isMobile) {
            return handlePCMouseMove(dayIndex, halfIndex, clientX, clientY);
        }
        // 모바일은 마우스 이벤트 사용하지 않음
    };

    const handleMouseEnd = () => {
        if (!isMobile) {
            return handlePCMouseEnd();
        }
        // 모바일은 마우스 이벤트 사용하지 않음
    };

    const handleDragSelectionStart = (dayIndex, halfIndex) => {
        if (isMobile) {
            return handleMobileDragSelectionStart(dayIndex, halfIndex);
        } else {
            return handlePCDragSelectionStart({ dayIndex, halfIndex });
        }
    };

    const handleDragSelectionMove = (dayIndex, halfIndex) => {
        if (isMobile) {
            return handleMobileDragSelectionMove(dayIndex, halfIndex);
        } else {
            return handlePCDragSelectionMove({ dayIndex, halfIndex });
        }
    };

    const handleTapSelection = (dayIndex, halfIndex) => {
        if (isMobile) {
            return handleMobileTapSelection(dayIndex, halfIndex);
        } else {
            return handlePCTapSelection(dayIndex, halfIndex);
        }
    };

    // ===== 기존 핀치/줌 및 스크롤 로직 (현재 방식 유지) =====

    // 터치/클릭 이벤트가 슬롯 선택인지 판단하는 함수
    const isSlotSelectionTouch = (e) => {
        // 두 손가락 이상이면 핀치 줌이므로 선택 불가
        if (e.touches && e.touches.length > 1) {
            return false;
        }

        // 스크롤 중이면 선택 불가
        if (isScrolling || !isSelectionEnabled) {
            return false;
        }

        return true;
    };

    useEffect(() => {
        const container = containerRef.current;
        const timetable = timetableRef.current;
        if (!container || !timetable) return;

        // 브라우저 기본 제스처 차단
        const preventDefaults = (e) => {
            e.preventDefault();
        };

        // 트랙패드 제스처 이벤트 핸들러
        const handleGestureStart = (e) => {
            e.preventDefault();
            setGestureScale(e.scale);

            // 제스처 시작 지점의 컬럼 인덱스 계산
            const columnIndex = getColumnIndexFromTouch(e.clientX);
            setCenterColumnIndex(columnIndex);
        };

        const handleGestureChange = (e) => {
            e.preventDefault();

            const scaleChange = e.scale / gestureScale;

            // 스케일 변화가 충분히 클 때만 zoom 변경
            if (scaleChange > 1.15) {
                // 확대 (컬럼 감소)
                const newVisibleCount = Math.max(
                    visibleDayCount - 1,
                    MIN_VISIBLE_DAYS
                );
                if (newVisibleCount !== visibleDayCount) {
                    setVisibleDayCount(newVisibleCount);
                    adjustScrollForCenterColumn(
                        newVisibleCount,
                        centerColumnIndex
                    );
                    setGestureScale(e.scale);
                }
            } else if (scaleChange < 0.85) {
                // 축소 (컬럼 증가)
                const newVisibleCount = Math.min(
                    visibleDayCount + 1,
                    MAX_VISIBLE_DAYS
                );
                if (newVisibleCount !== visibleDayCount) {
                    setVisibleDayCount(newVisibleCount);
                    adjustScrollForCenterColumn(
                        newVisibleCount,
                        centerColumnIndex
                    );
                    setGestureScale(e.scale);
                }
            }
        };

        const handleGestureEnd = (e) => {
            e.preventDefault();
            setGestureScale(1);

            // Auto-align 제거 - 자유로운 스크롤을 위해 비활성화
            // setTimeout(() => {
            //     autoAlignToColumn();
            // }, 100);
        };

        // 휠 이벤트로 기본 확대/축소 차단
        const handleWheel = (e) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();

                // 마우스 위치의 컬럼 인덱스 계산
                const columnIndex = getColumnIndexFromTouch(e.clientX);
                setCenterColumnIndex(columnIndex);

                // Ctrl/Cmd + 휠로 zoom 제어
                const direction = e.deltaY > 0 ? 1 : -1;
                if (direction > 0) {
                    // 축소 (컬럼 증가)
                    const newVisibleCount = Math.min(
                        visibleDayCount + 1,
                        MAX_VISIBLE_DAYS
                    );
                    if (newVisibleCount !== visibleDayCount) {
                        setVisibleDayCount(newVisibleCount);
                        adjustScrollForCenterColumn(
                            newVisibleCount,
                            columnIndex
                        );
                    }
                } else {
                    // 확대 (컬럼 감소)
                    const newVisibleCount = Math.max(
                        visibleDayCount - 1,
                        MIN_VISIBLE_DAYS
                    );
                    if (newVisibleCount !== visibleDayCount) {
                        setVisibleDayCount(newVisibleCount);
                        adjustScrollForCenterColumn(
                            newVisibleCount,
                            columnIndex
                        );
                    }
                }
            }
        };

        const handleTouchStart = (e) => {
            if (e.touches.length === 1) {
                // 단일 터치 - 스크롤 및 선택 준비
                const touch = e.touches[0];
                setStartTouchX(touch.clientX);
                setStartTouch1({ x: touch.clientX, y: touch.clientY }); // 방향 감지를 위한 시작 위치 저장
                setIsScrolling(false);
                // 터치 시작 시에는 선택 기능을 활성화 상태로 유지
            } else if (e.touches.length === 2) {
                // 두 손가락 터치 - 핀치 줌 또는 스크롤 준비
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];

                setStartTouch1({ x: touch1.clientX, y: touch1.clientY });
                setStartTouch2({ x: touch2.clientX, y: touch2.clientY });

                // 두 터치 포인트 사이의 거리 계산
                const distance = Math.hypot(
                    touch1.clientX - touch2.clientX,
                    touch1.clientY - touch2.clientY
                );
                setInitialDistance(distance);

                // 중앙 위치 계산
                const centerX = (touch1.clientX + touch2.clientX) / 2;
                setStartTouchX(centerX);

                // 터치 중심점의 컬럼 인덱스 계산
                const columnIndex = getColumnIndexFromTouch(centerX);
                setCenterColumnIndex(columnIndex);

                setIsScrolling(false); // 터치 시작 시점에서는 스크롤 상태가 아님
                setIsSelectionEnabled(false); // 두 손가락 터치 시에만 선택 기능 비활성화
            }
        };

        const handleTouchMove = (e) => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];

                // 수평 스크롤 처리 (수직 드래그는 Half 컴포넌트에서 처리)
                if (visibleDayCount < TOTAL_DAYS) {
                    // 움직임의 방향을 확인하여 수평 스크롤인지 판단
                    const deltaX = Math.abs(touch.clientX - startTouch1.x);
                    const deltaY = Math.abs(touch.clientY - startTouch1.y);

                    // 수평 움직임이 세로 움직임보다 크고 최소 임계값을 넘었을 때만 스크롤 처리
                    if (deltaX > 10 && deltaX > deltaY) {
                        // 수평 우선 움직임 감지
                        e.preventDefault();
                        setIsScrolling(true);
                        setIsSelectionEnabled(false);

                        const currentX = touch.clientX;
                        const scrollDeltaX = (startTouchX - currentX) * MOBILE_SCROLL_SENSITIVITY;

                        if (timetable.scrollLeft !== undefined) {
                            timetable.scrollLeft += scrollDeltaX;
                            setStartTouchX(currentX);
                        }
                    }
                }
                // 수직 움직임은 Half 컴포넌트에서 처리
            } else if (e.touches.length === 2) {
                e.preventDefault();
                setIsScrolling(true); // 두 손가락 제스처 시작
                setIsSelectionEnabled(false); // 선택 기능 비활성화

                const touch1 = e.touches[0];
                const touch2 = e.touches[1];

                // 현재 두 손가락 사이의 거리 계산
                const currentDistance = Math.hypot(
                    touch1.clientX - touch2.clientX,
                    touch1.clientY - touch2.clientY
                );

                // 손가락이 같은 방향으로 이동하는지 확인 (드래그)
                const isDragGesture = isSameDirectionMove(
                    startTouch1,
                    touch1,
                    startTouch2,
                    touch2
                );

                if (isDragGesture && visibleDayCount < TOTAL_DAYS) {
                    // 드래그 모드: 두 손가락이 같은 방향으로 이동
                    const currentCenterX =
                        (touch1.clientX + touch2.clientX) / 2;
                    const deltaX = (startTouchX - currentCenterX) * MOBILE_SCROLL_SENSITIVITY;

                    if (timetable.scrollLeft !== undefined) {
                        timetable.scrollLeft += deltaX;
                        setStartTouchX(currentCenterX);
                    }
                } else {
                    // 확대/축소 모드: 두 손가락이 반대 방향으로 움직이거나 거리가 변함
                    const ratio = currentDistance / initialDistance;

                    if (ratio > 1.3) {
                        // 손가락을 벌리는 동작 (핀치 아웃) - 확대 효과이므로 컬럼 감소
                        const newVisibleCount = Math.max(
                            visibleDayCount - 1,
                            MIN_VISIBLE_DAYS
                        );
                        if (newVisibleCount !== visibleDayCount) {
                            setVisibleDayCount(newVisibleCount);
                            adjustScrollForCenterColumn(
                                newVisibleCount,
                                centerColumnIndex
                            );
                            setInitialDistance(currentDistance);
                            setStartTouch1({
                                x: touch1.clientX,
                                y: touch1.clientY,
                            });
                            setStartTouch2({
                                x: touch2.clientX,
                                y: touch2.clientY,
                            });
                        }
                    } else if (ratio < 0.7) {
                        // 손가락을 모으는 동작 (핀치 인) - 축소 효과이므로 컬럼 증가
                        const newVisibleCount = Math.min(
                            visibleDayCount + 1,
                            MAX_VISIBLE_DAYS
                        );
                        if (newVisibleCount !== visibleDayCount) {
                            setVisibleDayCount(newVisibleCount);
                            adjustScrollForCenterColumn(
                                newVisibleCount,
                                centerColumnIndex
                            );
                            setInitialDistance(currentDistance);
                            setStartTouch1({
                                x: touch1.clientX,
                                y: touch1.clientY,
                            });
                            setStartTouch2({
                                x: touch2.clientX,
                                y: touch2.clientY,
                            });
                        }
                    }
                }
            }
        };

        const handleGlobalTouchEnd = (e) => {
            // 터치 종료 시 Auto-Align 실행
            if (e.touches.length === 0) {
                // 즉시 상태 초기화 (지연 없이)
                setIsSelectionEnabled(true);

                handleScrollEnd();
            }
        };

        // 테이블 스크롤 이벤트 핸들러
        const handleTableScroll = () => {
            if (timetable && visibleDayCount < TOTAL_DAYS) {
                setIsScrolling(true);

                // 스크롤 종료 감지
                handleScrollEnd();
            }
        };

        // 전역 마우스 업 이벤트 (드래그 선택 종료)
        const handleGlobalMouseUp = (e) => {
            if (isDragSelecting) {
                handleDragSelectionEnd();
            }
        };

        // 이벤트 리스너 등록 (capture 단계에서 기본 동작 차단)
        container.addEventListener("gesturestart", handleGestureStart, true);
        container.addEventListener("gesturechange", handleGestureChange, true);
        container.addEventListener("gestureend", handleGestureEnd, true);
        container.addEventListener("wheel", handleWheel, {
            passive: false,
            capture: true,
        });
        container.addEventListener("touchstart", handleTouchStart, {
            passive: true,
        });
        container.addEventListener("touchmove", handleTouchMove, {
            passive: false,
        }); // 스크롤 제어를 위해 preventDefault 필요
        container.addEventListener("touchend", handleGlobalTouchEnd);
        timetable.addEventListener("scroll", handleTableScroll);

        // 전역 마우스 업 이벤트 등록
        document.addEventListener("mouseup", handleGlobalMouseUp);

        // 브라우저 기본 제스처 차단
        document.addEventListener("gesturestart", preventDefaults, true);
        document.addEventListener("gesturechange", preventDefaults, true);
        document.addEventListener("gestureend", preventDefaults, true);

        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }

            container.removeEventListener(
                "gesturestart",
                handleGestureStart,
                true
            );
            container.removeEventListener(
                "gesturechange",
                handleGestureChange,
                true
            );
            container.removeEventListener("gestureend", handleGestureEnd, true);
            container.removeEventListener("wheel", handleWheel, true);
            container.removeEventListener("touchstart", handleTouchStart);
            container.removeEventListener("touchmove", handleTouchMove);
            container.removeEventListener("touchend", handleGlobalTouchEnd);
            if (timetable) {
                timetable.removeEventListener("scroll", handleTableScroll);
            }

            // 전역 마우스 업 이벤트 제거
            document.removeEventListener("mouseup", handleGlobalMouseUp);

            document.removeEventListener("gesturestart", preventDefaults, true);
            document.removeEventListener(
                "gesturechange",
                preventDefaults,
                true
            );
            document.removeEventListener("gestureend", preventDefaults, true);
        };
    }, [
        visibleDayCount,
        isDragSelecting,
        isSelectionEnabled,
        touchStartPosition,
        pendingTouchSlot,
        hasMoved,
    ]);

    // 테이블 스타일 계산
    const getTableStyle = () => {
        return {
            width: `${100 * (TOTAL_DAYS / visibleDayCount)}%`,
            minWidth: "100%",
        };
    };

    return (
        <div className="flex w-full">
            <div className="flex-shrink-0 min-w-max">
                <TimeHeader
                    halfCount={halfCount}
                    startTime={startTime}
                    dateHeaderHeight={DATE_HEADER_HEIGHT}
                />
            </div>

            <div
                ref={containerRef}
                className="flex-1 min-w-0"
                style={{
                    position: "relative",
                    touchAction: isMobile ? "none" : "manipulation", // 모바일에서는 모든 터치 동작 차단
                }}
            >
                <div
                    ref={timetableRef}
                    className="overflow-x-auto overflow-y-hidden"
                    style={{
                        overflowX:
                            visibleDayCount < TOTAL_DAYS ? "auto" : "hidden",
                        touchAction: isMobile ? "none" : "manipulation", // 모바일에서는 모든 터치 동작 차단
                        scrollSnapType: "none", // 브라우저 기본 snap 비활성화
                        paddingLeft:
                            visibleDayCount < TOTAL_DAYS ? "1.3px" : "0", // 왼쪽 border 보정
                    }}
                >
                    <div style={getTableStyle()}>
                        <Timetable
                            dayCount={TOTAL_DAYS}
                            halfCount={halfCount}
                            hasDateHeaderAbove={false}
                            selectedSlots={selectedSlots}
                            onSlotSelection={handleSlotSelection}
                            onTapSelection={handleTapSelection}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            onMouseStart={handleMouseStart}
                            onMouseMove={handleMouseMove}
                            onMouseEnd={handleMouseEnd}
                            onDragSelectionStart={handleDragSelectionStart}
                            onDragSelectionMove={handleDragSelectionMove}
                            onDragSelectionEnd={handleDragSelectionEnd}
                            isSelectionEnabled={isSelectionEnabled}
                            isDragSelecting={isDragSelecting}
                            pendingTouchSlot={pendingTouchSlot}
                            verticalDragThreshold={VERTICAL_DRAG_THRESHOLD}
                            selectedDates={meeting?.dates}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
