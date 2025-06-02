'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Title from "@/components/Title";
import Button from "@/components/Button";
import Calendar from "@/components/Calendar";
import SelectableTime from "@/components/SelectableTime/SelectableTime";

export default function Home() {
    const router = useRouter();
    const [title, setTitle] = useState('새로운 회의');
    const [selectedDates, setSelectedDates] = useState([]);
    const [startTime, setStartTime] = useState(900); // 9:00 AM
    const [endTime, setEndTime] = useState(1800); // 6:00 PM

    return (
        <div className="flex flex-col justify-between items-center h-full w-full gap-4">
            <Title onChange={setTitle} link={false}>{title}</Title>
            <Calendar 
                selectedDates={selectedDates}
                onChange={setSelectedDates}
            />
            <SelectableTime />
            <Button>미팅 생성</Button>
            {selectedDates.map(date => <div key={date}>{date}</div>)}
        </div>
    );
}