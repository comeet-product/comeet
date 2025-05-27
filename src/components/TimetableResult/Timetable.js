import DateHeader from "./DateHeader";
import DateSelector from "./DateSelector";

export default function Timetable({ dayCount , halfCount, startDate }) {
  return (
    <div className="flex flex-col">
      <DateHeader 
        dayCount={dayCount} 
        startDate={startDate}
      />
      <DateSelector 
        dayCount={dayCount} 
        halfCount={halfCount}
        hasDateHeaderAbove={true}
      />
    </div>
  );
}
