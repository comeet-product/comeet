import Day from "./Day";

// dayCount랑 halfCount라는 Props를 받아서 구현
export default function DateSelector({ 
    dayCount, 
    halfCount, 
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
    return (
        <div className="flex">
            {Array.from({ length: dayCount }, (_, index) => (
                <div key={`day-${index}`} className="flex-1">
                    <Day 
                        dayIndex={index}
                        halfCount={halfCount} 
                        isFirstDay={index === 0}
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
                        touchMoved={touchMoved}
                        moveThreshold={moveThreshold}
                    />
                </div>
            ))}
        </div>
    )
}
