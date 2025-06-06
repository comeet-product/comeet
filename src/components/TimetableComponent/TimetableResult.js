"use client"

import { useState, useRef, useEffect } from "react";
import TimeHeader from "./TimeHeader";
import Timetable from "./Timetable";

export default function TimetableResult({ 
    meetingId, 
    meeting = null,
    results = [], 
    users = [],
    selectedUser = null,
    selectedUserAvailability = null,
    dayCount = 7,
    halfCount = 8,
    startDate = "05/19", // 이제 사용하지 않음 (하위 호환성을 위해 유지)
    startTime = 10,
    dateHeaderHeight = 23
}) {
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

    // 미팅 데이터에서 선택된 날짜 배열 가져오기
    const selectedDates = meeting?.dates || [];
    const TOTAL_DAYS = selectedDates.length;
    const VISIBLE_DAY_COUNT = 7; // Fixed to 7 columns
    const DATE_HEADER_HEIGHT = dateHeaderHeight;
    const SWIPE_THRESHOLD = 50; // 50px 이상 스와이프해야 페이지 변경

    // HHMM 형식을 시간으로 변환하는 함수 (TimeHeader용)
    const convertHHMMToHours = (hhmm) => {
        return Math.floor(hhmm / 100);
    };

    // 분 단위를 HHMM 형식으로 변환하는 함수
    const convertMinutesToHHMM = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours * 100 + mins;
    };

    // HHMM 형식(900 = 9:00)을 분 단위로 변환하는 함수 (계산용)
    const convertHHMMToMinutes = (hhmm) => {
        const hours = Math.floor(hhmm / 100);
        const minutes = hhmm % 100;
        return hours * 60 + minutes;
    };

    // 미팅의 시작/종료 시간을 기반으로 halfCount 계산 (모든 시간은 30분 단위)
    const calculateHalfCount = () => {
        if (!meeting?.selectable_time) return 16; // 기본값
        
        const startMinutes = convertHHMMToMinutes(meeting.selectable_time.start);
        const endMinutes = convertHHMMToMinutes(meeting.selectable_time.end);
        const durationMinutes = endMinutes - startMinutes;
        const halfCount = durationMinutes / 30; // 30분 단위이므로 정확히 나누어떨어짐
        
        console.log('TimetableResult calculated halfCount:', {
            startHHMM: meeting.selectable_time.start,
            endHHMM: meeting.selectable_time.end,
            startMinutes,
            endMinutes,
            durationMinutes,
            halfCount
        });
        
        return halfCount;
    };

    const HALF_COUNT = calculateHalfCount();

    console.log('TimetableResult initialized with:', {
        meetingDates: selectedDates,
        totalDays: TOTAL_DAYS,
        resultsCount: results.length,
        halfCount: HALF_COUNT,
        selectableTimeRaw: meeting?.selectable_time,
        selectableTimeConverted: meeting?.selectable_time ? {
            startHHMM: meeting.selectable_time.start,
            startMinutes: convertHHMMToMinutes(meeting.selectable_time.start || 900),
            startHours: convertHHMMToHours(meeting.selectable_time.start || 900)
        } : null
    });

    // 날짜가 없으면 기본 메시지 표시
    if (TOTAL_DAYS === 0) {
        return (
            <div className="flex items-center justify-center h-40 text-gray-500">
                미팅 날짜 정보를 불러오는 중...
            </div>
        );
    }

    // 결과 데이터를 슬롯 형태로 변환하는 함수
    const convertResultsToSlots = (results, selectedUser, selectedUserAvailability, users) => {
        console.log('=== Converting results to slots ===');
        console.log('Input data:', { 
            resultsCount: results.length,
            selectedUser, 
            hasSelectedUserAvailability: !!selectedUserAvailability,
            selectedUserAvailability,
            selectedDates: selectedDates,
            totalUsers: users?.length || 0
        });
        
        const slots = new Set();
        const slotOpacities = new Map(); // 각 슬롯의 투명도 정보 저장
        const totalUsers = users?.length || 1; // 전체 인원수 (0 방지)
        
        // 선택된 사용자의 availability가 있으면 해당 데이터를 우선 표시
        if (selectedUser && selectedUserAvailability) {
            console.log('=== MODE: Individual User Availability ===');
            console.log('Showing individual availability for user:', selectedUser);
            
            Object.entries(selectedUserAvailability).forEach(([date, times]) => {
                // 선택된 날짜 배열에서 해당 날짜의 인덱스 찾기
                const dayIndex = selectedDates.indexOf(date);
                
                console.log('Processing availability date:', { date, dayIndex, times });
                
                if (dayIndex !== -1 && Array.isArray(times)) {
                    times.forEach(timeHHMM => {
                        // HHMM 형식을 분 단위로 변환하여 halfIndex 계산
                        const startTimeHHMM = meeting?.selectable_time?.start || 900; // 기본값 9시 (900)
                        const startTimeMinutes = convertHHMMToMinutes(startTimeHHMM);
                        const timeMinutes = convertHHMMToMinutes(timeHHMM);
                        const halfIndex = Math.floor((timeMinutes - startTimeMinutes) / 30);
                        
                        console.log('Processing availability time:', { 
                            timeHHMM, 
                            timeMinutes, 
                            startTimeHHMM, 
                            startTimeMinutes, 
                            halfIndex 
                        });
                        
                        if (halfIndex >= 0 && halfIndex < HALF_COUNT) {
                            const slotId = `${dayIndex}-${halfIndex}`;
                            slots.add(slotId);
                            slotOpacities.set(slotId, 100); // 개별 사용자는 100% 투명도
                            console.log('Added availability slot:', slotId);
                        }
                    });
                }
            });
        } else {
            // 선택된 사용자가 없으면 전체 결과 데이터 표시 (모든 사용자의 가용성이 합쳐진 결과)
            console.log('=== MODE: Combined Results (All Users) ===');
            console.log('Showing combined results for all users, total results:', results.length);
            console.log('Available dates:', selectedDates);
            console.log('Total users for opacity calculation:', totalUsers);
            
            if (results.length === 0) {
                console.log('No results to display - empty results array');
            }
            
            results.forEach((result, index) => {
                console.log(`Processing result ${index + 1}/${results.length}:`, result);

                // 선택된 날짜 배열에서 해당 날짜의 인덱스 찾기
                const dayIndex = selectedDates.indexOf(result.date);
                
                console.log('Date calculation:', { 
                    resultDate: result.date, 
                    dayIndex,
                    isValidDay: dayIndex !== -1
                });
                
                // 시간을 30분 단위 halfIndex로 변환
                // HHMM 형식을 분 단위로 변환하여 halfIndex 계산
                const startTimeHHMM = meeting?.selectable_time?.start || 900; // 기본값 9시 (900)
                const startTimeMinutes = convertHHMMToMinutes(startTimeHHMM);
                const resultStartMinutes = convertHHMMToMinutes(result.start_time); // HHMM 형식을 분 단위로 변환
                const halfIndex = Math.floor((resultStartMinutes - startTimeMinutes) / 30);
                
                console.log('Time calculation:', { 
                    startTimeHHMM,
                    startTimeMinutes, 
                    resultStartTimeHHMM: result.start_time,
                    resultStartMinutes, 
                    halfIndex,
                    maxHalfIndex: HALF_COUNT,
                    isValidTime: halfIndex >= 0 && halfIndex < HALF_COUNT
                });
                
                // 유효한 날짜와 시간대에 대해서만 슬롯 추가
                if (dayIndex !== -1 && halfIndex >= 0 && halfIndex < HALF_COUNT) {
                    // result 테이블에는 참여 가능한 인원이 있는 시간대만 저장되어 있음
                    if (result.number > 0) { // 참여 가능한 사람이 있는 시간대만 표시
                        const slotId = `${dayIndex}-${halfIndex}`;
                        slots.add(slotId);
                        
                        // 투명도 계산: (선택자수 / 전체인원수) * 100
                        const opacity = Math.min(100, Math.max(10, (result.number / totalUsers) * 100));
                        slotOpacities.set(slotId, opacity);
                        
                        console.log('✓ Added result slot:', slotId, 'with', result.number, 'members:', result.members, 'opacity:', opacity + '%');
                    } else {
                        console.log('Skipped result (no members):', result);
                    }
                } else {
                    console.log('❌ Slot out of range or invalid date:', { 
                        result, 
                        dayIndex, 
                        halfIndex, 
                        selectedDates,
                        maxHalfIndex: HALF_COUNT,
                        dayValid: dayIndex !== -1,
                        timeValid: halfIndex >= 0 && halfIndex < HALF_COUNT
                    });
                }
            });
        }
        
        const finalSlotsArray = Array.from(slots);
        console.log('=== FINAL RESULT ===');
        console.log('Total slots generated:', finalSlotsArray.length);
        console.log('Final slots:', finalSlotsArray);
        console.log('Slot opacities:', Object.fromEntries(slotOpacities));
        console.log('===================');
        
        return { slots, slotOpacities };
    };

    // 현재 선택된 사용자와 결과 데이터를 기반으로 슬롯 계산
    const { slots: resultSlots, slotOpacities } = convertResultsToSlots(results, selectedUser, selectedUserAvailability, users);
    console.log('Result slots for rendering:', Array.from(resultSlots)); // 디버깅용

    // 페이지 계산 로직
    const getMaxPageIndex = () => {
        if (TOTAL_DAYS <= VISIBLE_DAY_COUNT) return 0;
        return Math.ceil(TOTAL_DAYS / VISIBLE_DAY_COUNT) - 1;
    };

    const getCurrentStartDay = () => {
        return currentPageIndex * VISIBLE_DAY_COUNT;
    };

    const getCurrentVisibleDays = () => {
        const startDay = getCurrentStartDay();
        const endDay = Math.min(startDay + VISIBLE_DAY_COUNT, TOTAL_DAYS);
        return endDay - startDay;
    };

    // 각 페이지별 컬럼 정보 계산
    const getPageInfo = (pageIndex) => {
        const startDay = pageIndex * VISIBLE_DAY_COUNT;
        const endDay = Math.min(startDay + VISIBLE_DAY_COUNT, TOTAL_DAYS);
        const dayCount = endDay - startDay;
        
        return {
            startDay,
            endDay,
            dayCount,
            // 7개 미만이면 컨테이너 너비를 채우도록 조정
            shouldStretch: dayCount < VISIBLE_DAY_COUNT
        };
    };

    // 날짜 계산 헬퍼 함수
    const getStartDateForPage = (pageIndex) => {
        const pageInfo = getPageInfo(pageIndex);
        const startDayIndex = pageInfo.startDay;
        
        // 선택된 날짜 배열에서 해당 인덱스의 날짜 가져오기
        if (startDayIndex < selectedDates.length) {
            const dateStr = selectedDates[startDayIndex]; // "2024-12-20" 형식
            const date = new Date(dateStr + 'T00:00:00');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${month}/${day}`;
        }
        
        // 기본값 (하위 호환성)
        return "01/01";
    };

    // 페이지 이동 함수 - 캐러셀 효과 적용
    const goToPage = (pageIndex) => {
        const maxPage = getMaxPageIndex();
        const targetPage = Math.max(0, Math.min(pageIndex, maxPage));
        
        if (targetPage !== currentPageIndex && !isAnimating) {
            setIsAnimating(true);
            setCurrentPageIndex(targetPage);
            
            // 애니메이션 완료 후 상태 초기화
            setTimeout(() => {
                setIsAnimating(false);
            }, 300);
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

    // 스와이프 이벤트 처리 (터치, 마우스, 트랙패드 지원)
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

        // 트랙패드 스와이프 지원 (데스크톱 wheel 이벤트)
        const handleWheel = (e) => {
            if (!isAnimating && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                // 수평 스크롤이 수직 스크롤보다 클 때만 처리
                const threshold = 30; // 트랙패드 민감도 조절
                
                if (Math.abs(e.deltaX) > threshold) {
                    e.preventDefault();
                    
                    if (e.deltaX > 0) {
                        // 왼쪽으로 스크롤 (다음 페이지)
                        goToPage(currentPageIndex + 1);
                    } else {
                        // 오른쪽으로 스크롤 (이전 페이지)
                        goToPage(currentPageIndex - 1);
                    }
                }
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
        
        // 트랙패드 이벤트 (데스크톱 지원)
        container.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
            container.removeEventListener('mousedown', handleMouseDown);
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseup', handleMouseUp);
            container.removeEventListener('wheel', handleWheel);
        };
    }, [touchStart, touchEnd, isSwiping, isAnimating, currentPageIndex]); // 필요한 의존성만 포함

    // 모든 페이지 렌더링을 위한 스타일 계산
    const getAllPages = () => {
        const pages = [];
        const maxPage = getMaxPageIndex();
        
        for (let i = 0; i <= maxPage; i++) {
            pages.push(getPageInfo(i));
        }
        
        return pages;
    };

    const getCarouselContainerStyle = () => {
        const pages = getAllPages();
        const totalWidth = pages.length * 100; // 각 페이지는 100% 너비
        
        return {
            width: `${totalWidth}%`,
            display: 'flex',
            transform: `translateX(-${currentPageIndex * (100 / pages.length)}%)`,
            transition: isAnimating ? 'transform 0.3s ease-out' : 'none'
        };
    };

    const getPageStyle = (pageInfo) => {
        const pages = getAllPages();
        return {
            width: `${100 / pages.length}%`, // 각 페이지는 전체 컨테이너의 동일한 비율
            flexShrink: 0
        };
    };

    const getTimetableStyle = (pageInfo) => {
        if (pageInfo.shouldStretch) {
            // 7개 미만이면 컨테이너 너비를 채우도록 100%
            return {
                width: '100%'
            };
        } else {
            // 7개일 때는 고정 너비
            return {
                width: `${100 * (VISIBLE_DAY_COUNT / VISIBLE_DAY_COUNT)}%` // 100%
            };
        }
    };

    return (
        <div className="flex w-full">
            <div className="flex-shrink-0 min-w-max">
                <TimeHeader 
                    halfCount={HALF_COUNT}
                    startTime={meeting?.selectable_time?.start ? convertHHMMToHours(meeting.selectable_time.start) : 10}
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
                        minHeight: '100px',
                        width: '100%'
                    }}
                >
                    <div style={getCarouselContainerStyle()}>
                        {getAllPages().map((pageInfo, pageIndex) => (
                            <div 
                                key={pageIndex}
                                style={getPageStyle(pageInfo)}
                            >
                                <div style={getTimetableStyle(pageInfo)}>
                                    <Timetable 
                                        dayCount={pageInfo.dayCount}
                                        halfCount={HALF_COUNT}
                                        startDate={getStartDateForPage(pageIndex)}
                                        hasDateHeaderAbove={false}
                                        selectedSlots={resultSlots}
                                        slotOpacities={selectedUser ? null : slotOpacities}
                                        onSlotSelection={() => {}}
                                        onTapSelection={() => {}}
                                        onTouchPending={() => {}}
                                        onDragSelectionStart={() => {}}
                                        onDragSelectionMove={() => {}}
                                        onDragSelectionEnd={() => {}}
                                        isSelectionEnabled={false}
                                        isDragSelecting={false}
                                        pendingTouchSlot={null}
                                        pageStartDay={pageInfo.startDay}
                                        selectedDates={selectedDates}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 