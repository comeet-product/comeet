import Day from "./Day";

// dayCount랑 halfCount라는 Props를 받아서 구현
export default function DateSelector({ dayCount, halfCount, hasDateHeaderAbove, visibleDayCount }) {
    return (
        <div className="flex">
            {Array.from({ length: visibleDayCount }, (_, index) => (
                <div key={`day-${index}`} className="flex-1" style={{ minWidth: `${100 / visibleDayCount}%` }}>
                    <Day 
                        halfCount={halfCount} 
                        isFirstDay={index === 0}
                        hasDateHeaderAbove={hasDateHeaderAbove}
                    />
                </div>
            ))}
        </div>
    )
}
