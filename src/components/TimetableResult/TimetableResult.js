import Day from "./Day";

export default function TimetableResult({ dayCount = 7, halfCount = 3 }) {
    return (
        <div className="flex w-full">
            {Array.from({ length: dayCount }, (_, index) => (
                <div key={`day-${index}`} className="flex-1">
                    <Day 
                        halfCount={halfCount} 
                        isFirstDay={index === 0}
                    />
                </div>
            ))}
        </div>
    )
}