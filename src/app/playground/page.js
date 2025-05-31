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
import UserBar from "@/components/UserBar";
import Input from "@/components/Input";

export const generateMetadata = () => {
    return {
        title: "[COMEET]",
        description: "프로덕트데이 커밋 줌 회의",
        openGraph: {
            images: ["/comeet_logo.png"],
        },
    };
};

export default function Playground() {
    return (
        <div className="p-4 md:p-6">
            <Title>
                <h1 className="text-2xl font-bold text-center">
                    컴포넌트 플레이그라운드
                </h1>
            </Title>

            <Title
                dynamicTitle="프로덕트데이 줌 회의"
                dynamicLink="https://comeet.team/5kxZ27p8"
            >
                <h2 className="text-2xl font-bold text-center">
                    Dynamic Title Test
                </h2>
            </Title>

            <div className="mb-8">
                <h3 className="text-lg text-gray-500 font-semibold mb-4">
                    Complete TimetableResult
                </h3>

                <div className="mb-6">
                    <h4 className="text-sm text-gray-400 mb-2">
                        Full Week Timetable (like image: 7 days, 8 halves, 10 AM
                        start)
                    </h4>
                    <TimetableComponent
                        dayCount={7}
                        halfCount={8}
                        startDate="05/19"
                        startTime={10}
                        dateHeaderHeight={23}
                    />
                </div>

                <div className="mb-6">
                    <h4 className="text-sm text-gray-400 mb-2">
                        Work Week Timetable (5 days, 6 halves, 9 AM start)
                    </h4>
                    <TimetableComponent
                        dayCount={5}
                        halfCount={9}
                        startDate="11/18"
                        startTime={9}
                        dateHeaderHeight={23}
                    />
                </div>

                <div className="mb-6">
                    <h4 className="text-sm text-gray-400 mb-2">
                        Short Timetable (3 days, 4 halves, 2 PM start)
                    </h4>
                    <TimetableComponent
                        dayCount={3}
                        halfCount={4}
                        startDate="12/01"
                        startTime={14}
                        dateHeaderHeight={23}
                    />
                </div>
            </div>

            <div className="mb-8">
                <h3 className="text-lg text-gray-500 font-semibold mb-4">
                    Individual Time Components
                </h3>

                <div className="flex gap-4">
                    <Time time="10 AM" />
                    <Time time="11 AM" />
                    <Time time="12 PM" />
                    <Time time="1 PM" />
                    <Time time="2 PM" />
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-sm text-gray-500 mb-2">Single Date</h3>
                    <Date date="11/15" isFirstDay={true} />
                </div>

                <div>
                    <h3 className="text-sm text-gray-500 mb-2">Single Half</h3>
                    <Half
                        isTop={true}
                        isFirstHour={true}
                        isFirstDay={true}
                        hasHourAbove={true}
                        hasDateHeaderAbove={false}
                    />
                </div>

                <div>
                    <h3 className="text-sm text-gray-500 mb-2">
                        Hour (2 Halves)
                    </h3>
                    <Hour
                        isFirst={true}
                        isFirstDay={true}
                        hasDateHeaderAbove={false}
                    />
                </div>

                <div>
                    <h3 className="text-sm text-gray-500 mb-2">
                        Day with 3 Halves (1 Hour + 1 Half)
                    </h3>
                    <Day
                        halfCount={3}
                        isFirstDay={true}
                        hasDateHeaderAbove={false}
                    />
                </div>

                <div>
                    <h3 className="text-lg text-gray-500 font-semibold mb-4">
                        Button Component
                    </h3>
                    <div className="space-y-4 mb-8">
                        <div className="mx-auto">
                            <Button size="large" text="미팅 생성" />
                        </div>
                        <div className="mx-auto">
                            <Button size="small" text="미팅 생성" />
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg text-gray-500 font-semibold mb-4">
                        SelectableTime Component
                    </h3>
                    <div className="mx-auto">
                        <TimeSelect text="10:00 AM" />
                        <SelectableTime />
                    </div>
                </div>
                <div>
                    <h3 className="text-lg text-gray-500 font-semibold mb-4">
                        AvailableDatesGroup Component
                    </h3>
                    <br />

                    <h3 className="text-sm text-gray-500 mb-2">
                        AvailableTime
                    </h3>

                    <div className="flex flex-col space-y-1">
                        <AvailableTime
                            text="30분"
                            backgroundColor="rgba(54, 116, 181, 0.60)"
                        />
                        <AvailableTime
                            text="1시간"
                            backgroundColor="rgba(54, 116, 181, 0.70)"
                        />
                        <AvailableTime
                            text="2시간"
                            backgroundColor="rgba(54, 116, 181, 0.80)"
                        />
                        <AvailableTime
                            text="3시간"
                            backgroundColor="rgba(54, 116, 181, 0.90)"
                        />
                        <AvailableTime
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
                    <AvailableDates />
                </div>

                <div>
                    <h3 className="text-sm text-gray-500 mb-2">
                        AvailableDatesGroup
                    </h3>
                    <AvailableDatesGroup />
                </div>
            </div>

            <div>
                <h3 className="text-lg text-gray-500 font-semibold mb-4">
                    Calendar Component
                </h3>
                <br />
                <Calendar />
            </div>

            <div>
                <br />
                <div className="relative">
                    <UserBar />
                </div>
            </div>

            <div>
                <h3 className="text-lg text-gray-500 font-semibold mb-4">
                    Input Component
                </h3>
                <br />
                <div>
                    <Input />
                </div>
            </div>
        </div>
    );
}
