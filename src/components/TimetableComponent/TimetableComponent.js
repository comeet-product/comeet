"use client"

import TimeHeader from "./TimeHeader";
import Timetable from "./Timetable";

export default function TimetableComponent({ 
  dayCount, 
  halfCount, 
  startDate, 
  startTime, 
  dateHeaderHeight, 
  hasDateHeaderAbove = false,
  selectedDates 
}) {
  // 하위 호환성을 위해 startDate가 있으면 임시 selectedDates 생성
  let dates = selectedDates;
  if (!dates && startDate) {
    console.warn('TimetableComponent: startDate is deprecated. Use selectedDates instead.');
    // startDate를 기반으로 임시 날짜 배열 생성
    const currentYear = new Date().getFullYear();
    const [month, day] = startDate.split('/').map(Number);
    const baseDate = new Date(currentYear, month - 1, day);
    
    dates = Array.from({ length: dayCount }, (_, i) => {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    });
  }

  return (
    <div className="flex w-full">
      {/* TimeHeader - 내용에 맞는 최소 너비, 줄어들지 않음 */}
      <div className="flex-shrink-0 min-w-max">
        <TimeHeader 
          halfCount={halfCount} 
          startTime={startTime}
          dateHeaderHeight={dateHeaderHeight}
        />
      </div>
      {/* Timetable - 남은 공간 모두 차지 */}
      <div className="flex-1 min-w-0">
        <Timetable 
          dayCount={dayCount} 
          halfCount={halfCount} 
          selectedDates={dates}
          hasDateHeaderAbove={hasDateHeaderAbove}
        />
      </div>
    </div>
  );
} 