"use client";

import { useState, useEffect } from "react";

export default function HalfResult({
    dayIndex,
    halfIndex,
    isTop,
    isFirstHour,
    hasHourAbove,
    isFirstDay,
    hasDateHeaderAbove,
    selectedSlots,
    onCellClick,
    pageStartDay,
}) {
    const slotId = `${dayIndex}-${halfIndex}`;

    // selectedSlots가 Map인지 Set인지 확인하여 처리
    let isSelected = false;
    let slotOpacity = 100; // 기본 투명도 100%
    let isUserSelected = false; // 사용자가 클릭해서 선택된 셀인지 구분

    if (selectedSlots instanceof Map) {
        // Map인 경우 (결과 데이터)
        const slotData = selectedSlots.get(slotId);
        if (slotData) {
            isSelected = true;
            slotOpacity = slotData.opacity;
            isUserSelected = slotData.isSelected || false; // 사용자 선택 여부 확인
        }
    } else if (selectedSlots instanceof Set || selectedSlots?.has) {
        // Set인 경우 (사용자 availability)
        isSelected = selectedSlots.has(slotId);
    }

    // 선택된 셀의 배경색 결정
    const getBackgroundColor = () => {
        if (isUserSelected) {
            // 사용자가 직접 선택한 셀은 파란색으로 표시
            return "rgb(44, 102, 239)";
        } else if (isSelected) {
            // 다른 사용자들의 선택은 기존 opacity 기반 색상
            return `#3674B5${Math.round(slotOpacity * 2.55)
                .toString(16)
                .padStart(2, "0")}`;
        } else {
            return "transparent";
        }
    };

    // 클릭 핸들러
    const handleClick = (e) => {
        console.log('🖱️ HalfResult Click:', {
            dayIndex,
            halfIndex,
            onCellClick: !!onCellClick,
            pageStartDay
        });

        e.preventDefault();
        e.stopPropagation();

        if (onCellClick) {
            console.log('✅ Calling onCellClick');
            onCellClick(dayIndex, halfIndex, pageStartDay || 0);
        }
    };

    return (
        <div
            className={`time-slot w-full h-[17px] border-gray-500 cursor-pointer transition-colors duration-150 ${
                isTop === undefined
                    ? `border-[1.3px] ${hasHourAbove ? "border-t-0" : ""} ${
                          !isFirstDay ? "border-l-0" : ""
                      } ${hasDateHeaderAbove ? "border-t-0" : ""}`
                    : isTop
                    ? `border-[1px] border-b-[1px] border-b-gray-400 ${
                          !isFirstHour ? "border-t-0" : ""
                      } ${!isFirstDay ? "border-l-0" : ""} ${
                          hasDateHeaderAbove ? "border-t-0" : ""
                      }`
                    : `border-[1.3px] border-t-0 ${
                          !isFirstDay ? "border-l-0" : ""
                      }`
            }`}
            style={{
                backgroundColor: getBackgroundColor(),
                userSelect: "none",
                WebkitUserSelect: "none",
                touchAction: "manipulation", // 스크롤 허용
            }}
            onClick={handleClick}
            data-day-index={String(dayIndex)}
            data-half-index={String(halfIndex)}
        ></div>
    );
} 