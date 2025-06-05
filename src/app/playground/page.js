import Title from "@/components/Title";
import Half from "@/components/TimetableComponent/Half";
import Hour from "@/components/TimetableComponent/Hour";
import Day from "@/components/TimetableComponent/Day";
import SelectableTime from "@/components/SelectableTime/SelectableTime";
import Date from "@/components/TimetableComponent/Date";
import Time from "@/components/TimetableComponent/Time";
import TimetableComponent from "@/components/TimetableComponent/TimetableComponent";
import TimetableSelect from "@/components/TimetableComponent/TimetableSelect";
import Button from "@/components/Button";
import AvailableTime from "@/components/AvailableDatesGroup/AvailableTime";
import AvailableDate from "@/components/AvailableDatesGroup/AvailableDate";
import AvailableDates from "@/components/AvailableDatesGroup/AvailableDates";
import AvailableDatesGroup from "@/components/AvailableDatesGroup/AvailableDatesGroup";
import Calendar from "@/components/Calendar";
import UserBar from "@/components/UserBar";
import Input from "@/components/Input";
import Loading from "@/components/Loading";

export const generateMetadata = () => ({
    title: "놀이터",
    description: "마음껏 테스트해보세요",
});

export default function Playground() {
    return (
        <div className="p-4 md:p-6">
            <h1 className="text-2xl text-black font-bold mb-8 text-center">
                컴포넌트 플레이그라운드
            </h1>

            <div className="mb-8">
                <h3 className="text-lg text-gray-500 font-semibold mb-4">
                    Complete TimetableResult
                </h3>

                <div className="mb-6">
                    <h4 className="text-sm text-gray-400 mb-2">
                        Interactive Timetable (Pinch & Scroll)
                    </h4>
                    <TimetableSelect />
                </div>

                <div className="mb-6">
                    <h4 className="text-sm text-gray-400 mb-2">
                        Full Week Timetable (like image: 7 days, 8 halves, 10 AM
                        start)
                    </h4>
                    <TimetableComponent
                        dayCount={8}
                        halfCount={8}
                        startDate="05/19"
                        startTime={10}
                        dateHeaderHeight={23}
                    />
                </div>

                <div>
                    <h3 className="text-lg text-gray-500 font-semibold mb-4">
                        타임테이블
                    </h3>
                    <div className="space-y-6">
                        <TimetableComponent
                            dayCount={7}
                            halfCount={8}
                            startDate="05/19"
                            startTime={10}
                            dateHeaderHeight={23}
                        />
                        <TimetableComponent
                            dayCount={5}
                            halfCount={6}
                            startDate="11/18"
                            startTime={9}
                            dateHeaderHeight={23}
                        />
                        <TimetableComponent
                            dayCount={3}
                            halfCount={4}
                            startDate="12/01"
                            startTime={14}
                            dateHeaderHeight={23}
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg text-gray-500 font-semibold mb-4">
                        시간 표시
                    </h3>
                    <div className="flex gap-4">
                        <Time time="10 AM" />
                        <Time time="11 AM" />
                        <Time time="12 PM" />
                        <Time time="1 PM" />
                        <Time time="2 PM" />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg text-gray-500 font-semibold mb-4">
                        기본 컴포넌트
                    </h3>
                    <div className="space-y-4">
                        <Date date="11/15" isFirstDay={true} />
                        <Half
                            isTop={true}
                            isFirstHour={true}
                            isFirstDay={true}
                            hasHourAbove={true}
                        />
                        <Hour isFirst={true} isFirstDay={true} />
                        <Day halfCount={3} isFirstDay={true} />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg text-gray-500 font-semibold mb-4">
                        버튼
                    </h3>
                    <div className="space-y-4">
                        <Button size="large">큰 버튼</Button>
                        <Button size="small">작은 버튼</Button>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg text-gray-500 font-semibold mb-4">
                        시간 선택
                    </h3>
                    <div className="space-y-4">
                        <SelectableTime />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg text-gray-500 font-semibold mb-4">
                        가능한 시간
                    </h3>
                    <div className="space-y-4">
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
                        <AvailableDate
                            date="5월 19일"
                            timeText="30분"
                            backgroundColor="rgba(54, 116, 181, 0.60)"
                        />
                        <AvailableDates />
                        <AvailableDatesGroup />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg text-gray-500 font-semibold mb-4">
                        캘린더
                    </h3>
                    <Calendar />
                </div>

                <div>
                    <h3 className="text-lg text-gray-500 font-semibold mb-4">
                        사용자 인터페이스
                    </h3>
                    <div className="space-y-4">
                        <div className="relative">
                            <UserBar />
                        </div>
                        <Input />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg text-gray-500 font-semibold mb-4">
                        로딩
                    </h3>
                    <Loading />
                </div>
            </div>
        </div>
    );
}
