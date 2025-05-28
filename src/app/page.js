import Title from "@/components/Title";
import Half from "@/components/TimetableResult/Half";
import Hour from "@/components/TimetableResult/Hour";
import Day from "@/components/TimetableResult/Day";
import TimeSelect from "@/components/SelectableTime/TimeSelect";
import SelectableTime from "@/components/SelectableTime/SelectableTime";
import Date from "@/components/TimetableResult/Date";
import Timetable from "@/components/TimetableResult/Timetable";
import TimeHeader from "@/components/TimetableResult/TimeHeader";
import Time from "@/components/TimetableResult/Time";
import TimetableResult from "@/components/TimetableResult/TimetableResult";
import Button from "@/components/Button";

export default function Home() {
    return (
        <div className="p-4 md:p-6">
            <Title>Comeet 회의</Title>
        </div>
    );
}
