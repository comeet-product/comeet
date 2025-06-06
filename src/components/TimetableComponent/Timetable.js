import DateHeader from "./DateHeader";
import DateSelector from "./DateSelector";

export default function Timetable({ 
  dayCount, 
  halfCount, 
  hasDateHeaderAbove = true,
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
  verticalDragThreshold,
  selectedDates,
  pageStartDay = 0,
  onCellClick,
  selectedCell,
  selectedCells = [],
  results,
  meeting,
  dynamicStartTime
}) {
  return (
    <div className="flex flex-col">
      <DateHeader 
        dayCount={dayCount} 
        selectedDates={selectedDates}
        pageStartDay={pageStartDay}
      />
      <div className="h-[5px]"></div>
      <DateSelector 
        dayCount={dayCount} 
        halfCount={halfCount}
        hasDateHeaderAbove={hasDateHeaderAbove}
        selectedSlots={selectedSlots}
        onSlotSelection={onSlotSelection}
        onTapSelection={onTapSelection}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseStart={onMouseStart}
        onMouseMove={onMouseMove}
        onMouseEnd={onMouseEnd}
        onDragSelectionStart={onDragSelectionStart}
        onDragSelectionMove={onDragSelectionMove}
        onDragSelectionEnd={onDragSelectionEnd}
        isSelectionEnabled={isSelectionEnabled}
        isDragSelecting={isDragSelecting}
        pendingTouchSlot={pendingTouchSlot}
        verticalDragThreshold={verticalDragThreshold}
        onCellClick={onCellClick}
        selectedCell={selectedCell}
        selectedCells={selectedCells}
        results={results}
        pageStartDay={pageStartDay}
        meeting={meeting}
        dynamicStartTime={dynamicStartTime}
      />
    </div>
  );
}
