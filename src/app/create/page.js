"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Title from "@/components/Title";
import Button from "@/components/Button";
import Calendar from "@/components/Calendar";
import SelectableTime from "@/components/SelectableTime/SelectableTime";
import Loading from "@/components/Loading";
import { createMeeting } from "@/lib/supabase/createMeeting";

export default function Create() {
    const router = useRouter();
    const [title, setTitle] = useState("새로운 회의");
    const [selectedDates, setSelectedDates] = useState([]);
    const [startTime, setStartTime] = useState(900); // 9:00 AM
    const [endTime, setEndTime] = useState(1800); // 6:00 PM
    const [isLoading, setIsLoading] = useState(false);
    const [isTimeValid, setIsTimeValid] = useState(true); // 시간 유효성 상태

    const handleCreateMeeting = async () => {
        if (selectedDates.length === 0) {
            alert("날짜를 선택해주세요.");
            return;
        }

        if (selectedDates.length > 31) {
            alert("날짜 선택은 최대 31일까지 가능합니다");
            return;
        }

        // 시간이 유효하지 않으면 미팅 생성 불가
        if (!isTimeValid) {
            alert("시작 시간은 종료 시간 이전으로 설정해주세요.");
            return;
        }

        setIsLoading(true);
        try {
            // 1초 딜레이 추가
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const meetingData = {
                title,
                dates: selectedDates,
                selectableTime: {
                    start: startTime,
                    end: endTime,
                    interval: 30,
                },
            };

            const result = await createMeeting(meetingData);

            if (result.success) {
                router.push(`/${result.data.meetingid}`);
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error("Error creating meeting:", error);
            alert("미팅 생성 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex flex-col justify-between items-center h-full w-full px-10 pt-4 pb-10 gap-10">
            <Title onChange={setTitle} link={false}>
                {title}
            </Title>
            <div className="flex flex-col gap-4 w-full">
                <Calendar
                    selectedDates={selectedDates}
                    onChange={setSelectedDates}
                />
                <SelectableTime
                    startTime={startTime}
                    endTime={endTime}
                    onTimeChange={(newStartTime, newEndTime) => {
                        setStartTime(newStartTime);
                        setEndTime(newEndTime);
                    }}
                    onValidityChange={setIsTimeValid}
                />
            </div>
            <Button
                onClick={handleCreateMeeting}
                disabled={isLoading || !isTimeValid}
            >
                미팅 생성
            </Button>
            
            {/* 로딩 오버레이 */}
            {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
                    <Loading message="미팅을 생성하고 있습니다..." />
                </div>
            )}
        </div>
    );
}
