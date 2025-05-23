import Day from "./Day";

// dayCount랑 halfCount라는 Props를 받아서 구현
export default function DateSelector({ dayCount, halfCount, hasDateHeaderAbove = false }) {
    return (
        <div className="flex w-full">
            {Array.from({ length: dayCount }, (_, index) => (
                <div key={`day-${index}`} className="flex-1">
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
