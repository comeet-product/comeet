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
    
    // Refs for DOM elements
    const containerRef = useRef(null);
    const timetableRef = useRef(null);

    // Constants
    const TOTAL_DAYS = 7;
    const MIN_VISIBLE_DAYS = 1;
    const MAX_VISIBLE_DAYS = 7;
    const DATE_HEADER_HEIGHT = 23;

    // 핀치와 스와이프를 구분하는 함수 (reference.js에서 참고)
    const isSameDirectionMove = (touch1Start, touch1Current, touch2Start, touch2Current) => {
        // X 방향 이동 계산
        const touch1DeltaX = touch1Current.clientX - touch1Start.x;
        const touch2DeltaX = touch2Current.clientX - touch2Start.x;
        
        // 두 손가락이 같은 방향으로 10px 이상 이동했는지 확인 (드래그 동작)
        const isSameDirectionX = (touch1DeltaX > 10 && touch2DeltaX > 10) || 
                               (touch1DeltaX < -10 && touch2DeltaX < -10);
        
        // 손가락 사이의 현재 거리 계산
        const currentDistance = Math.hypot(
            touch1Current.clientX - touch2Current.clientX,
            touch1Current.clientY - touch2Current.clientY
        );
        
        // 초기 거리와 현재 거리의 차이가 작으면 드래그로 간주
        const distanceDifference = Math.abs(currentDistance - initialDistance);
        
        // 거리 변화가 적고 같은 방향으로 이동한 경우 드래그로 판단
        return isSameDirectionX && distanceDifference < 30;
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
        };

        const handleGestureChange = (e) => {
            e.preventDefault();
            
            const scaleChange = e.scale / gestureScale;
            
            // 스케일 변화가 충분히 클 때만 zoom 변경
            if (scaleChange > 1.15) {
                // 확대 (컬럼 감소)
                setVisibleDayCount(prev => Math.max(prev - 1, MIN_VISIBLE_DAYS));
                setGestureScale(e.scale);
            } else if (scaleChange < 0.85) {
                // 축소 (컬럼 증가)
                setVisibleDayCount(prev => Math.min(prev + 1, MAX_VISIBLE_DAYS));
                setGestureScale(e.scale);
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
                
                // Ctrl/Cmd + 휠로 zoom 제어
                const direction = e.deltaY > 0 ? 1 : -1;
                if (direction > 0) {
                    // 축소 (컬럼 증가)
                    setVisibleDayCount(prev => Math.min(prev + 1, MAX_VISIBLE_DAYS));
                } else {
                    // 확대 (컬럼 감소)
                    setVisibleDayCount(prev => Math.max(prev - 1, MIN_VISIBLE_DAYS));
                }
            }
        };

        const handleTouchStart = (e) => {
            setTouchCount(e.touches.length);
            
            if (e.touches.length === 1) {
                // 단일 터치 - 스크롤 준비
                setStartTouchX(e.touches[0].clientX);
                setIsDragging(false);
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
                
                // 중앙 위치 계산 (드래그용)
                const centerX = (touch1.clientX + touch2.clientX) / 2;
                setStartTouchX(centerX);
                
                setIsDragging(false);
            }
        };

        const handleTouchMove = (e) => {
            if (e.touches.length === 1 && visibleDayCount < TOTAL_DAYS) {
                // 단일 터치 스크롤
                e.preventDefault();
                const currentX = e.touches[0].clientX;
                const deltaX = startTouchX - currentX;
                
                if (timetable.scrollLeft !== undefined) {
                    timetable.scrollLeft += deltaX;
                    setStartTouchX(currentX);
                    
                    // 스크롤 위치 업데이트
                    const maxScroll = timetable.scrollWidth - timetable.clientWidth;
                    if (maxScroll > 0) {
                        const scrollPercentage = (timetable.scrollLeft / maxScroll) * 100;
                        setScrollPosition(scrollPercentage);
                    }
                }
            } else if (e.touches.length === 2) {
                e.preventDefault();
                
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
                        setVisibleDayCount(prev => Math.max(prev - 1, MIN_VISIBLE_DAYS));
                        setInitialDistance(currentDistance);
                        setStartTouch1({ x: touch1.clientX, y: touch1.clientY });
                        setStartTouch2({ x: touch2.clientX, y: touch2.clientY });
                    } else if (ratio < 0.7) { // 손가락을 모으는 동작 (핀치 인) - 축소 효과이므로 컬럼 증가
                        setVisibleDayCount(prev => Math.min(prev + 1, MAX_VISIBLE_DAYS));
                        setInitialDistance(currentDistance);
                        setStartTouch1({ x: touch1.clientX, y: touch1.clientY });
                        setStartTouch2({ x: touch2.clientX, y: touch2.clientY });
                    }
                }
            }
        };

        const handleTouchEnd = (e) => {
            setIsDragging(false);
            setTouchCount(e.touches.length);
        };

        // 테이블 스크롤 이벤트 핸들러
        const handleTableScroll = () => {
            if (timetable && visibleDayCount < TOTAL_DAYS) {
                const maxScroll = timetable.scrollWidth - timetable.clientWidth;
                if (maxScroll > 0) {
                    const scrollPercentage = (timetable.scrollLeft / maxScroll) * 100;
                    setScrollPosition(scrollPercentage);
                }
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

        // 브라우저 기본 제스처 차단
        document.addEventListener('gesturestart', preventDefaults, true);
        document.addEventListener('gesturechange', preventDefaults, true);
        document.addEventListener('gestureend', preventDefaults, true);

        return () => {
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
            
            document.removeEventListener('gesturestart', preventDefaults, true);
            document.removeEventListener('gesturechange', preventDefaults, true);
            document.removeEventListener('gestureend', preventDefaults, true);
        };
    }, [visibleDayCount, isDragging, startTouchX, touchCount, initialDistance, startTouch1, startTouch2, gestureScale]);

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
                    halfCount={8}
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
                        touchAction: 'pan-x'  // 수평 스크롤만 허용
                    }}
                >
                    <div style={getTableStyle()}>
                        <Timetable 
                            dayCount={TOTAL_DAYS}
                            halfCount={8}
                            startDate="05/19"
                            hasDateHeaderAbove={false}
                        />
                    </div>
                </div>
            </div>

            {/* Zoom 상태 표시 */}
            <div className="fixed bottom-4 right-4 bg-white/80 p-2 rounded-lg text-sm">
                <p>현재 표시 중인 컬럼: {visibleDayCount}개</p>
                <p>스크롤 위치: {scrollPosition.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">
                    한 손가락: 좌우 스크롤<br />
                    두 손가락 핀치: 확대/축소<br />
                    트랙패드: 두 손가락 모으기/벌리기<br />
                    Ctrl/Cmd + 휠: 확대/축소
                </p>
            </div>
        </div>
    );
}