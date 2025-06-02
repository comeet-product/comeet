
import Title from "@/components/Title";
import Half from "@/components/TimetableComponent/Half";
import Hour from "@/components/TimetableComponent/Hour";
import Day from "@/components/TimetableComponent/Day";
import TimeSelect from "@/components/SelectableTime/TimeSelect";
import SelectableTime from "@/components/SelectableTime/SelectableTime";
import Date from "@/components/TimetableComponent/Date";
import Timetable from "@/components/TimetableComponent/Timetable";
import TimeHeader from "@/components/TimetableComponent/TimeHeader";
import Time from "@/components/TimetableComponent/Time";
import TimetableComponent from "@/components/TimetableComponent/TimetableComponent";
import Button from "@/components/Button";
import Calendar from "@/components/Calendar";

export default function Home() {
    const [title, setTitle] = useState('새로운 회의');
    const [selectedDates, setSelectedDates] = useState([]);
    const [startTime, setStartTime] = useState(900); // 9:00 AM
    const [endTime, setEndTime] = useState(1800); // 6:00 PM

    return (
        <div className="flex flex-col justify-between items-center h-full gap-4">
            <Title onChange={setTitle}>{title}</Title>
            <Calendar />
            <SelectableTime />
            <Button>미팅 생성</Button>
        </div>
    );
}