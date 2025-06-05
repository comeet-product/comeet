import Hour from "./Hour";
import Half from "./Half";

export default function Day({ 
  dayIndex,
  halfCount, 
  isFirstDay, 
  hasDateHeaderAbove, 
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
  tapThreshold,
  touchMoved,
  moveThreshold
}) {
  const hourCount = Math.floor(halfCount / 2);
  const hasExtraHalf = halfCount % 2 === 1;

  return (
    <div className="flex flex-col">
      {/* Hour 컴포넌트들 */}
      {Array.from({ length: hourCount }, (_, index) => (
        <Hour 
          key={`hour-${index}`}
          dayIndex={dayIndex}
          hourIndex={index}
          isFirst={index === 0}
          isFirstDay={isFirstDay}
          hasDateHeaderAbove={hasDateHeaderAbove && index === 0}
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
          touchMoved={touchMoved}
          moveThreshold={moveThreshold}
        />
      ))}
      
      {/* 홀수개일 때 마지막 Half */}
      {hasExtraHalf && (
        <Half 
          dayIndex={dayIndex}
          halfIndex={hourCount * 2}
          hasHourAbove={hourCount > 0} 
          isFirstDay={isFirstDay}
          hasDateHeaderAbove={hasDateHeaderAbove && hourCount === 0}
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
          touchMoved={touchMoved}
          moveThreshold={moveThreshold}
        />
      )}
    </div>
  );
}