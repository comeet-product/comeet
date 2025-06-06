import Day from "./Day";

// dayCount랑 halfCount라는 Props를 받아서 구현
export default function DateSelector({ 
    dayCount, 
    halfCount, 
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
            ))}
        </div>
    )
}
