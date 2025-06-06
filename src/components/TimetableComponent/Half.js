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
  slotOpacities = null,
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
  verticalDragThreshold
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

  // 투명도 계산
  const getBackgroundStyle = () => {
    if (isPending) {
      return { className: 'bg-main/10', style: {} };
    }
    
    if (isSelected) {
      // 투명도 정보가 있는 경우 CSS 변수로 동적 설정 (결과 모드)
      if (slotOpacities && slotOpacities.has(slotId)) {
        const opacity = slotOpacities.get(slotId);
        return { 
          className: 'bg-main', 
          style: { 
            '--tw-bg-opacity': opacity / 100
          }
        };
      }
      // 기본 투명도 (TimetableSelect용 또는 개별 사용자 availability) - 100% 불투명도
      return { className: 'bg-main', style: {} };
    }
    
    return { className: '', style: {} };
  };

  const backgroundStyle = getBackgroundStyle();

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
    
    // 상위 컴포넌트의 터치 시작 핸들러 호출
    if (onTouchStart) {
      onTouchStart(dayIndex, halfIndex, touch.clientY);
    }
  };

  const handleTouchMoveEvent = (e) => {
    // 터치가 하나일 때만 처리
    if (e.touches.length !== 1) {
      return;
    }

    const touch = e.touches[0];
    
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
  };

  const handleTouchEndEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 상위 컴포넌트의 터치 종료 핸들러 호출
    if (onTouchEnd) {
      onTouchEnd();
    }
  };

  // 마우스 이벤트 핸들러
  const handleMouseDownEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 상위 컴포넌트의 마우스 시작 핸들러 호출
    if (onMouseStart) {
      onMouseStart(dayIndex, halfIndex, e.clientY);
    }
  };

  const handleMouseMoveEvent = (e) => {
    // 상위 컴포넌트의 마우스 이동 핸들러 호출
    if (onMouseMove) {
      onMouseMove(dayIndex, halfIndex, e.clientY);
    }
  };

  const handleMouseEnterEvent = (e) => {
    // 전역 드래그 중일 때만 드래그 이동 처리
    if (isDragSelecting && onDragSelectionMove) {
      onDragSelectionMove(dayIndex, halfIndex);
    }
  };

  const handleMouseUpEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 상위 컴포넌트의 마우스 종료 핸들러 호출
    if (onMouseEnd) {
      onMouseEnd();
    }
  };

  return (
    <div 
      className={`w-full h-[17px] border-gray-400 cursor-pointer transition-colors duration-150 ${
        isTop === undefined
          ? `border-[1.3px] ${hasHourAbove ? 'border-t-0' : ''} ${!isFirstDay ? 'border-l-0' : ''} ${hasDateHeaderAbove ? 'border-t-0' : ''}`
          : isTop 
            ? `border-[1.3px] border-b-[1px] border-b-gray-400/30 ${!isFirstHour ? 'border-t-0' : ''} ${!isFirstDay ? 'border-l-0' : ''} ${hasDateHeaderAbove ? 'border-t-0' : ''}` 
            : `border-[1.3px] border-t-0 ${!isFirstDay ? 'border-l-0' : ''}`
      } ${
        backgroundStyle.className
      }`}
      onMouseDown={handleMouseDownEvent}
      onMouseMove={handleMouseMoveEvent}
      onMouseEnter={handleMouseEnterEvent}
      onMouseUp={handleMouseUpEvent}
      onTouchStart={handleTouchStartEvent}
      onTouchMove={handleTouchMoveEvent}
      onTouchEnd={handleTouchEndEvent}
      data-day-index={String(dayIndex)}
      data-half-index={String(halfIndex)}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
        ...backgroundStyle.style
      }}
    >
    </div>
  );
} 