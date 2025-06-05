"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Title from "@/components/Title";
import Button from "@/components/Button";
import Calendar from "@/components/Calendar";
import SelectableTime from "@/components/SelectableTime/SelectableTime";
import { createMeeting } from "@/lib/supabase/createMeeting";

export default function Home() {
    const router = useRouter();
    const [title, setTitle] = useState("새로운 회의");
    const [selectedDates, setSelectedDates] = useState([]);
    const [startTime, setStartTime] = useState(900); // 9:00 AM
    const [endTime, setEndTime] = useState(1800); // 6:00 PM
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateMeeting = async () => {
        if (selectedDates.length === 0) {
            alert("날짜를 선택해주세요.");
            return;
        }

        if (selectedDates.length > 31) {
            alert("날짜 선택은 최대 31일까지 가능합니다");
            return;
        }

        setIsLoading(true);
        try {
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
                router.push(`/${result.data.meeting_id}`);
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
        <div className="flex flex-col justify-center items-center h-full w-full px-10 py-8 gap-12">
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
                />
            </div>
            <Button onClick={handleCreateMeeting} disabled={isLoading}>
                미팅 생성
            </Button>
        </div>
    );
}
