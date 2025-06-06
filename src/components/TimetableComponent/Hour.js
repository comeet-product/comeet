import Half from "./Half";

export default function Hour({ 
  dayIndex,
  hourIndex,
  isFirst, 
  isFirstDay, 
  hasDateHeaderAbove, 
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
  onCellClick,
  selectedCell,
  selectedCells = [],
  results,
  pageStartDay = 0,
  meeting,
  dynamicStartTime
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
        <Half 
          dayIndex={dayIndex}
          halfIndex={bottomHalfIndex}
          isTop={false} 
          isFirstDay={isFirstDay}
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