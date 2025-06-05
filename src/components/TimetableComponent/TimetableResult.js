"use client"

import { useState, useRef, useEffect } from "react";
import TimeHeader from "./TimeHeader";
import Timetable from "./Timetable";

export default function TimetableResult() {
    // 페이지네이션 상태 관리
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    
    // 스와이프 감지를 위한 터치 상태
    const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
    const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
    const [isSwiping, setIsSwiping] = useState(false);
    
    // Refs for DOM elements
    const containerRef = useRef(null);
    const timetableRef = useRef(null);

    // Constants
    const TOTAL_DAYS = 9;
    const VISIBLE_DAY_COUNT = 7; // Fixed to 7 columns
    const DATE_HEADER_HEIGHT = 28;
    const SWIPE_THRESHOLD = 50; // 50px 이상 스와이프해야 페이지 변경

    // 페이지 계산 로직
    const getMaxPageIndex = () => {
        if (TOTAL_DAYS <= VISIBLE_DAY_COUNT) return 0;
        return Math.ceil((TOTAL_DAYS - VISIBLE_DAY_COUNT) / VISIBLE_DAY_COUNT);
    };

    const getCurrentStartDay = () => {
        return currentPageIndex * VISIBLE_DAY_COUNT;
    };

    const getCurrentVisibleDays = () => {
        const startDay = getCurrentStartDay();
        const endDay = Math.min(startDay + VISIBLE_DAY_COUNT, TOTAL_DAYS);
        return endDay - startDay;
    };

    // 페이지 이동 함수
    const goToPage = (pageIndex) => {
        const maxPage = getMaxPageIndex();
        const targetPage = Math.max(0, Math.min(pageIndex, maxPage));
        
        if (targetPage !== currentPageIndex && !isAnimating) {
            setIsAnimating(true);
            setCurrentPageIndex(targetPage);
            
            const timetable = timetableRef.current;
            if (timetable) {
                const startDay = targetPage * VISIBLE_DAY_COUNT;
                const columnWidth = timetable.scrollWidth / TOTAL_DAYS;
                const targetScrollLeft = startDay * columnWidth;
                
                timetable.scrollTo({
                    left: targetScrollLeft,
                    behavior: 'smooth'
                });
                
                // 애니메이션 완료 후 상태 초기화
                setTimeout(() => {
                    setIsAnimating(false);
                }, 300);
            }
        }
    };

    // 스와이프 방향 감지 및 페이지 변경
    const handleSwipeEnd = () => {
        if (!isSwiping) return;
        
        const deltaX = touchEnd.x - touchStart.x;
        const deltaY = Math.abs(touchEnd.y - touchStart.y);
        
        // 수평 스와이프가 수직 움직임보다 크고 임계값을 넘었을 때만 처리
        if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > deltaY) {
            if (deltaX > 0) {
                // 오른쪽 스와이프 - 이전 페이지
                goToPage(currentPageIndex - 1);
            } else {
                // 왼쪽 스와이프 - 다음 페이지  
                goToPage(currentPageIndex + 1);
            }
        }
        
        setIsSwiping(false);
    };

    // 스와이프 이벤트 처리
    useEffect(() => {
        const container = containerRef.current;
        
        if (!container) return;

        // 스와이프 감지를 위한 터치 이벤트 핸들러
        const handleTouchStart = (e) => {
            if (e.touches.length === 1 && !isAnimating) {
                const touch = e.touches[0];
                setTouchStart({ x: touch.clientX, y: touch.clientY });
                setTouchEnd({ x: touch.clientX, y: touch.clientY });
                setIsSwiping(true);
            }
        };

        const handleTouchMove = (e) => {
            if (e.touches.length === 1 && isSwiping && !isAnimating) {
                const touch = e.touches[0];
                setTouchEnd({ x: touch.clientX, y: touch.clientY });
                
                // 수평 스와이프 시 기본 스크롤 방지
                const deltaX = Math.abs(touch.clientX - touchStart.x);
                const deltaY = Math.abs(touch.clientY - touchStart.y);
                
                if (deltaX > deltaY && deltaX > 10) {
                    e.preventDefault();
                }
            }
        };

        const handleTouchEnd = (e) => {
            if (e.touches.length === 0 && isSwiping && !isAnimating) {
                handleSwipeEnd();
            }
        };

        // 마우스 이벤트도 지원 (데스크톱에서 테스트용)
        const handleMouseDown = (e) => {
            if (!isAnimating) {
                setTouchStart({ x: e.clientX, y: e.clientY });
                setTouchEnd({ x: e.clientX, y: e.clientY });
                setIsSwiping(true);
            }
        };

        const handleMouseMove = (e) => {
            if (isSwiping && !isAnimating) {
                setTouchEnd({ x: e.clientX, y: e.clientY });
            }
        };

        const handleMouseUp = () => {
            if (isSwiping && !isAnimating) {
                handleSwipeEnd();
            }
        };

        // 이벤트 리스너 등록
        container.addEventListener('touchstart', handleTouchStart, { passive: false });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd);
        
        // 마우스 이벤트 (데스크톱 지원)
        container.addEventListener('mousedown', handleMouseDown);
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseup', handleMouseUp);

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
            container.removeEventListener('mousedown', handleMouseDown);
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseup', handleMouseUp);
        };
    }, [touchStart, touchEnd, isSwiping, isAnimating, currentPageIndex]); // 필요한 의존성만 포함

    // 테이블 스타일 계산 - 페이지네이션 방식
    const getTableStyle = () => {
        const currentVisibleDays = getCurrentVisibleDays();
        return {
            width: `${100 * (currentVisibleDays / VISIBLE_DAY_COUNT)}%`,
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
                    className="overflow-hidden"
                    data-scroll-container="true"
                    style={{ 
                        touchAction: 'pan-y',  // 세로 스크롤만 허용, 가로는 스와이프로 처리
                        userSelect: 'none',  // 텍스트 선택 방지
                        WebkitUserSelect: 'none',
                        minHeight: '100px'
                    }}
                >
                    <div style={getTableStyle()}>
                        <Timetable 
                            dayCount={getCurrentVisibleDays()}  // 현재 페이지의 visible days만 표시
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
                            pageStartDay={getCurrentStartDay()}  // 페이지 시작 날짜 전달 (만약 Timetable이 지원한다면)
                        />
                    </div>
                </div>
            </div>
        </div>
    );
} 