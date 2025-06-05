"use client"

import { useState, useRef, useEffect } from "react";
import TimeHeader from "./TimeHeader";
import Timetable from "./Timetable";

export default function TimetableResult() {
    // States for scroll control only (TimetableSelect와 동일하게)
    const [isScrolling, setIsScrolling] = useState(false);
    const [startTouchX, setStartTouchX] = useState(0);
    const [startTouch1, setStartTouch1] = useState({ x: 0, y: 0 });
    
    // Refs for DOM elements
    const containerRef = useRef(null);
    const timetableRef = useRef(null);
    const scrollTimeoutRef = useRef(null);

    // Constants
    const TOTAL_DAYS = 9;
    const VISIBLE_DAY_COUNT = 7; // Fixed to 7 columns
    const DATE_HEADER_HEIGHT = 28;

    // Auto-Align 함수 - 가장 가까운 컬럼으로 스냅
    const autoAlignToColumn = () => {
        const timetable = timetableRef.current;
        if (!timetable || VISIBLE_DAY_COUNT >= TOTAL_DAYS) return;

        const columnWidth = timetable.scrollWidth / TOTAL_DAYS;
        const viewportStartX = timetable.scrollLeft;
        const viewportCenterX = viewportStartX + (timetable.clientWidth / 2);

        // 뷰포트 중심에 가장 가까운 컬럼 찾기
        const centerColumnFloat = viewportCenterX / columnWidth;
        const nearestColumn = Math.round(centerColumnFloat);

        // 스크롤 가능한 범위 내에서 조정
        const maxScrollColumns = TOTAL_DAYS - VISIBLE_DAY_COUNT;
        let targetColumn = Math.max(0, Math.min(nearestColumn, maxScrollColumns));

        // 현재 스크롤 위치가 컬럼 경계에 얼마나 가까운지 확인
        const currentColumnFloat = viewportStartX / columnWidth;
        const currentColumnIndex = Math.floor(currentColumnFloat);
        const columnProgress = currentColumnFloat - currentColumnIndex;

        // 이미 충분히 정렬되어 있다면 스킵 (5% 이내의 오차)
        if (columnProgress < 0.05 || columnProgress > 0.95) {
            return;
        }

        // 타겟 컬럼의 시작 위치로 부드럽게 스크롤
        const targetScrollLeft = targetColumn * columnWidth;

        // 현재 위치와 충분히 다를 때만 스크롤 (2px 이상 차이)
        if (Math.abs(timetable.scrollLeft - targetScrollLeft) > 2) {
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
            // Auto-align 실행
            autoAlignToColumn();
        }, 100); // 100ms 후 스크롤이 끝난 것으로 간주
    };

    // Effect for event handlers
    useEffect(() => {
        const container = containerRef.current;
        const timetable = timetableRef.current;
        
        if (!container || !timetable) return;

        // 테이블 스크롤 이벤트 핸들러 (Auto-Align 포함)
        const handleTableScroll = () => {
            if (timetable && VISIBLE_DAY_COUNT < TOTAL_DAYS) {
                setIsScrolling(true);
                
                // 스크롤 종료 감지 및 Auto-Align
                handleScrollEnd();
            }
        };

        // 기본 동작 차단
        const preventDefaults = (e) => {
            e.preventDefault();
        };

        // TimetableSelect와 동일한 터치 이벤트 처리
        const handleTouchStart = (e) => {
            if (e.touches.length === 1) {
                // 단일 터치 - 스크롤 준비
                const touch = e.touches[0];
                setStartTouchX(touch.clientX);
                setStartTouch1({ x: touch.clientX, y: touch.clientY });
                setIsScrolling(false);
            }
        };

        const handleTouchMove = (e) => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                
                // 수평 스크롤 처리 (TimetableSelect와 동일한 로직)
                if (VISIBLE_DAY_COUNT < TOTAL_DAYS) {
                    // 움직임의 방향을 확인하여 수평 스크롤인지 판단
                    const deltaX = Math.abs(touch.clientX - startTouch1.x);
                    const deltaY = Math.abs(touch.clientY - startTouch1.y);
                    
                    // 수평 움직임이 세로 움직임보다 크고 최소 임계값을 넘었을 때만 스크롤 처리
                    if (deltaX > 10 && deltaX > deltaY) { // TimetableSelect와 동일한 임계값
                        e.preventDefault();
                        setIsScrolling(true);
                        
                        const currentX = touch.clientX;
                        const scrollDeltaX = startTouchX - currentX;
                        
                        if (timetable.scrollLeft !== undefined) {
                            timetable.scrollLeft += scrollDeltaX;
                            setStartTouchX(currentX);
                        }
                    }
                }
            }
        };

        const handleTouchEnd = (e) => {
            // 터치 종료 시 Auto-Align 실행 (TimetableSelect와 동일)
            if (e.touches.length === 0) {
                handleScrollEnd();
            }
        };

        // 이벤트 리스너 등록 (TimetableSelect와 동일하게 container에 등록)
        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchmove', handleTouchMove, { passive: false }); // 스크롤 제어를 위해 preventDefault 필요
        container.addEventListener('touchend', handleTouchEnd);
        timetable.addEventListener('scroll', handleTableScroll);

        // 모바일 스크롤을 위해 기본 제스처 차단 제거
        // 필요한 경우에만 제한적으로 적용

        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
            
            // 터치 이벤트 리스너 제거 (TimetableSelect와 동일하게)
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
            if (timetable) {
                timetable.removeEventListener('scroll', handleTableScroll);
            }
        };
    }, [startTouchX, startTouch1]); // TimetableSelect와 유사한 의존성

    // 테이블 스타일 계산
    const getTableStyle = () => {
        return {
            width: `${100 * (TOTAL_DAYS / VISIBLE_DAY_COUNT)}%`,
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
                    touchAction: 'manipulation'  // TimetableSelect와 동일한 설정
                }}
            >
                <div 
                    ref={timetableRef}
                    className="overflow-x-auto overflow-y-hidden"
                    data-scroll-container="true"
                    style={{ 
                        overflowX: VISIBLE_DAY_COUNT < TOTAL_DAYS ? 'auto' : 'hidden',
                        touchAction: 'manipulation',  // TimetableSelect와 동일한 설정
                        WebkitOverflowScrolling: 'touch',  // iOS Safari에서 momentum scrolling 활성화
                        scrollSnapType: 'none',  // 브라우저 기본 snap 비활성화
                        paddingLeft: VISIBLE_DAY_COUNT < TOTAL_DAYS ? '1.3px' : '0',  // 왼쪽 border 보정
                        // 모바일에서 스크롤 영역 확실히 인식하도록 최소 높이 설정
                        minHeight: '100px',
                        // 스크롤 가능한 영역임을 명시
                        overscrollBehaviorX: 'contain'  // 가로 스크롤이 부모로 전파되지 않도록
                    }}
                >
                    <div style={getTableStyle()}>
                        <Timetable 
                            dayCount={TOTAL_DAYS}
                            halfCount={16}
                            startDate="05/19"
                            hasDateHeaderAbove={false}
                            selectedSlots={new Set()}  // 빈 Set으로 선택 없음 표시
                            onSlotSelection={() => {}}  // 터치 선택 비활성화
                            onTapSelection={() => {}}   // 터치 선택 비활성화
                            onTouchPending={() => {}}   // 터치 선택 비활성화
                            onDragSelectionStart={() => {}}  // 드래그 선택 비활성화
                            onDragSelectionMove={() => {}}   // 드래그 선택 비활성화
                            onDragSelectionEnd={() => {}}    // 드래그 선택 비활성화
                            isSelectionEnabled={false}       // 선택 기능 완전 비활성화
                            isDragSelecting={false}
                            pendingTouchSlot={null}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
} 