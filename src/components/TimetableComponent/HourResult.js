import HalfResult from "./HalfResult";

export default function HourResult({ 
  dayIndex,
  hourIndex,
  isFirst, 
  isFirstDay, 
  hasDateHeaderAbove, 
  selectedSlots, 
  onCellClick,
  pageStartDay,
}) {
  return (
    <div className="flex flex-col">
      {/* 상반부 */}
      <HalfResult 
        dayIndex={dayIndex}
        halfIndex={hourIndex * 2}
        isTop={true}
        isFirstHour={isFirst}
        hasHourAbove={!isFirst} 
        isFirstDay={isFirstDay}
        hasDateHeaderAbove={hasDateHeaderAbove}
        selectedSlots={selectedSlots}
        onCellClick={onCellClick}
        pageStartDay={pageStartDay}
      />
      
      {/* 하반부 */}
      <HalfResult 
        dayIndex={dayIndex}
        halfIndex={hourIndex * 2 + 1}
        isTop={false}
        isFirstHour={isFirst}
        hasHourAbove={true} 
        isFirstDay={isFirstDay}
        hasDateHeaderAbove={false}
        selectedSlots={selectedSlots}
        onCellClick={onCellClick}
        pageStartDay={pageStartDay}
      />
    </div>
  );
} 