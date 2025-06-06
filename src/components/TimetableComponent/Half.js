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

  // 터치 이벤트 핸들러
  const handleTouchStartEvent = (e) => {
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
        touchAction: 'none'
      }}
    >
    </div>
  );
} 