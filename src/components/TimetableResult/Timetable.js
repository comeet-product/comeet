import DateHeader from "./DateHeader";
import DateSelector from "./DateSelector";

export default function Timetable({ dayCount = 7, halfCount = 3, startDate = "12/01" }) {
  return (
    <div className="w-full">
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
