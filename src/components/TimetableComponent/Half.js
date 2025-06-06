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
  onTouchPending,
  onDragSelectionStart,
  onDragSelectionMove,
  onDragSelectionEnd,
  isSelectionEnabled,
  isDragSelecting,
  pendingTouchSlot,
  touchStartTime,
  setTouchStartTime,
  tapThreshold,
  touchMoved,
  moveThreshold
}) {
  const slotId = `${dayIndex}-${halfIndex}`;
  const isSelected = selectedSlots?.has(slotId) || false;
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
    
    // 단순화: 드래그가 시작되지 않았으면 개별 선택으로 처리
    if (isSelectionEnabled && onTapSelection && !localDragStarted) {
      onTapSelection(dayIndex, halfIndex);
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
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
    // 선택 기능이 비활성화되어 있거나 두 손가락 이상의 터치라면 무시
    if (!isSelectionEnabled || e.touches.length > 1) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    
    // 터치 시작 위치와 시간 기록
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setTouchStartTimestamp(Date.now());
    setLocalTouchMoved(false);
    
    // 상위 컴포넌트 터치 시간 기록
    if (setTouchStartTime) {
      setTouchStartTime(Date.now());
    }
    
    // 즉시 선택하지 않고 대기 (드래그 가능성을 위해)
    if (onTouchPending) {
      onTouchPending(dayIndex, halfIndex);
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
      
      // 세로 움직임이 가로 움직임보다 크면 드래그 선택 시작
      if (deltaY >= deltaX && onDragSelectionStart && !isDragSelecting) {
        onDragSelectionStart(dayIndex, halfIndex);
        return;
      }
    }
    
    // 이미 드래그 선택 중이면 드래그 이동 처리
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
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 드래그 선택이 진행 중이었다면 종료
    if (isDragSelecting && onDragSelectionEnd) {
      onDragSelectionEnd();
    }
    
    // 상태 초기화
    setTimeout(() => {
      setTouchStartPos({ x: 0, y: 0 });
      setLocalTouchMoved(false);
      setTouchStartTimestamp(0);
    }, 50);
  };

  return (
    <div 
      className={`w-full h-[17px] border-main cursor-pointer transition-colors duration-150 ${
        isTop === undefined
          ? `border-[1.3px] ${hasHourAbove ? 'border-t-0' : ''} ${!isFirstDay ? 'border-l-0' : ''} ${hasDateHeaderAbove ? 'border-t-0' : ''}`
          : isTop 
            ? `border-[1.3px] border-b-[1px] border-b-main/50 ${!isFirstHour ? 'border-t-0' : ''} ${!isFirstDay ? 'border-l-0' : ''} ${hasDateHeaderAbove ? 'border-t-0' : ''}` 
            : `border-[1.3px] border-t-0 ${!isFirstDay ? 'border-l-0' : ''}`
      } ${
        isSelected ? 'bg-main/30' : 
        isPending ? 'bg-main/10' : ''
      }`}
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