import Day from "./Day";

// dayCount랑 halfCount라는 Props를 받아서 구현
export default function DateSelector({ 
    dayCount, 
    halfCount, 
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
            ))}
        </div>
    )
}
