import Title from "@/components/Title";
import Half from "@/components/TimetableResult/Half";
import Hour from "@/components/TimetableResult/Hour";
import Day from "@/components/TimetableResult/Day";
import Date from "@/components/TimetableResult/Date";
import DateHeader from "@/components/TimetableResult/DateHeader";
import DateSelector from "@/components/TimetableResult/DateSelector";
import Timetable from "@/components/TimetableResult/Timetable";

export default function Home() {
  return (
    <div className="p-4 md:p-6">
      <Title>Comeet 회의</Title>
      <br />
      
      <div className="mb-8">
        <h3 className="text-lg text-gray-500 font-semibold mb-4">Complete Timetable</h3>
        
        <div className="mb-6">
          <h4 className="text-sm text-gray-400 mb-2">Full Week Timetable (7 days, 4 halves)</h4>
          <Timetable dayCount={7} halfCount={4} startDate="12/01" />
        </div>
        
        <div className="mb-6">
          <h4 className="text-sm text-gray-400 mb-2">Work Week Timetable (5 days, 3 halves)</h4>
          <Timetable dayCount={5} halfCount={3} startDate="11/18" />
        </div>
        
        <div className="mb-6">
          <h4 className="text-sm text-gray-400 mb-2">Weekend Timetable (2 days, 5 halves)</h4>
          <Timetable dayCount={2} halfCount={5} startDate="12/07" />
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg text-gray-500 font-semibold mb-4">DateHeader Components</h3>
        
        <div className="mb-4">
          <h4 className="text-sm text-gray-400 mb-2">7 Days Header</h4>
          <DateHeader dayCount={7} startDate="12/01" />
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm text-gray-400 mb-2">5 Days Header</h4>
          <DateHeader dayCount={5} startDate="11/15" />
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm text-gray-400 mb-2">3 Days Header</h4>
          <DateHeader dayCount={3} startDate="10/20" />
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg text-gray-500 font-semibold mb-4">Individual Date Components</h3>
        <div className="flex w-full mb-4">
          <div className="flex-1">
            <Date date="12/01" isFirstDay={true} />
          </div>
          <div className="flex-1">
            <Date date="12/02" isFirstDay={false} />
          </div>
          <div className="flex-1">
            <Date date="12/03" isFirstDay={false} />
          </div>
        </div>
      </div>
      
      <Title>Individual Components Test</Title>
      <br />
      
      <div className="space-y-6">
        <div>
          <h3 className="text-sm text-gray-500 mb-2">Single Date</h3>
          <Date date="11/15" />
        </div>
        
        <div>
          <h3 className="text-sm text-gray-500 mb-2">Single Half</h3>
          <Half />
        </div>
        
        <div>
          <h3 className="text-sm text-gray-500 mb-2">Hour (2 Halves)</h3>
          <Hour />
        </div>
        
        <div>
          <h3 className="text-sm text-gray-500 mb-2">Day with 3 Halves (1 Hour + 1 Half)</h3>
          <Day halfCount={3} />
        </div>
        
        <div>
          <h3 className="text-sm text-gray-500 mb-2">Day with 4 Halves (2 Hours)</h3>
          <Day halfCount={4} />
        </div>
        
        <div>
          <h3 className="text-sm text-gray-500 mb-2">Day with 5 Halves (2 Hours + 1 Half)</h3>
          <Day halfCount={5} />
        </div>
      </div>
    </div>
  );
}