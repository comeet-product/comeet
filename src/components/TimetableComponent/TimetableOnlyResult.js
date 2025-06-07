import DateHeader from "./DateHeader";
import DateSelectorResult from "./DateSelectorResult";

export default function TimetableOnlyResult({ 
  dayCount, 
  halfCount, 
  hasDateHeaderAbove = true,
  selectedSlots, 
  selectedDates,
  pageStartDay = 0,
  onCellClick,
}) {
  return (
    <div className="flex flex-col">
      <DateHeader 
        dayCount={dayCount} 
        selectedDates={selectedDates}
        pageStartDay={pageStartDay}
      />
      <div className="h-[5px]"></div>
      <DateSelectorResult 
        dayCount={dayCount} 
        halfCount={halfCount}
        hasDateHeaderAbove={hasDateHeaderAbove}
        selectedSlots={selectedSlots}
        onCellClick={onCellClick}
        pageStartDay={pageStartDay}
      />
    </div>
  );
} 