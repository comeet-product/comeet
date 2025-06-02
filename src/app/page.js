'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Title from "@/components/Title";
import Button from "@/components/Button";

export default function Home() {
    const router = useRouter();
    const [meetingTitle, setMeetingTitle] = useState('새로운 회의');
    const [selectedDates, setSelectedDates] = useState([]);
    const [startTime, setStartTime] = useState(900); // 9:00 AM
    const [endTime, setEndTime] = useState(1800); // 6:00 PM

    return (
        <div>
            <Title onChange={setMeetingTitle} link={false}>{meetingTitle}</Title>
            <Button>미팅 생성</Button>
        </div>
    );
}