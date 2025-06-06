"use client"

import { useState } from 'react';
import React from 'react';

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
  selectedCell,
  selectedCells = [],
  results,
  pageStartDay = 0,
  meeting,
  dynamicStartTime = 10
}) {
  const slotId = `${dayIndex}-${halfIndex}`;
  
  // selectedSlots가 Map인지 Set인지 확인하여 처리
  let isSelected = false;
  let slotOpacity = 100; // 기본 투명도 100%
  let hasResultData = false; // 결과 데이터가 있는지 확인
  
  if (selectedSlots instanceof Map) {
    // Map인 경우 (결과 데이터)
    const slotData = selectedSlots.get(slotId);
    if (slotData) {
      isSelected = true;
      slotOpacity = slotData.opacity;
      hasResultData = true;
    }
  } else if (selectedSlots instanceof Set || selectedSlots?.has) {
    // Set인 경우 (사용자 availability)
    isSelected = selectedSlots.has(slotId);
  }

  // 셀이 선택되었는지 확인 (selectedCell과 현재 셀 비교)
  const isCellSelected = React.useMemo(() => {
    if (!selectedCell || !hasResultData) {
      return false;
    }

    // 간단한 위치 기반 비교
    return selectedCell.dayIndex === dayIndex && 
           selectedCell.halfIndex === halfIndex &&
           selectedCell.slotId === slotId;
  }, [selectedCell, hasResultData, dayIndex, halfIndex, slotId]);

  // 연속된 셀들 중 하나인지 확인
  const isInSelectedCells = React.useMemo(() => {
    if (!selectedCells || selectedCells.length === 0 || !hasResultData) {
      return false;
    }

    // 현재 셀의 실제 날짜와 시간 확인
    const actualDayIndex = pageStartDay + dayIndex;
    const currentDate = meeting?.dates?.[actualDayIndex];
    
    if (!currentDate) return false;

    // halfIndex를 실제 시간으로 변환
    const hour = dynamicStartTime + Math.floor(halfIndex / 2);
    const minute = (halfIndex % 2) * 30;
    const currentTime = hour * 100 + minute;

    // selectedCells에서 현재 셀과 일치하는 것이 있는지 확인
    return selectedCells.some(cell => 
      cell.date === currentDate && cell.start_time === currentTime
    );
  }, [selectedCells, hasResultData, dayIndex, halfIndex, pageStartDay, meeting, dynamicStartTime]);
  
  const isPending = pendingTouchSlot && 
    pendingTouchSlot.dayIndex === dayIndex && 
    pendingTouchSlot.halfIndex === halfIndex;

  // 터치 관련 로컬 상태 추가
  const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 });
  const [localTouchMoved, setLocalTouchMoved] = useState(false);
  const [touchStartTimestamp, setTouchStartTimestamp] = useState(0);

  // 마우스 이벤트 추적용 로컬 상태
  const [mouseStartTime, setMouseStartTime] = useState(0);
  const [mouseStartPos, setMouseStartPos] = useState({ x: 0, y: 0 });
  const [hasMouseMoved, setHasMouseMoved] = useState(false);
  const [localDragStarted, setLocalDragStarted] = useState(false);

  const CLICK_THRESHOLD = 200; // 200ms 이하만 빠른 클릭으로 간주
  const DRAG_TIME_THRESHOLD = 200; // 200ms 이상 누르면 드래그 모드로 전환
  const TOUCH_MOVE_THRESHOLD = 8; // 8px 이상 움직이면 드래그로 간주



  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 결과 데이터가 있고 선택 기능이 비활성화된 경우 (result view)에서만 셀 클릭 처리
    if (!isSelectionEnabled && hasResultData && onCellClick) {
      onCellClick(dayIndex, halfIndex, pageStartDay);
      return;
    }
    
    // 기존 선택 로직
    if (isSelectionEnabled && onTapSelection && !localDragStarted) {
      onTapSelection(dayIndex, halfIndex);
    }
  };

  const handleTouchStart = (e) => {
    // 터치 시작 위치와 시간 기록 (항상 기록)
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setTouchStartPos({ x: touch.clientX, y: touch.clientY });
      setTouchStartTimestamp(Date.now());
      setLocalTouchMoved(false);
    }
    
    // 선택 기능이 활성화된 경우에만 기존 로직 실행
    if (isSelectionEnabled && e.touches.length <= 1) {
      e.preventDefault();
      e.stopPropagation();
      
      // 상위 컴포넌트의 터치 시작 핸들러 호출
      if (onTouchStart) {
        onTouchStart(dayIndex, halfIndex, e.touches[0].clientY);
      }
    }
  };

  const handleTouchMove = (e) => {
    // 터치가 하나일 때만 처리
    if (e.touches.length !== 1) {
      return;
    }

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPos.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.y);
    
    // 움직임이 충분히 감지되면 localTouchMoved 설정
    if ((deltaX > TOUCH_MOVE_THRESHOLD || deltaY > TOUCH_MOVE_THRESHOLD) && !localTouchMoved) {
      setLocalTouchMoved(true);
    }
    
    // 선택 기능이 활성화된 경우에만 기존 로직 실행
    if (isSelectionEnabled) {
      // 상위 컴포넌트의 터치 이동 핸들러 호출
      if (onTouchMove) {
        onTouchMove(dayIndex, halfIndex, touch.clientY);
      }
      
      // 이미 드래그 선택 중이면 드래그 이동도 처리
      if (isDragSelecting && onDragSelectionMove) {
        // 터치 포인트 아래의 엘리먼트 찾기
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (elementBelow && elementBelow.dataset.dayIndex && elementBelow.dataset.halfIndex) {
          const newDayIndex = parseInt(elementBelow.dataset.dayIndex);
          const newHalfIndex = parseInt(elementBelow.dataset.halfIndex);
          
          // 드래그 이동 처리
          onDragSelectionMove(newDayIndex, newHalfIndex);
        }
      }
    }
  };

  const handleTouchEnd = (e) => {
    const touchDuration = Date.now() - touchStartTimestamp;
    const wasQuickTap = touchDuration < CLICK_THRESHOLD && !localTouchMoved;
    
    // 빠른 탭이고 움직임이 거의 없었으면 셀 클릭으로 처리
    if (wasQuickTap) {
      // 결과 데이터가 있고 선택 기능이 비활성화된 경우 셀 클릭 처리
      if (!isSelectionEnabled && hasResultData && onCellClick) {
        onCellClick(dayIndex, halfIndex, pageStartDay);
      }
      // 선택 기능이 활성화된 경우 기존 선택 로직
      else if (isSelectionEnabled && onTapSelection) {
        onTapSelection(dayIndex, halfIndex);
      }
    }
    
    // 선택 기능이 활성화된 경우에만 기존 로직 실행
    if (isSelectionEnabled) {
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
    }, 50);
  };

  // 마우스 이벤트 핸들러
  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 마우스 다운 정보 기록
    setMouseStartTime(Date.now());
    setMouseStartPos({ x: e.clientX, y: e.clientY });
    setHasMouseMoved(false);
    setLocalDragStarted(false);
    
    // 상위 컴포넌트의 마우스 시작 핸들러 호출
    if (onMouseStart) {
      onMouseStart(dayIndex, halfIndex, e.clientY);
    }
  };

  const handleMouseMove = (e) => {
    if (mouseStartTime > 0) {
      // 일정 시간 이상 경과하면 드래그로 간주
      const timeDiff = Date.now() - mouseStartTime;
      
      if (!localDragStarted && timeDiff > DRAG_TIME_THRESHOLD) {
        setHasMouseMoved(true);
        setLocalDragStarted(true);
        
        if (isSelectionEnabled && onDragSelectionStart) {
          onDragSelectionStart(dayIndex, halfIndex);
        }
      }
    }
    
    // 상위 컴포넌트의 마우스 이동 핸들러 호출
    if (onMouseMove) {
      onMouseMove(dayIndex, halfIndex, e.clientY);
    }
    
    // 이미 드래그가 시작된 경우 드래그 이동 처리
    if (isDragSelecting && onDragSelectionMove) {
      onDragSelectionMove(dayIndex, halfIndex);
    }
  };

  const handleMouseEnter = (e) => {
    // 전역 드래그 중일 때만 드래그 이동 처리
    if (isDragSelecting && onDragSelectionMove) {
      onDragSelectionMove(dayIndex, halfIndex);
    }
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const timeDiff = Date.now() - mouseStartTime;
    const wasQuickClick = timeDiff < CLICK_THRESHOLD && !hasMouseMoved;
    
    // 드래그가 진행 중이었다면 종료
    if (isDragSelecting && onDragSelectionEnd) {
      onDragSelectionEnd();
    }
    
    // 상위 컴포넌트의 마우스 종료 핸들러 호출
    if (onMouseEnd) {
      onMouseEnd();
    }
    
    // 상태 초기화는 약간 지연시켜서 click 이벤트가 먼저 처리되도록 함
    setTimeout(() => {
      setMouseStartTime(0);
      setMouseStartPos({ x: 0, y: 0 });
      setHasMouseMoved(false);
      setLocalDragStarted(false);
    }, 50);
  };

  return (
    <div 
      className={`w-full h-[17px] border-gray-500 cursor-pointer transition-colors duration-150 ${
        isTop === undefined
          ? `border-[1.3px] ${hasHourAbove ? 'border-t-0' : ''} ${!isFirstDay ? 'border-l-0' : ''} ${hasDateHeaderAbove ? 'border-t-0' : ''}`
          : isTop 
            ? `border-[1px] border-b-[1px] border-b-gray-400 ${!isFirstHour ? 'border-t-0' : ''} ${!isFirstDay ? 'border-l-0' : ''} ${hasDateHeaderAbove ? 'border-t-0' : ''}` 
            : `border-[1.3px] border-t-0 ${!isFirstDay ? 'border-l-0' : ''}`
      }`}
      style={{
        backgroundColor: isCellSelected
          ? '#10B981' // 선택된 셀은 녹색으로 표시
          : isInSelectedCells
            ? '#F97316' // 연속된 셀들은 오렌지색으로 표시
            : isSelected 
              ? `#3674B5${Math.round(slotOpacity * 2.55).toString(16).padStart(2, '0')}` // main color with dynamic opacity
              : isPending 
                ? '#3674B526' // main color with 10% opacity (26 in hex = ~15% opacity)
                : 'transparent',
        cursor: (!isSelectionEnabled && hasResultData) ? 'pointer' : (isSelectionEnabled ? 'pointer' : 'default'),
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
        // 선택된 셀에 테두리 추가
        border: isCellSelected ? '2px solid #059669' : isInSelectedCells ? '2px solid #EA580C' : undefined,
        boxSizing: 'border-box'
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      data-day-index={String(dayIndex)}
      data-half-index={String(halfIndex)}
    >
    </div>
  );
} 