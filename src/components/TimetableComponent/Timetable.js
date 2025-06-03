import DateHeader from "./DateHeader";
import DateSelector from "./DateSelector";

export default function Timetable({ 
  dayCount, 
  halfCount, 
  startDate, 
  hasDateHeaderAbove = true,
  selectedSlots, 
  onSlotSelection, 
  onTapSelection,
  onDragSelectionStart,
  onDragSelectionMove,
  onDragSelectionEnd,
  isSelectionEnabled,
  isDragSelecting,
  touchStartTime,
  setTouchStartTime,
  tapThreshold
}) {
  return (
    <div className="flex flex-col">
      <DateHeader 
        dayCount={dayCount} 
        startDate={startDate}
      />
      <DateSelector 
        dayCount={dayCount} 
        halfCount={halfCount}
        hasDateHeaderAbove={hasDateHeaderAbove}
        selectedSlots={selectedSlots}
        onSlotSelection={onSlotSelection}
        onTapSelection={onTapSelection}
        onDragSelectionStart={onDragSelectionStart}
        onDragSelectionMove={onDragSelectionMove}
        onDragSelectionEnd={onDragSelectionEnd}
        isSelectionEnabled={isSelectionEnabled}
        isDragSelecting={isDragSelecting}
        touchStartTime={touchStartTime}
        setTouchStartTime={setTouchStartTime}
        tapThreshold={tapThreshold}
      />
    </div>
  );
}
