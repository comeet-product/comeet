"use client"

import TimeHeader from "./TimeHeader";
import Timetable from "./Timetable";

export default function TimetableComponent({ dayCount, halfCount, startDate, startTime, dateHeaderHeight, hasDateHeaderAbove = false }) {
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
          startDate={startDate}
          hasDateHeaderAbove={hasDateHeaderAbove}
        />
      </div>
    </div>
  );
} 