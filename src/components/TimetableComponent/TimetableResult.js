"use client";

import { useState, useRef, useEffect } from "react";
import TimeHeader from "./TimeHeader";
import Timetable from "./Timetable";

export default function TimetableResult({ 
    dayCount = 7, 
    halfCount = 8, 
    startDate = "05/19", 
    startTime = 10, 
    dateHeaderHeight = 23,
    meetingId,
    meeting,
    results = [],
    users = [],
    selectedUser = null,
    selectedUserAvailability = null,
    selectedCell = null,
    selectedCells = [],
    onCellSelect = () => {},
}) {
    // Props 전달 상태 확인을 위한 로그
    useEffect(() => {
        console.log('📊 TimetableResult props updated:', {
            selectedUser,
            hasSelectedUserAvailability: !!selectedUserAvailability,
            selectedUserAvailability: selectedUserAvailability,
            meetingDatesLength: meeting?.dates?.length,
            meetingId
        });
    }, [selectedUser, selectedUserAvailability, meetingId]);

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

    // meeting 기반 시간 설정 (TimetableSelect와 동일한 로직)
    const getMeetingTimeInfo = () => {
        if (!meeting?.selectable_time) {
            return {
                startTime: startTime,
                halfCount: halfCount,
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

        // 30분 단위로 정확한 시간 계산
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

    const { startTime: dynamicStartTime, halfCount: dynamicHalfCount } =
        getMeetingTimeInfo();

    // 실제 데이터를 기반으로 계산된 Constants
    const TOTAL_DAYS = meeting?.dates?.length || dayCount;
    const VISIBLE_DAY_COUNT = 7; // Fixed to 7 columns
    const DATE_HEADER_HEIGHT = dateHeaderHeight;
    const SWIPE_THRESHOLD = 50; // 50px 이상 스와이프해야 페이지 변경

    // 시간 슬롯 ID 생성 헬퍼 함수 (HHMM 형식을 30분 단위 인덱스로 변환)
    const timeToHalfIndex = (time) => {
        if (typeof time === "string") {
            // "10:30" 형태 처리
            const [hour, minute] = time.split(":").map(Number);
            // dynamicStartTime을 30분 단위로 변환하여 계산
            const startHour = Math.floor(dynamicStartTime);
            const startMinute = dynamicStartTime % 1 >= 0.5 ? 30 : 0;
            const startTimeInMinutes = startHour * 60 + startMinute;
            const currentTimeInMinutes = hour * 60 + minute;
            return Math.floor((currentTimeInMinutes - startTimeInMinutes) / 30);
        } else {
            // HHMM 숫자 형태 처리 (예: 1030)
            const hour = Math.floor(time / 100);
            const minute = time % 100;
            const startHour = Math.floor(dynamicStartTime);
            const startMinute = dynamicStartTime % 1 >= 0.5 ? 30 : 0;
            const startTimeInMinutes = startHour * 60 + startMinute;
            const currentTimeInMinutes = hour * 60 + minute;
            return Math.floor((currentTimeInMinutes - startTimeInMinutes) / 30);
        }
    };

    const halfIndexToTime = (halfIndex) => {
        // dynamicStartTime을 30분 단위로 계산
        const startHour = Math.floor(dynamicStartTime);
        const startMinute = dynamicStartTime % 1 >= 0.5 ? 30 : 0;
        const totalMinutes = startHour * 60 + startMinute + halfIndex * 30;
        const hour = Math.floor(totalMinutes / 60);
        const minute = totalMinutes % 60;
        return hour * 100 + minute; // HHMM 형식으로 반환
    };

    // 시간(HHMM)을 halfIndex로 변환하는 함수
    const getHalfIndexFromTime = (time) => {
        if (typeof time === "string") {
            // "10:30" 형태 처리
            const [hour, minute] = time.split(":").map(Number);
            const startHour = Math.floor(dynamicStartTime);
            const startMinute = dynamicStartTime % 1 >= 0.5 ? 30 : 0;
            const startTimeInMinutes = startHour * 60 + startMinute;
            const currentTimeInMinutes = hour * 60 + minute;
            return Math.floor((currentTimeInMinutes - startTimeInMinutes) / 30);
        } else {
            // HHMM 숫자 형태 처리 (예: 1030)
            const hour = Math.floor(time / 100);
            const minute = time % 100;
            const startHour = Math.floor(dynamicStartTime);
            const startMinute = dynamicStartTime % 1 >= 0.5 ? 30 : 0;
            const startTimeInMinutes = startHour * 60 + startMinute;
            const currentTimeInMinutes = hour * 60 + minute;
            return Math.floor((currentTimeInMinutes - startTimeInMinutes) / 30);
        }
    };

    // 결과 데이터를 시간 슬롯 정보로 변환 (페이지별)
    const getResultSlots = (pageStartDay = 0, pageDayCount = VISIBLE_DAY_COUNT) => {
        const resultSlots = new Map(); // Set 대신 Map을 사용하여 투명도 정보도 저장
        
        results.forEach(result => {
            const absoluteDateIndex = meeting?.dates?.indexOf(result.date);
            if (absoluteDateIndex !== -1) {
                // 현재 페이지 범위 내에 있는지 확인
                if (absoluteDateIndex >= pageStartDay && absoluteDateIndex < pageStartDay + pageDayCount) {
                    const relativeDayIndex = absoluteDateIndex - pageStartDay; // 페이지 내 상대적 인덱스
                const halfIndex = timeToHalfIndex(result.start_time);
                if (halfIndex >= 0 && halfIndex < dynamicHalfCount) {
                        const slotId = `${relativeDayIndex}-${halfIndex}`;
                    // 사람 수에 따른 투명도 계산 (선택사람수/전체사람수*100)
                    const opacity = users.length > 0 ? (result.number / users.length) * 100 : 0;
                    resultSlots.set(slotId, { opacity, count: result.number });
                    }
                }
            }
        });

        return resultSlots;
    };

    // 선택된 사용자의 availability를 시간 슬롯 정보로 변환 (페이지별)
    const getUserAvailabilitySlots = (pageStartDay = 0, pageDayCount = VISIBLE_DAY_COUNT) => {
        if (!selectedUser || !selectedUserAvailability) {
            return new Set();
        }

        const availabilitySlots = new Set();
        
        Object.entries(selectedUserAvailability).forEach(([date, times]) => {
            const absoluteDateIndex = meeting?.dates?.indexOf(date);
            if (absoluteDateIndex !== -1 && Array.isArray(times)) {
                // 현재 페이지 범위 내에 있는지 확인
                if (absoluteDateIndex >= pageStartDay && absoluteDateIndex < pageStartDay + pageDayCount) {
                    const relativeDayIndex = absoluteDateIndex - pageStartDay; // 페이지 내 상대적 인덱스
                times.forEach(time => {
                    const halfIndex = timeToHalfIndex(time);
                    if (halfIndex >= 0 && halfIndex < dynamicHalfCount) {
                            availabilitySlots.add(`${relativeDayIndex}-${halfIndex}`);
                    }
                });
                }
            }
        });

        return availabilitySlots;
    };

    // 선택된 셀들을 시간 슬롯 정보로 변환 (페이지별)
    const getSelectedCellSlots = (pageStartDay = 0, pageDayCount = VISIBLE_DAY_COUNT) => {
        const selectedCellSlots = new Map();
        
        // 단일 선택된 셀 처리
        if (selectedCell && !selectedUser) {
            const cellDateIndex = meeting?.dates?.indexOf(selectedCell.date);
            if (cellDateIndex !== -1) {
                // 현재 페이지 범위 내에 있는지 확인
                if (cellDateIndex >= pageStartDay && cellDateIndex < pageStartDay + pageDayCount) {
                    const relativeDayIndex = cellDateIndex - pageStartDay;
                    const halfIndex = getHalfIndexFromTime(selectedCell.start_time);
                    if (halfIndex >= 0 && halfIndex < dynamicHalfCount) {
                        const slotId = `${relativeDayIndex}-${halfIndex}`;
                        // 기존 결과 데이터의 opacity 유지 (selectedCell에 저장된 실제 참여자 수 기반)
                        const opacity = users.length > 0 ? (selectedCell.number / users.length) * 100 : 0;
                        selectedCellSlots.set(slotId, { opacity, count: selectedCell.number, isSelected: true });
                    }
                }
            }
        }
        
        // 연속 선택된 셀들 처리
        if (selectedCells && selectedCells.length > 0 && !selectedUser) {
            selectedCells.forEach(cell => {
                const cellDateIndex = meeting?.dates?.indexOf(cell.date);
                if (cellDateIndex !== -1) {
                    // 현재 페이지 범위 내에 있는지 확인
                    if (cellDateIndex >= pageStartDay && cellDateIndex < pageStartDay + pageDayCount) {
                        const relativeDayIndex = cellDateIndex - pageStartDay;
                        const halfIndex = getHalfIndexFromTime(cell.start_time);
                        if (halfIndex >= 0 && halfIndex < dynamicHalfCount) {
                            const slotId = `${relativeDayIndex}-${halfIndex}`;
                            // 기존 결과 데이터의 opacity 유지 (cell에 저장된 실제 참여자 수 기반)
                            const opacity = users.length > 0 ? (cell.number / users.length) * 100 : 0;
                            selectedCellSlots.set(slotId, { opacity, count: cell.number, isSelected: true });
                        }
                    }
                }
            });
        }
        
        return selectedCellSlots;
    };

    // 모든 슬롯 데이터를 합치는 함수 (페이지별)
    const getCombinedSlots = (pageStartDay = 0, pageDayCount = VISIBLE_DAY_COUNT) => {
        if (selectedUser) {
            // 사용자가 선택된 경우 availability만 표시
            return getUserAvailabilitySlots(pageStartDay, pageDayCount);
        } else {
            // 결과 데이터와 선택된 셀들을 합쳐서 반환
            const resultSlots = getResultSlots(pageStartDay, pageDayCount);
            const selectedCellSlots = getSelectedCellSlots(pageStartDay, pageDayCount);
            
            // Map을 합치기 (선택된 셀이 우선순위를 가짐)
            const combinedSlots = new Map([...resultSlots, ...selectedCellSlots]);
            return combinedSlots;
        }
    };

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
            shouldStretch: dayCount < VISIBLE_DAY_COUNT,
        };
    };

    // 페이지 이동 함수 - 캐러셀 효과 적용
    const goToPage = (pageIndex) => {
        const maxPage = getMaxPageIndex();
        const targetPage = Math.max(0, Math.min(pageIndex, maxPage));
        
        console.log('🔄 goToPage called:', {
            requestedPage: pageIndex,
            maxPage,
            targetPage,
            currentPageIndex,
            isAnimating
        });
        
        if (targetPage !== currentPageIndex && !isAnimating) {
            console.log('✅ Moving to page:', targetPage);
            setIsAnimating(true);
            setCurrentPageIndex(targetPage);
            
            // 애니메이션 완료 후 상태 초기화
            setTimeout(() => {
                console.log('✅ Animation completed, page is now:', targetPage);
                setIsAnimating(false);
            }, 300);
        } else {
            console.log('❌ Page change blocked:', {
                samePageRequest: targetPage === currentPageIndex,
                isAnimating
            });
        }
    };

    // 특정 날짜가 포함된 페이지를 찾는 함수
    const findPageWithDate = (date) => {
        const dateIndex = meeting?.dates?.indexOf(date);
        console.log('Finding page with date:', { date, dateIndex, meetingDates: meeting?.dates });
        
        if (dateIndex === -1) {
            console.log('Date not found in meeting dates');
            return -1;
        }
        
        const pageIndex = Math.floor(dateIndex / VISIBLE_DAY_COUNT);
        console.log('Calculated page index:', pageIndex, 'for date index:', dateIndex);
        return pageIndex;
    };

    // 사용자 availability에서 첫 번째 가능한 날짜를 찾는 함수
    const findFirstAvailableDate = (availability) => {
        console.log('Finding first available date in:', availability);
        
        if (!availability || typeof availability !== 'object') {
            console.log('Invalid availability object');
            return null;
        }
        
        // 가능한 날짜들을 정렬하여 첫 번째를 반환
        const availableDates = Object.keys(availability).filter(date => {
            const hasAvailability = Array.isArray(availability[date]) && availability[date].length > 0;
            console.log(`Date ${date} has availability:`, hasAvailability, availability[date]);
            return hasAvailability;
        });
        
        console.log('Available dates found:', availableDates);
        
        if (availableDates.length === 0) {
            console.log('No available dates');
            return null;
        }
        
        // 미팅 날짜 순서에 따라 정렬
        const meetingDates = meeting?.dates || [];
        console.log('Meeting dates for sorting:', meetingDates);
        
        availableDates.sort((a, b) => {
            const indexA = meetingDates.indexOf(a);
            const indexB = meetingDates.indexOf(b);
            console.log(`Sorting: ${a} (index ${indexA}) vs ${b} (index ${indexB})`);
            return indexA - indexB;
        });
        
        console.log('Sorted available dates:', availableDates);
        const firstDate = availableDates[0];
        console.log('First available date:', firstDate);
        return firstDate;
    };

    // 현재 페이지에 사용자의 availability가 있는지 확인하는 함수
    const isUserAvailabilityInCurrentPage = (availability) => {
        if (!availability || typeof availability !== 'object') return false;
        
        const currentStartDay = getCurrentStartDay();
        const currentEndDay = Math.min(currentStartDay + VISIBLE_DAY_COUNT, TOTAL_DAYS);
        const currentPageDates = meeting?.dates?.slice(currentStartDay, currentEndDay) || [];
        
        console.log('Checking availability in current page:', {
            currentStartDay,
            currentEndDay,
            currentPageDates,
            availability: Object.keys(availability)
        });
        
        // 현재 페이지의 날짜 중에 사용자 availability가 있는지 확인
        const hasAvailability = currentPageDates.some(date => {
            const hasDate = availability[date] && Array.isArray(availability[date]) && availability[date].length > 0;
            console.log(`Date ${date}: has availability = ${hasDate}`, availability[date]);
            return hasDate;
        });
        
        console.log('User availability in current page:', hasAvailability);
        return hasAvailability;
    };

    // 자동 네비게이션을 위한 debounce ref
    const autoNavigationTimeoutRef = useRef(null);
    const [isAutoNavigating, setIsAutoNavigating] = useState(false);

    // 선택된 사용자가 변경될 때 자동 페이지 이동 (debounced)
    useEffect(() => {
        // 이전 timeout 취소
        if (autoNavigationTimeoutRef.current) {
            clearTimeout(autoNavigationTimeoutRef.current);
        }

        // 자동 네비게이션 중이면 스킵
        if (isAutoNavigating) {
            return;
        }

        if (selectedUser && selectedUserAvailability) {
            autoNavigationTimeoutRef.current = setTimeout(() => {
                console.log('=== Auto page navigation check ===');
                console.log('Selected user:', selectedUser);
                console.log('Current page index:', currentPageIndex);
                
                // 현재 페이지에 사용자의 availability가 있는지 확인
                const hasAvailabilityInCurrentPage = isUserAvailabilityInCurrentPage(selectedUserAvailability);
                console.log('Has availability in current page:', hasAvailabilityInCurrentPage);
                
                if (!hasAvailabilityInCurrentPage) {
                    console.log('User availability not in current page, finding appropriate page...');
                    
                    // 사용자의 첫 번째 가능한 날짜 찾기
                    const firstAvailableDate = findFirstAvailableDate(selectedUserAvailability);
                    console.log('First available date:', firstAvailableDate);
                    
                    if (firstAvailableDate) {
                        // 해당 날짜가 있는 페이지로 이동
                        const targetPage = findPageWithDate(firstAvailableDate);
                        console.log('Target page for date', firstAvailableDate, ':', targetPage);
                        console.log('Current page:', currentPageIndex);
                        
                        if (targetPage !== -1 && targetPage !== currentPageIndex) {
                            console.log(`🚀 Moving to page ${targetPage} for date ${firstAvailableDate}`);
                            setIsAutoNavigating(true);
                            goToPage(targetPage);
                            // 네비게이션 완료 후 플래그 해제
                            setTimeout(() => setIsAutoNavigating(false), 500);
                        } else {
                            console.log('Target page is same as current page or invalid');
                        }
                    } else {
                        console.log('No available date found');
                    }
                } else {
                    console.log('User availability already visible in current page');
                }
                console.log('=== End auto page navigation check ===');
            }, 150); // 150ms debounce
        }

        return () => {
            if (autoNavigationTimeoutRef.current) {
                clearTimeout(autoNavigationTimeoutRef.current);
            }
        };
    }, [selectedUser, selectedUserAvailability, currentPageIndex, isAutoNavigating]);

    // 추천 클릭 시 (selectedCells 변경 시) 자동 페이지 이동 (debounced)
    useEffect(() => {
        // 자동 네비게이션 중이거나 사용자가 선택된 경우 스킵
        if (isAutoNavigating || selectedUser) {
            return;
        }

        if (selectedCells && selectedCells.length > 0) {
            const timeoutId = setTimeout(() => {
                console.log('=== Recommendation auto page navigation check ===');
                console.log('Selected cells:', selectedCells);
                console.log('Current page index:', currentPageIndex);
                
                // 첫 번째 선택된 셀의 날짜 찾기
                const firstSelectedCell = selectedCells[0];
                const selectedDate = firstSelectedCell.date;
                console.log('First selected date:', selectedDate);
                
                if (selectedDate) {
                    // 해당 날짜가 있는 페이지 찾기
                    const targetPage = findPageWithDate(selectedDate);
                    console.log('Target page for recommendation date', selectedDate, ':', targetPage);
                    console.log('Current page:', currentPageIndex);
                    
                    if (targetPage !== -1 && targetPage !== currentPageIndex) {
                        console.log(`🎯 Moving to page ${targetPage} for recommendation date ${selectedDate}`);
                        setIsAutoNavigating(true);
                        goToPage(targetPage);
                        // 네비게이션 완료 후 플래그 해제
                        setTimeout(() => setIsAutoNavigating(false), 500);
                    } else {
                        console.log('Target page is same as current page or invalid');
                    }
                }
                console.log('=== End recommendation auto page navigation check ===');
            }, 150); // 150ms debounce

            return () => clearTimeout(timeoutId);
        }
    }, [selectedCells, currentPageIndex, isAutoNavigating, selectedUser]);

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
            // time-slot 클래스를 가진 요소(셀)에서 발생한 터치는 무시
            if (e.target.closest('.time-slot')) {
                return;
            }
            
            if (e.touches.length === 1 && !isAnimating) {
                const touch = e.touches[0];
                setTouchStart({ x: touch.clientX, y: touch.clientY });
                setTouchEnd({ x: touch.clientX, y: touch.clientY });
                setIsSwiping(true);
            }
        };

        const handleTouchMove = (e) => {
            // time-slot 클래스를 가진 요소(셀)에서 발생한 터치는 무시
            if (e.target.closest('.time-slot')) {
                return;
            }
            
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
            // time-slot 클래스를 가진 요소(셀)에서 발생한 터치는 무시
            if (e.target.closest('.time-slot')) {
                return;
            }
            
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
        container.addEventListener("touchstart", handleTouchStart, {
            passive: false,
        });
        container.addEventListener("touchmove", handleTouchMove, {
            passive: false,
        });
        container.addEventListener("touchend", handleTouchEnd);
        
        // 마우스 이벤트 (데스크톱 지원)
        container.addEventListener("mousedown", handleMouseDown);
        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mouseup", handleMouseUp);
        
        // 트랙패드 이벤트 (데스크톱 지원)
        container.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            container.removeEventListener("touchstart", handleTouchStart);
            container.removeEventListener("touchmove", handleTouchMove);
            container.removeEventListener("touchend", handleTouchEnd);
            container.removeEventListener("mousedown", handleMouseDown);
            container.removeEventListener("mousemove", handleMouseMove);
            container.removeEventListener("mouseup", handleMouseUp);
            container.removeEventListener("wheel", handleWheel);
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
            display: "flex",
            transform: `translateX(-${
                currentPageIndex * (100 / pages.length)
            }%)`,
            transition: isAnimating ? "transform 0.3s ease-out" : "none",
        };
    };

    const getPageStyle = (pageInfo) => {
        const pages = getAllPages();
        return {
            width: `${100 / pages.length}%`, // 각 페이지는 전체 컨테이너의 동일한 비율
            flexShrink: 0,
        };
    };

    const getTimetableStyle = (pageInfo) => {
        if (pageInfo.shouldStretch) {
            // 7개 미만이면 컨테이너 너비를 채우도록 100%
            return {
                width: "100%",
            };
        } else {
            // 7개일 때는 고정 너비
            return {
                width: `${100 * (VISIBLE_DAY_COUNT / VISIBLE_DAY_COUNT)}%`, // 100%
            };
        }
    };

    // 셀 클릭 핸들러
    const handleCellClick = (dayIndex, halfIndex, pageStartDay) => {
        // 사용자가 선택된 상태가 아닐 때만 작동
        if (selectedUser) return;
        
        const actualDayIndex = pageStartDay + dayIndex;
        const slotId = `${dayIndex}-${halfIndex}`;
        
        console.log("Cell clicked:", {
            dayIndex,
            halfIndex,
            actualDayIndex,
            slotId,
        });
        
        // 해당 셀의 결과 데이터 찾기
        const clickedResults = results.filter((result) => {
            const resultDateIndex = meeting?.dates?.indexOf(result.date);
            const resultHalfIndex = getHalfIndexFromTime(result.start_time);
            
            return (
                resultDateIndex === actualDayIndex &&
                resultHalfIndex === halfIndex
            );
        });
        
        console.log("Found results for clicked cell:", clickedResults);
        
        if (clickedResults.length > 0) {
            // 첫 번째 결과에 위치 정보 추가
            const cellData = {
                ...clickedResults[0],
                dayIndex: dayIndex,
                halfIndex: halfIndex,
                pageStartDay: pageStartDay,
                slotId: slotId,
            };
            onCellSelect(cellData);
        }
    };

    return (
        <div className="flex w-full">
            <div className="flex-shrink-0 min-w-max">
                <TimeHeader 
                    halfCount={dynamicHalfCount}
                    startTime={dynamicStartTime}
                    dateHeaderHeight={DATE_HEADER_HEIGHT}
                />
            </div>

            <div 
                ref={containerRef}
                className="flex-1 min-w-0"
                style={{ 
                    position: "relative",
                    touchAction: "manipulation", // TimetableSelect와 동일한 설정
                }}
            >
                <div 
                    ref={timetableRef}
                    className="overflow-hidden"
                    data-scroll-container="true"
                    style={{ 
                        touchAction: "auto", // pan-y에서 auto로 변경하여 셀 클릭 허용
                        userSelect: "none", // 텍스트 선택 방지
                        WebkitUserSelect: "none",
                        minHeight: "100px",
                        width: "100%",
                    }}
                >
                    <div style={getCarouselContainerStyle()}>
                        {getAllPages().map((pageInfo, pageIndex) => (
                            <div key={pageIndex} style={getPageStyle(pageInfo)}>
                                <div style={getTimetableStyle(pageInfo)}>
                                    <Timetable 
                                        dayCount={pageInfo.dayCount}
                                        halfCount={dynamicHalfCount}
                                        hasDateHeaderAbove={false}
                                        selectedSlots={getCombinedSlots(pageInfo.startDay, pageInfo.dayCount)}  // 페이지별 데이터 전달
                                        onSlotSelection={() => {}}  // 터치 선택 비활성화
                                        onTapSelection={() => {}}   // 터치 선택 비활성화
                                        onTouchPending={() => {}}   // 터치 선택 비활성화
                                        onDragSelectionStart={() => {}}  // 드래그 선택 비활성화
                                        onDragSelectionMove={() => {}}   // 드래그 선택 비활성화
                                        onDragSelectionEnd={() => {}}    // 드래그 선택 비활성화
                                        isSelectionEnabled={false}       // 선택 기능 완전 비활성화
                                        isDragSelecting={false}
                                        pendingTouchSlot={null}
                                        selectedDates={meeting?.dates} // 실제 날짜 배열 전달
                                        pageStartDay={pageInfo.startDay} // 페이지 시작 날짜 정보
                                        onCellClick={handleCellClick} // 셀 클릭 핸들러 추가
                                        selectedCell={selectedCell} // 선택된 셀 정보 전달
                                        selectedCells={selectedCells} // 연속 선택된 셀들 정보 전달
                                        results={results} // 결과 데이터 전달
                                        meeting={meeting} // 미팅 데이터 전달
                                        dynamicStartTime={dynamicStartTime} // 동적 시작 시간 전달
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
