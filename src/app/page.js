import Title from "@/components/Title";
import SelectableTime from "@/components/SelectableTime/SelectableTime";
import TimetableResult from "@/components/TimetableResult/TimetableResult";
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