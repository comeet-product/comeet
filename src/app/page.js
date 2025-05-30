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
import AvailableTime from "@/components/AvailableDatesGroup/AvailableTime";
import AvailableDate from "@/components/AvailableDatesGroup/AvailableDate";
import AvailableDates from "@/components/AvailableDatesGroup/AvailableDates";
import AvailableDatesGroup from "@/components/AvailableDatesGroup/AvailableDatesGroup";
import Calendar from "@/components/Calendar";

export default function Home() {
    return (
        <div className="p-4 md:p-6">
            <Title>Comeet 회의</Title>
        </div>
    );
}