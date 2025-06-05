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
  onTouchPending,
  onDragSelectionStart,
  onDragSelectionMove,
  onDragSelectionEnd,
  isSelectionEnabled,
  isDragSelecting,
  pendingTouchSlot,
  touchStartTime,
  setTouchStartTime,
  tapThreshold,
  touchMoved,
  moveThreshold
}) {
  return (
    <div className="flex flex-col">
      <DateHeader 
        dayCount={dayCount} 
        startDate={startDate}
      />
      <div className="h-[5px]"></div>
      <DateSelector 
        dayCount={dayCount} 
        halfCount={halfCount}
        hasDateHeaderAbove={hasDateHeaderAbove}
        selectedSlots={selectedSlots}
        onSlotSelection={onSlotSelection}
        onTapSelection={onTapSelection}
        onTouchPending={onTouchPending}
        onDragSelectionStart={onDragSelectionStart}
        onDragSelectionMove={onDragSelectionMove}
        onDragSelectionEnd={onDragSelectionEnd}
        isSelectionEnabled={isSelectionEnabled}
        isDragSelecting={isDragSelecting}
        pendingTouchSlot={pendingTouchSlot}
        touchStartTime={touchStartTime}
        setTouchStartTime={setTouchStartTime}
        tapThreshold={tapThreshold}
        touchMoved={touchMoved}
        moveThreshold={moveThreshold}
      />
    </div>
  );
}
