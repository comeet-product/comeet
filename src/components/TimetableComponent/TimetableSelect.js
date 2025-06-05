"use client"

import { useState, useRef, useEffect } from "react";
import TimeHeader from "./TimeHeader";
import Timetable from "./Timetable";

export default function TimetableSelect() {
    // States for gesture and view control
    const [visibleDayCount, setVisibleDayCount] = useState(7);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startTouchX, setStartTouchX] = useState(0);
    const [startTouch1, setStartTouch1] = useState({ x: 0, y: 0 });
    const [startTouch2, setStartTouch2] = useState({ x: 0, y: 0 });
    const [initialDistance, setInitialDistance] = useState(0);
    const [touchCount, setTouchCount] = useState(0);
    const [gestureScale, setGestureScale] = useState(1);
    const [centerColumnIndex, setCenterColumnIndex] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);
    
    // 시간 슬롯 선택 상태 관리 (dayIndex-halfIndex 형태로 저장)
    const [selectedSlots, setSelectedSlots] = useState(new Set());
    const [isSelectionEnabled, setIsSelectionEnabled] = useState(true);
    
    // 드래그 선택 상태 관리
    const [isDragSelecting, setIsDragSelecting] = useState(false);
    const [dragStartSlot, setDragStartSlot] = useState(null);
    const [dragCurrentSlot, setDragCurrentSlot] = useState(null);
    const [dragMode, setDragMode] = useState('select'); // 'select' or 'deselect'
    
    // 터치 시간 추적 (탭과 드래그 구분)
    const [touchStartTime, setTouchStartTime] = useState(0);
    const [touchMoved, setTouchMoved] = useState(false);
    const [touchStartPosition, setTouchStartPosition] = useState({ x: 0, y: 0 });
    const [pendingTouchSlot, setPendingTouchSlot] = useState(null); // 대기 중인 터치 슬롯
    const [touchTimeout, setTouchTimeout] = useState(null); // 터치 타이머
    const TAP_THRESHOLD = 150; // 150ms 후 탭으로 확정
    const MOVE_THRESHOLD = 8; // 8px 이상 움직이면 드래그로 간주
    
    // Refs for DOM elements
    const containerRef = useRef(null);
    const timetableRef = useRef(null);
    const scrollTimeoutRef = useRef(null);

    // Constants
    const TOTAL_DAYS = 8;
    const MIN_VISIBLE_DAYS = 1;
    const MAX_VISIBLE_DAYS = 7;
    const DATE_HEADER_HEIGHT = 23;

    // 터치 지점에서 컬럼 인덱스 계산
    const getColumnIndexFromTouch = (clientX) => {
        const timetable = timetableRef.current;
        if (!timetable) return 0;

        const timetableRect = timetable.getBoundingClientRect();
        const relativeX = clientX - timetableRect.left + timetable.scrollLeft;
        const columnWidth = (timetable.scrollWidth / TOTAL_DAYS);
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

    // Auto-Align 함수 - 더 명확한 스냅 동작
    const autoAlignToColumn = () => {
        const timetable = timetableRef.current;
        if (!timetable || visibleDayCount >= TOTAL_DAYS) return;

        const columnWidth = timetable.scrollWidth / TOTAL_DAYS;
        const viewportStartX = timetable.scrollLeft;
        const viewportEndX = viewportStartX + timetable.clientWidth;

        // 현재 화면에 보이는 첫 번째와 마지막 컬럼 인덱스
        const firstVisibleColumn = Math.floor(viewportStartX / columnWidth);
        const lastVisibleColumn = Math.floor((viewportEndX - 1) / columnWidth);

        // 현재 스크롤 위치가 컬럼 경계에 얼마나 가까운지 계산
        const currentColumnFloat = viewportStartX / columnWidth;
        const currentColumnIndex = Math.floor(currentColumnFloat);
        const columnProgress = currentColumnFloat - currentColumnIndex;

        let targetColumn;

        // 30% 미만이면 현재 컬럼으로, 70% 이상이면 다음 컬럼으로 snap
        if (columnProgress < 0.3) {
            targetColumn = currentColumnIndex;
        } else if (columnProgress > 0.7) {
            targetColumn = Math.min(currentColumnIndex + 1, TOTAL_DAYS - visibleDayCount);
        } else {
            // 30% ~ 70% 사이에서는 가장 가까운 쪽으로 snap
            targetColumn = columnProgress < 0.5 ? currentColumnIndex : Math.min(currentColumnIndex + 1, TOTAL_DAYS - visibleDayCount);
        }

        // 경계값 체크
        targetColumn = Math.max(0, Math.min(targetColumn, TOTAL_DAYS - visibleDayCount));

        // 타겟 컬럼의 시작 위치로 부드럽게 스크롤
        const targetScrollLeft = targetColumn * columnWidth;

        // 현재 위치와 다를 때만 스크롤
        if (Math.abs(timetable.scrollLeft - targetScrollLeft) > 5) {
            timetable.scrollTo({
                left: targetScrollLeft,
                behavior: 'smooth'
            });
        }
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
            // Auto-align을 더 빠르게 실행
            autoAlignToColumn();
        }, 100); // 100ms 후 스크롤이 끝난 것으로 간주 (더 빠르게)
    };

    // 중심 컬럼을 기준으로 스크롤 위치 조정
    const adjustScrollForCenterColumn = (newVisibleCount, centerCol) => {
        const timetable = timetableRef.current;
        if (!timetable || newVisibleCount >= TOTAL_DAYS) {
            return;
        }

        // 중심 컬럼이 화면 중앙에 오도록 스크롤 위치 계산
        const targetCenterPosition = centerCol - Math.floor(newVisibleCount / 2);
        const maxScrollColumns = TOTAL_DAYS - newVisibleCount;
        const safeScrollPosition = Math.max(0, Math.min(targetCenterPosition, maxScrollColumns));
        
        // 실제 픽셀 단위로 스크롤 위치 설정
        const columnWidth = timetable.scrollWidth / TOTAL_DAYS;
        const targetScrollLeft = safeScrollPosition * columnWidth;
        
        timetable.scrollLeft = targetScrollLeft;
        
        // 스크롤 위치 상태 업데이트
        const maxScroll = timetable.scrollWidth - timetable.clientWidth;
        if (maxScroll > 0) {
            const scrollPercentage = (timetable.scrollLeft / maxScroll) * 100;
            setScrollPosition(scrollPercentage);
        }
    };

    // 핀치와 스와이프를 구분하는 함수
    const isSameDirectionMove = (touch1Start, touch1Current, touch2Start, touch2Current) => {
        const touch1DeltaX = touch1Current.clientX - touch1Start.x;
        const touch2DeltaX = touch2Current.clientX - touch2Start.x;
        
        const isSameDirectionX = (touch1DeltaX > 10 && touch2DeltaX > 10) || 
                               (touch1DeltaX < -10 && touch2DeltaX < -10);
        
        const currentDistance = Math.hypot(
            touch1Current.clientX - touch2Current.clientX,
            touch1Current.clientY - touch2Current.clientY
        );
        
        const distanceDifference = Math.abs(currentDistance - initialDistance);
        
        return isSameDirectionX && distanceDifference < 30;
    };

    // 시간 슬롯 선택/해제 함수
    const handleSlotSelection = (dayIndex, halfIndex) => {
        // 스크롤 중이거나 선택이 비활성화된 경우 무시
        if (isScrolling || !isSelectionEnabled) {
            return;
        }

        const slotId = `${dayIndex}-${halfIndex}`;
        setSelectedSlots(prev => {
            const newSet = new Set(prev);
            if (newSet.has(slotId)) {
                newSet.delete(slotId); // 이미 선택된 경우 해제
            } else {
                newSet.add(slotId); // 선택되지 않은 경우 선택
            }
            return newSet;
        });
    };

    // 터치 대기 시작 (즉시 선택하지 않고 잠시 대기)
    const handleTouchPending = (dayIndex, halfIndex) => {
        if (isScrolling || !isSelectionEnabled) {
            return;
        }

        // 기존 타이머가 있다면 클리어
        if (touchTimeout) {
            clearTimeout(touchTimeout);
        }

        // 대기 중인 슬롯 설정
        setPendingTouchSlot({ dayIndex, halfIndex });

        // 일정 시간 후 개별 선택으로 확정
        const timer = setTimeout(() => {
            if (!touchMoved && !isDragSelecting) {
                handleTapSelection(dayIndex, halfIndex);
            }
            setPendingTouchSlot(null);
        }, TAP_THRESHOLD);

        setTouchTimeout(timer);
    };

    // 드래그 선택 시작 (움직임이 감지되었을 때)
    const handleDragSelectionStart = (dayIndex, halfIndex) => {
        if (isScrolling || !isSelectionEnabled) {
            return;
        }

        // 대기 중인 터치 취소
        if (touchTimeout) {
            clearTimeout(touchTimeout);
            setTouchTimeout(null);
        }
        setPendingTouchSlot(null);

        const slotId = `${dayIndex}-${halfIndex}`;
        const isCurrentlySelected = selectedSlots.has(slotId);
        
        // 현재 슬롯의 선택 상태에 따라 드래그 모드 결정
        const mode = isCurrentlySelected ? 'deselect' : 'select';
        
        setIsDragSelecting(true);
        setDragStartSlot({ dayIndex, halfIndex });
        setDragCurrentSlot({ dayIndex, halfIndex });
        setDragMode(mode);
        
        // 시작 슬롯 선택/해제
        if (mode === 'select') {
            setSelectedSlots(prev => new Set([...prev, slotId]));
        } else {
            setSelectedSlots(prev => {
                const newSet = new Set(prev);
                newSet.delete(slotId);
                return newSet;
            });
        }
    };

    // 드래그 선택 중
    const handleDragSelectionMove = (dayIndex, halfIndex) => {
        if (!isDragSelecting || isScrolling || !isSelectionEnabled || !dragStartSlot) {
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

        const newCurrentSlot = { dayIndex, halfIndex };
        
        // 현재 슬롯이 변경된 경우에만 처리
        if (!dragCurrentSlot || 
            dragCurrentSlot.dayIndex !== newCurrentSlot.dayIndex || 
            dragCurrentSlot.halfIndex !== newCurrentSlot.halfIndex) {
            
            setDragCurrentSlot(newCurrentSlot);
            
            // 드래그 범위의 모든 슬롯 선택
            selectSlotsInRange(dragStartSlot, newCurrentSlot);
        }
    };

    // 드래그 선택 종료
    const handleDragSelectionEnd = () => {
        // 대기 중인 터치 타이머도 정리
        if (touchTimeout) {
            clearTimeout(touchTimeout);
            setTouchTimeout(null);
        }
        setPendingTouchSlot(null);
        
        setIsDragSelecting(false);
        setDragStartSlot(null);
        setDragCurrentSlot(null);
        setDragMode('select');
    };

    // 개별 터치/클릭 선택 (드래그가 아닌 단순 탭)
    const handleTapSelection = (dayIndex, halfIndex) => {
        if (isScrolling || !isSelectionEnabled) {
            return;
        }

        const slotId = `${dayIndex}-${halfIndex}`;
        setSelectedSlots(prev => {
            const newSet = new Set(prev);
            if (newSet.has(slotId)) {
                newSet.delete(slotId); // 이미 선택된 경우 해제
            } else {
                newSet.add(slotId); // 선택되지 않은 경우 선택
            }
            return newSet;
        });
    };

    // 범위 내 슬롯들 선택/해제 (아래쪽 방향으로만)
    const selectSlotsInRange = (startSlot, endSlot) => {
        if (!startSlot || !endSlot) return;

        // 같은 day가 아니면 처리하지 않음
        if (startSlot.dayIndex !== endSlot.dayIndex) {
            return;
        }

        // 아래쪽 방향으로만 선택 (endSlot이 startSlot보다 아래에 있어야 함)
        if (endSlot.halfIndex < startSlot.halfIndex) {
            return;
        }

        const dayIndex = startSlot.dayIndex;
        const startHalfIndex = startSlot.halfIndex;
        const endHalfIndex = endSlot.halfIndex;

        setSelectedSlots(prev => {
            const newSelectedSlots = new Set(prev);

            // 시작점부터 끝점까지 세로로 선택
            for (let halfIndex = startHalfIndex; halfIndex <= endHalfIndex; halfIndex++) {
                const slotId = `${dayIndex}-${halfIndex}`;
                
                if (dragMode === 'select') {
                    newSelectedSlots.add(slotId);
                } else {
                    newSelectedSlots.delete(slotId);
                }
            }

            return newSelectedSlots;
        });
    };

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
                const newVisibleCount = Math.max(visibleDayCount - 1, MIN_VISIBLE_DAYS);
                if (newVisibleCount !== visibleDayCount) {
                    setVisibleDayCount(newVisibleCount);
                    adjustScrollForCenterColumn(newVisibleCount, centerColumnIndex);
                    setGestureScale(e.scale);
                }
            } else if (scaleChange < 0.85) {
                // 축소 (컬럼 증가)
                const newVisibleCount = Math.min(visibleDayCount + 1, MAX_VISIBLE_DAYS);
                if (newVisibleCount !== visibleDayCount) {
                    setVisibleDayCount(newVisibleCount);
                    adjustScrollForCenterColumn(newVisibleCount, centerColumnIndex);
                    setGestureScale(e.scale);
                }
            }
        };

        const handleGestureEnd = (e) => {
            e.preventDefault();
            setGestureScale(1);
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
                    const newVisibleCount = Math.min(visibleDayCount + 1, MAX_VISIBLE_DAYS);
                    if (newVisibleCount !== visibleDayCount) {
                        setVisibleDayCount(newVisibleCount);
                        adjustScrollForCenterColumn(newVisibleCount, columnIndex);
                    }
                } else {
                    // 확대 (컬럼 감소)
                    const newVisibleCount = Math.max(visibleDayCount - 1, MIN_VISIBLE_DAYS);
                    if (newVisibleCount !== visibleDayCount) {
                        setVisibleDayCount(newVisibleCount);
                        adjustScrollForCenterColumn(newVisibleCount, columnIndex);
                    }
                }
            }
        };

        const handleTouchStart = (e) => {
            setTouchCount(e.touches.length);
            
            if (e.touches.length === 1) {
                // 단일 터치 - 스크롤 및 선택 준비
                const touch = e.touches[0];
                setStartTouchX(touch.clientX);
                setTouchStartPosition({ x: touch.clientX, y: touch.clientY });
                setTouchMoved(false);
                setTouchStartTime(Date.now());
                setIsDragging(false);
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
                
                setIsDragging(false);
                setIsScrolling(false); // 터치 시작 시점에서는 스크롤 상태가 아님
                setIsSelectionEnabled(false); // 두 손가락 터치 시에만 선택 기능 비활성화
            }
        };

        const handleTouchMove = (e) => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                const deltaX = Math.abs(touch.clientX - touchStartPosition.x);
                const deltaY = Math.abs(touch.clientY - touchStartPosition.y);
                
                // 움직임이 감지되면 touchMoved 설정
                if (deltaX > MOVE_THRESHOLD || deltaY > MOVE_THRESHOLD) {
                    setTouchMoved(true);
                }
                
                // 수평 움직임이 더 크면 스크롤로 간주
                if (deltaX > deltaY && deltaX > MOVE_THRESHOLD && visibleDayCount < TOTAL_DAYS) {
                    e.preventDefault();
                    setIsScrolling(true);
                    setIsSelectionEnabled(false);
                    
                    const currentX = touch.clientX;
                    const scrollDeltaX = startTouchX - currentX;
                    
                    if (timetable.scrollLeft !== undefined) {
                        timetable.scrollLeft += scrollDeltaX;
                        setStartTouchX(currentX);
                        
                        // 스크롤 위치 업데이트
                        const maxScroll = timetable.scrollWidth - timetable.clientWidth;
                        if (maxScroll > 0) {
                            const scrollPercentage = (timetable.scrollLeft / maxScroll) * 100;
                            setScrollPosition(scrollPercentage);
                        }
                    }
                }
                // 수직 움직임이 더 크거나 움직임이 작으면 드래그 선택 가능성
                else if (deltaY >= deltaX || deltaX <= MOVE_THRESHOLD) {
                    // 여기서는 preventDefault를 하지 않아 터치 이벤트가 Timetable 컴포넌트로 전달됨
                }
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
                const isDragGesture = isSameDirectionMove(startTouch1, touch1, startTouch2, touch2);
                
                if (isDragGesture && visibleDayCount < TOTAL_DAYS) {
                    // 드래그 모드: 두 손가락이 같은 방향으로 이동
                    const currentCenterX = (touch1.clientX + touch2.clientX) / 2;
                    const deltaX = startTouchX - currentCenterX;
                    
                    if (timetable.scrollLeft !== undefined) {
                        timetable.scrollLeft += deltaX;
                        setStartTouchX(currentCenterX);
                        
                        // 스크롤 위치 업데이트
                        const maxScroll = timetable.scrollWidth - timetable.clientWidth;
                        if (maxScroll > 0) {
                            const scrollPercentage = (timetable.scrollLeft / maxScroll) * 100;
                            setScrollPosition(scrollPercentage);
                        }
                    }
                } else {
                    // 확대/축소 모드: 두 손가락이 반대 방향으로 움직이거나 거리가 변함
                    const ratio = currentDistance / initialDistance;
                    
                    if (ratio > 1.3) { // 손가락을 벌리는 동작 (핀치 아웃) - 확대 효과이므로 컬럼 감소
                        const newVisibleCount = Math.max(visibleDayCount - 1, MIN_VISIBLE_DAYS);
                        if (newVisibleCount !== visibleDayCount) {
                            setVisibleDayCount(newVisibleCount);
                            adjustScrollForCenterColumn(newVisibleCount, centerColumnIndex);
                            setInitialDistance(currentDistance);
                            setStartTouch1({ x: touch1.clientX, y: touch1.clientY });
                            setStartTouch2({ x: touch2.clientX, y: touch2.clientY });
                        }
                    } else if (ratio < 0.7) { // 손가락을 모으는 동작 (핀치 인) - 축소 효과이므로 컬럼 증가
                        const newVisibleCount = Math.min(visibleDayCount + 1, MAX_VISIBLE_DAYS);
                        if (newVisibleCount !== visibleDayCount) {
                            setVisibleDayCount(newVisibleCount);
                            adjustScrollForCenterColumn(newVisibleCount, centerColumnIndex);
                            setInitialDistance(currentDistance);
                            setStartTouch1({ x: touch1.clientX, y: touch1.clientY });
                            setStartTouch2({ x: touch2.clientX, y: touch2.clientY });
                        }
                    }
                }
            }
        };

        const handleTouchEnd = (e) => {
            setIsDragging(false);
            setTouchCount(e.touches.length);
            
            // 드래그 선택 종료
            if (isDragSelecting) {
                handleDragSelectionEnd();
            }
            
            // 대기 중인 터치 타이머 정리
            if (touchTimeout) {
                clearTimeout(touchTimeout);
                setTouchTimeout(null);
            }
            
            // 터치 종료 시 Auto-Align 실행
            if (e.touches.length === 0) {
                // 짧은 지연 후 상태 초기화
                setTimeout(() => {
                    setIsSelectionEnabled(true);
                    setTouchMoved(false);
                    setPendingTouchSlot(null);
                }, 50);
                
                handleScrollEnd();
            }
        };

        // 테이블 스크롤 이벤트 핸들러
        const handleTableScroll = () => {
            if (timetable && visibleDayCount < TOTAL_DAYS) {
                setIsScrolling(true);
                
                const maxScroll = timetable.scrollWidth - timetable.clientWidth;
                if (maxScroll > 0) {
                    const scrollPercentage = (timetable.scrollLeft / maxScroll) * 100;
                    setScrollPosition(scrollPercentage);
                }
                
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
        container.addEventListener('gesturestart', handleGestureStart, true);
        container.addEventListener('gesturechange', handleGestureChange, true);
        container.addEventListener('gestureend', handleGestureEnd, true);
        container.addEventListener('wheel', handleWheel, { passive: false, capture: true });
        container.addEventListener('touchstart', handleTouchStart, { passive: false });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd);
        timetable.addEventListener('scroll', handleTableScroll);

        // 전역 마우스 업 이벤트 등록
        document.addEventListener('mouseup', handleGlobalMouseUp);

        // 브라우저 기본 제스처 차단
        document.addEventListener('gesturestart', preventDefaults, true);
        document.addEventListener('gesturechange', preventDefaults, true);
        document.addEventListener('gestureend', preventDefaults, true);

        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
            
            // 터치 타이머 정리
            if (touchTimeout) {
                clearTimeout(touchTimeout);
            }
            
            container.removeEventListener('gesturestart', handleGestureStart, true);
            container.removeEventListener('gesturechange', handleGestureChange, true);
            container.removeEventListener('gestureend', handleGestureEnd, true);
            container.removeEventListener('wheel', handleWheel, true);
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
            if (timetable) {
                timetable.removeEventListener('scroll', handleTableScroll);
            }
            
            // 전역 마우스 업 이벤트 제거
            document.removeEventListener('mouseup', handleGlobalMouseUp);
            
            document.removeEventListener('gesturestart', preventDefaults, true);
            document.removeEventListener('gesturechange', preventDefaults, true);
            document.removeEventListener('gestureend', preventDefaults, true);
        };
    }, [visibleDayCount, isDragging, startTouchX, touchCount, initialDistance, startTouch1, startTouch2, gestureScale, centerColumnIndex]);

    // 테이블 스타일 계산
    const getTableStyle = () => {
        return {
            width: `${100 * (TOTAL_DAYS / visibleDayCount)}%`,
            minWidth: '100%'
        };
    };

    return (
        <div className="flex w-full">
            <div className="flex-shrink-0 min-w-max">
                <TimeHeader 
                    halfCount={16}
                    startTime={10}
                    dateHeaderHeight={DATE_HEADER_HEIGHT}
                />
            </div>

            <div 
                ref={containerRef}
                className="flex-1 min-w-0"
                style={{ 
                    position: 'relative',
                    touchAction: 'none'  // 모든 기본 터치 동작 차단
                }}
            >
                <div 
                    ref={timetableRef}
                    className="overflow-x-auto overflow-y-hidden"
                    style={{ 
                        overflowX: visibleDayCount < TOTAL_DAYS ? 'auto' : 'hidden',
                        touchAction: 'pan-x',  // 수평 스크롤만 허용
                        scrollSnapType: 'none',  // 브라우저 기본 snap 비활성화
                        paddingLeft: visibleDayCount < TOTAL_DAYS ? '1.3px' : '0'  // 왼쪽 border 보정
                    }}
                >
                    <div style={getTableStyle()}>
                        <Timetable 
                            dayCount={TOTAL_DAYS}
                            halfCount={16}
                            startDate="05/19"
                            hasDateHeaderAbove={false}
                            selectedSlots={selectedSlots}
                            onSlotSelection={handleSlotSelection}
                            onTapSelection={handleTapSelection}
                            onTouchPending={handleTouchPending}
                            onDragSelectionStart={handleDragSelectionStart}
                            onDragSelectionMove={handleDragSelectionMove}
                            onDragSelectionEnd={handleDragSelectionEnd}
                            isSelectionEnabled={isSelectionEnabled}
                            isDragSelecting={isDragSelecting}
                            pendingTouchSlot={pendingTouchSlot}
                            touchStartTime={touchStartTime}
                            setTouchStartTime={setTouchStartTime}
                            tapThreshold={TAP_THRESHOLD}
                            touchMoved={touchMoved}
                            moveThreshold={MOVE_THRESHOLD}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}