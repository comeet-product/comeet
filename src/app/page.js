import Title from "@/components/Title";
import Half from "@/components/TimetableResult/Half";
import Hour from "@/components/TimetableResult/Hour";
import Day from "@/components/TimetableResult/Day";
import Time from "@/components/AvailableDatesGroup/Time";
import AvailableDate from "@/components/AvailableDatesGroup/AvailableDate";
import AvailableDates from "@/components/AvailableDatesGroup/AvailableDates";
import AvailableDatesGroup from "@/components/AvailableDatesGroup/AvailableDatesGroup";

export default function Home() {
    const availableDatesData = {
        memberCount: 3,
        availableDates: [
            { date: "6월 1일", time: "2시간", opacity: 0.8 },
            { date: "6월 2일", time: "1시간", opacity: 0.7 },
            { date: "6월 3일", time: "4시간+", opacity: 1 },
            { date: "6월 4일", time: "30분", opacity: 0.6 },
        ],
    };

    return (
        <div className="p-4 md:p-6">
            <Title>Comeet 회의</Title>
            <br />

            <Title>Timetable Components Test</Title>
            <br />

            <div className="space-y-6">
                <div>
                    <h3 className="text-sm text-gray-500 mb-2">Single Half</h3>
                    <Half />
                </div>

                <div>
                    <h3 className="text-sm text-gray-500 mb-2">
                        Hour (2 Halves)
                    </h3>
                    <Hour />
                </div>

                <div>
                    <h3 className="text-sm text-gray-500 mb-2">
                        Day with 3 Halves (1 Hour + 1 Half)
                    </h3>
                    <Day halfCount={3} />
                </div>

                <div>
                    <h3 className="text-sm text-gray-500 mb-2">
                        Day with 4 Halves (2 Hours)
                    </h3>
                    <Day halfCount={4} />
                </div>

                <div>
                    <h3 className="text-sm text-gray-500 mb-2">
                        Day with 5 Halves (2 Hours + 1 Half)
                    </h3>
                    <Day halfCount={5} />
                </div>

                <div>
                    <Title>AvailableDatesGroup Component Test</Title>
                    <br />

                    <h3 className="text-sm text-gray-500 mb-2">Time</h3>
                    <div className="flex flex-col space-y-1">
                        <Time
                            text="30분"
                            backgroundColor="rgba(54, 116, 181, 0.60)"
                        />
                        <Time
                            text="1시간"
                            backgroundColor="rgba(54, 116, 181, 0.70)"
                        />
                        <Time
                            text="2시간"
                            backgroundColor="rgba(54, 116, 181, 0.80)"
                        />
                        <Time
                            text="3시간"
                            backgroundColor="rgba(54, 116, 181, 0.90)"
                        />
                        <Time
                            text="4시간+"
                            backgroundColor="rgba(54, 116, 181, 1)"
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-sm text-gray-500 mb-2">
                        AvailableDate
                    </h3>
                    <div className="space-y-2">
                        <AvailableDate
                            date="5월 19일"
                            timeText="30분"
                            backgroundColor="rgba(54, 116, 181, 0.60)"
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-sm text-gray-500 mb-2">
                        AvailableDates
                    </h3>
                    <AvailableDates
                        memberCount={availableDatesData.memberCount}
                        availableDates={availableDatesData.availableDates}
                    />
                </div>

                <div>
                    <h3 className="text-sm text-gray-500 mb-2">
                        AvailableDatesGroup
                    </h3>
                    <AvailableDatesGroup />
                </div>
            </div>
        </div>
    );
}
