'use client';

import React, { useState } from "react";
import TimePicker from "./TimePicker";

export default function SelectableTime({ startTime = 900, endTime = 1800, onTimeChange = () => {} }) {
    const [isStartPickerOpen, setIsStartPickerOpen] = useState(false);
    const [isEndPickerOpen, setIsEndPickerOpen] = useState(false);
    const [localStartTime, setLocalStartTime] = useState(startTime);
    const [localEndTime, setLocalEndTime] = useState(endTime);

    // startTime이나 endTime props가 변경되면 local state도 업데이트
    React.useEffect(() => {
        setLocalStartTime(startTime);
        setLocalEndTime(endTime);
    }, [startTime, endTime]);

    const formatTime = (timeValue) => {
        const hours = Math.floor(timeValue / 100);
        const minutes = timeValue % 100;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const handleStartTimeChange = (time) => {
        setLocalStartTime(time);
        onTimeChange(time, localEndTime);
    };

    const handleEndTimeChange = (time) => {
        setLocalEndTime(time);
        onTimeChange(localStartTime, time);
    };

    return (
        <div className="flex items-center bg-white w-full px-4 py-2 relative">
            <span className="text-black whitespace-nowrap">선택 가능 시간</span>
            <div className="flex items-center gap-x-2 ml-auto">
                <button
                    className="min-w-[77px] h-[30px] rounded-[5px] bg-gray-200 text-black text-[15px] px-2"
                    onClick={() => setIsStartPickerOpen(true)}
                >
                    {formatTime(localStartTime)}
                </button>
                <span className="text-black whitespace-nowrap">~</span>
                <button
                    className="min-w-[77px] h-[30px] rounded-[5px] bg-gray-200 text-black text-[15px] px-2"
                    onClick={() => setIsEndPickerOpen(true)}
                >
                    {formatTime(localEndTime)}
                </button>
            </div>

            <TimePicker
                isOpen={isStartPickerOpen}
                onClose={() => setIsStartPickerOpen(false)}
                onSelect={(time) => {
                    handleStartTimeChange(time);
                    setIsStartPickerOpen(false);
                }}
                initialValue={localStartTime}
            />

            <TimePicker
                isOpen={isEndPickerOpen}
                onClose={() => setIsEndPickerOpen(false)}
                onSelect={(time) => {
                    handleEndTimeChange(time);
                    setIsEndPickerOpen(false);
                }}
                initialValue={localEndTime}
            />
        </div>
    );
}
