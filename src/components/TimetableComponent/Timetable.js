import DateHeader from "./DateHeader";
import DateSelector from "./DateSelector";

export default function Timetable({ dayCount, halfCount, startDate, visibleDayCount }) {
  return (
    <div className="flex flex-col w-full">
      <DateHeader 
        dayCount={dayCount} 
        visibleDayCount={visibleDayCount}
        startDate={startDate}
      />
      <DateSelector 
        dayCount={dayCount} 
        visibleDayCount={visibleDayCount}
        halfCount={halfCount}
        hasDateHeaderAbove={true}
      />
    </div>
  );
}
