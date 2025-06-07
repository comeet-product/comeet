import HourResult from "./HourResult";
import HalfResult from "./HalfResult";

export default function DayResult({ 
  dayIndex,
  halfCount, 
  isFirstDay, 
  hasDateHeaderAbove, 
  selectedSlots, 
  onCellClick,
  pageStartDay,
}) {
  const hourCount = Math.floor(halfCount / 2);
  const hasExtraHalf = halfCount % 2 === 1;

  return (
    <div className="flex flex-col">
      {/* Hour 컴포넌트들 */}
      {Array.from({ length: hourCount }, (_, index) => (
        <HourResult 
          key={`hour-${index}`}
          dayIndex={dayIndex}
          hourIndex={index}
          isFirst={index === 0}
          isFirstDay={isFirstDay}
          hasDateHeaderAbove={hasDateHeaderAbove && index === 0}
          selectedSlots={selectedSlots}
          onCellClick={onCellClick}
          pageStartDay={pageStartDay}
        />
      ))}
      
      {/* 홀수개일 때 마지막 Half */}
      {hasExtraHalf && (
        <HalfResult 
          dayIndex={dayIndex}
          halfIndex={hourCount * 2}
          hasHourAbove={hourCount > 0} 
          isFirstDay={isFirstDay}
          hasDateHeaderAbove={hasDateHeaderAbove && hourCount === 0}
          selectedSlots={selectedSlots}
          onCellClick={onCellClick}
          pageStartDay={pageStartDay}
        />
      )}
    </div>
  );
} 