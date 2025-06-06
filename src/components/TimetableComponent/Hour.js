import Half from "./Half";

export default function Hour({ 
  dayIndex,
  hourIndex,
  isFirst, 
  isFirstDay, 
  hasDateHeaderAbove, 
  selectedSlots, 
  slotOpacities = null,
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
  const topHalfIndex = hourIndex * 2;
  const bottomHalfIndex = hourIndex * 2 + 1;

  return (
    <div className="flex flex-col">
        <Half 
          dayIndex={dayIndex}
          halfIndex={topHalfIndex}
          isTop={true} 
          isFirstHour={isFirst} 
          isFirstDay={isFirstDay} 
          hasDateHeaderAbove={hasDateHeaderAbove}
          selectedSlots={selectedSlots}
          slotOpacities={slotOpacities}
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
        <Half 
          dayIndex={dayIndex}
          halfIndex={bottomHalfIndex}
          isTop={false} 
          isFirstDay={isFirstDay}
          selectedSlots={selectedSlots}
          slotOpacities={slotOpacities}
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