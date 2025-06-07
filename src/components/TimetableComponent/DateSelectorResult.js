import DayResult from "./DayResult";

export default function DateSelectorResult({ 
    dayCount, 
    halfCount, 
    hasDateHeaderAbove, 
    selectedSlots, 
    onCellClick,
    pageStartDay = 0,
}) {
    return (
        <div className="flex">
            {Array.from({ length: dayCount }, (_, index) => (
                <div key={`day-${index}`} className="flex-1">
                    <DayResult 
                        dayIndex={index}
                        halfCount={halfCount} 
                        isFirstDay={index === 0}
                        hasDateHeaderAbove={hasDateHeaderAbove}
                        selectedSlots={selectedSlots}
                        onCellClick={onCellClick}
                        pageStartDay={pageStartDay}
                    />
                </div>
            ))}
        </div>
    )
} 