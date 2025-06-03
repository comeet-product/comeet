"use client"

import { useState } from 'react';

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
  onDragSelectionStart,
  onDragSelectionMove,
  onDragSelectionEnd,
  isSelectionEnabled,
  isDragSelecting,
  touchStartTime,
  setTouchStartTime,
  tapThreshold
}) {
  const slotId = `${dayIndex}-${halfIndex}`;
  const isSelected = selectedSlots?.has(slotId) || false;

  // 마우스 이벤트 추적용 로컬 상태
  const [mouseStartTime, setMouseStartTime] = useState(0);
  const [mouseStartPos, setMouseStartPos] = useState({ x: 0, y: 0 });
  const [hasMouseMoved, setHasMouseMoved] = useState(false);
  const [localDragStarted, setLocalDragStarted] = useState(false);

  const CLICK_THRESHOLD = 200; // 200ms 이하만 빠른 클릭으로 간주
  const DRAG_TIME_THRESHOLD = 200; // 200ms 이상 누르면 드래그 모드로 전환

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Half clicked:', { dayIndex, halfIndex, isSelectionEnabled, hasMouseMoved, localDragStarted });
    
    // 단순화: 드래그가 시작되지 않았으면 개별 선택으로 처리
    if (isSelectionEnabled && onTapSelection && !localDragStarted) {
      console.log('Executing tap selection from click');
      onTapSelection(dayIndex, halfIndex);
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Half mouse down:', { dayIndex, halfIndex, isSelectionEnabled });
    
    // 마우스 다운 정보 기록
    setMouseStartTime(Date.now());
    setMouseStartPos({ x: e.clientX, y: e.clientY });
    setHasMouseMoved(false);
    setLocalDragStarted(false);
  };

  const handleMouseMove = (e) => {
    if (mouseStartTime > 0) {
      // 일정 시간 이상 경과하면 드래그로 간주
      const timeDiff = Date.now() - mouseStartTime;
      
      if (!localDragStarted && timeDiff > DRAG_TIME_THRESHOLD) {
        setHasMouseMoved(true);
        setLocalDragStarted(true);
        
        if (isSelectionEnabled && onDragSelectionStart) {
          console.log('Starting drag selection:', { dayIndex, halfIndex, timeDiff });
          onDragSelectionStart(dayIndex, halfIndex);
        }
      }
    }
    
    // 이미 드래그가 시작된 경우 드래그 이동 처리
    if (isDragSelecting && onDragSelectionMove) {
      onDragSelectionMove(dayIndex, halfIndex);
    }
  };

  const handleMouseEnter = (e) => {
    // 전역 드래그 중이고 같은 day인 경우에만 처리
    if (isDragSelecting && onDragSelectionMove) {
      onDragSelectionMove(dayIndex, halfIndex);
    }
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const timeDiff = Date.now() - mouseStartTime;
    const wasQuickClick = timeDiff < CLICK_THRESHOLD && !hasMouseMoved;
    
    console.log('Half mouse up:', { dayIndex, halfIndex, timeDiff, wasQuickClick, localDragStarted, isDragSelecting });
    
    // 드래그가 진행 중이었다면 종료
    if (isDragSelecting && onDragSelectionEnd) {
      onDragSelectionEnd();
    }
    
    // 상태 초기화는 약간 지연시켜서 click 이벤트가 먼저 처리되도록 함
    setTimeout(() => {
      setMouseStartTime(0);
      setMouseStartPos({ x: 0, y: 0 });
      setHasMouseMoved(false);
      setLocalDragStarted(false);
    }, 50);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Half touch start:', { dayIndex, halfIndex, isSelectionEnabled, touchesLength: e.touches.length });
    
    // 터치 시작 시간 기록
    if (setTouchStartTime) {
      setTouchStartTime(Date.now());
    }
    
    // 단일 터치이고 선택이 활성화된 경우
    if (isSelectionEnabled && e.touches.length === 1) {
      // 일단 드래그 선택으로 시작 (터치 종료에서 탭인지 드래그인지 판단)
      if (onDragSelectionStart) {
        onDragSelectionStart(dayIndex, halfIndex);
      }
    }
  };

  const handleTouchMove = (e) => {
    if (isDragSelecting && onDragSelectionMove && e.touches.length === 1) {
      // 터치 포인트 아래의 엘리먼트 찾기
      const touch = e.touches[0];
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      
      if (elementBelow && elementBelow.dataset.dayIndex && elementBelow.dataset.halfIndex) {
        const newDayIndex = parseInt(elementBelow.dataset.dayIndex);
        const newHalfIndex = parseInt(elementBelow.dataset.halfIndex);
        
        // 드래그 이동 처리 (TimetableSelect에서 day와 방향 체크)
        onDragSelectionMove(newDayIndex, newHalfIndex);
      }
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const touchDuration = Date.now() - touchStartTime;
    const wasTap = touchDuration < tapThreshold;
    
    console.log('Half touch end:', { dayIndex, halfIndex, touchDuration, wasTap, isDragSelecting });
    
    if (isDragSelecting) {
      // 짧은 터치(탭)였다면 개별 선택으로 처리
      if (wasTap && onTapSelection) {
        // 드래그 선택 취소하고 개별 선택으로 전환
        if (onDragSelectionEnd) {
          onDragSelectionEnd();
        }
        // 약간의 지연 후 개별 선택 실행 (상태 업데이트 대기)
        setTimeout(() => {
          onTapSelection(dayIndex, halfIndex);
        }, 10);
      } else {
        // 긴 터치(드래그)였다면 드래그 선택 종료
        if (onDragSelectionEnd) {
          onDragSelectionEnd();
        }
      }
    }
  };

  return (
    <div 
      className={`w-full h-[17px] border-main cursor-pointer transition-colors ${
        isTop === undefined
          ? `border-[1.3px] ${hasHourAbove ? 'border-t-0' : ''} ${!isFirstDay ? 'border-l-0' : ''} ${hasDateHeaderAbove ? 'border-t-0' : ''}`
          : isTop 
            ? `border-[1.3px] border-b-[1px] border-b-main/50 ${!isFirstHour ? 'border-t-0' : ''} ${!isFirstDay ? 'border-l-0' : ''} ${hasDateHeaderAbove ? 'border-t-0' : ''}` 
            : `border-[1.3px] border-t-0 ${!isFirstDay ? 'border-l-0' : ''}`
      } ${isSelected ? 'bg-main' : ''}`}
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
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none'
      }}
    >
    </div>
  );
} 