'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { createMeeting } from "@/lib/firestore/createMeeting";
import SelectableTime from '@/components/SelectableTime/SelectableTime';

export default function Home() {
    const router = useRouter();
    const [meetingTitle, setMeetingTitle] = useState('새로운 회의');
    const [selectedDates, setSelectedDates] = useState([]);
    const [startTime, setStartTime] = useState(900); // 9:00 AM
    const [endTime, setEndTime] = useState(1800); // 6:00 PM

    const handleTitleChange = (newTitle) => {
        setMeetingTitle(newTitle);
    };

    const handleCreateMeeting = async () => {
        try {
            const meetingId = await createMeeting({
                title: meetingTitle,
                dates: selectedDates,
                startTime,
                endTime
            });
            router.push(`/result/${meetingId}`);
        } catch (error) {
            console.error('미팅 생성 중 오류 발생:', error);
        }
    };

    return (
        <div className="flex flex-col justify-between items-center h-full p-10">
            <Title onTitleChange={handleTitleChange}>{meetingTitle}</Title>
            <Calendar />
            <SelectableTime />
            <Button 
                size="large" 
                text="미팅 생성" 
                onClick={handleCreateMeeting}
            />
        </div>
    );
}