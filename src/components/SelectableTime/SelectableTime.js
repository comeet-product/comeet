"use client";

import React, { useState } from "react";
import TimePicker from "./TimePicker";

export default function SelectableTime({
    startTime = 900,
    endTime = 1800,
    onTimeChange = () => {},
    onValidityChange = () => {},
}) {
    const [isStartPickerOpen, setIsStartPickerOpen] = useState(false);
    const [isEndPickerOpen, setIsEndPickerOpen] = useState(false);
    const [localStartTime, setLocalStartTime] = useState(startTime);
    const [localEndTime, setLocalEndTime] = useState(endTime);

    // startTime이나 endTime props가 변경되면 local state도 업데이트
    React.useEffect(() => {
        setLocalStartTime(startTime);
        setLocalEndTime(endTime);
    }, [startTime, endTime]);

    // 시간 유효성 검사
    const isTimeValid = localStartTime < localEndTime;

    // 유효성 상태가 변경될 때마다 상위 컴포넌트에 알림
    React.useEffect(() => {
        onValidityChange(isTimeValid);
    }, [isTimeValid, onValidityChange]);

    const formatTime = (timeValue) => {
        const hour24 = Math.floor(timeValue / 100);
        const minutes = timeValue % 100;

        let hour12 = hour24;
        let period = "AM";

        if (hour24 === 0) {
            hour12 = 12;
            period = "AM";
        } else if (hour24 === 12) {
            hour12 = 12;
            period = "PM";
        } else if (hour24 > 12) {
            hour12 = hour24 - 12;
            period = "PM";
        } else {
            period = "AM";
        }

        return `${period} ${hour12}:${minutes.toString().padStart(2, "0")}`;
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
        <div className="flex flex-col w-full relative">
            <div className="flex items-center bg-white w-full">
                <span className="text-black whitespace-nowrap">
                    선택 가능 시간
                </span>
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
            </div>

            {/* 시간 유효성 경고 메시지 (오버레이) */}
            {!isTimeValid && (
                <div className="absolute top-full left-0 right-0 mt-4 z-10">
                    <div className="px-2 py-1 text-[#3674B5] text-xs text-center font-medium">
                        시작 시간은 종료 시간 이전으로 설정해주세요
                    </div>
                </div>
            )}

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
