import React, { useState } from "react";
import TimePicker from "./TimePicker";

export default function SelectableTime({ startTime, endTime, onTimeChange }) {
    const [isStartPickerOpen, setIsStartPickerOpen] = useState(false);
    const [isEndPickerOpen, setIsEndPickerOpen] = useState(false);

    const formatTime = (timeValue) => {
        const hours = Math.floor(timeValue / 100);
        const minutes = timeValue % 100;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center bg-white w-[315px] px-[14.13px] relative">
            <span className="text-black whitespace-nowrap">선택 가능 시간</span>
            <div className="flex items-center gap-x-[5px] ml-auto">
                <button
                    className="w-[77px] h-[30px] rounded-[5px] bg-gray-200 text-black text-[15.009px]"
                    onClick={() => setIsStartPickerOpen(true)}
                >
                    {formatTime(startTime)}
                </button>
                <span className="text-black whitespace-nowrap">~</span>
                <button
                    className="w-[77px] h-[30px] rounded-[5px] bg-gray-200 text-black text-[15.009px]"
                    onClick={() => setIsEndPickerOpen(true)}
                >
                    {formatTime(endTime)}
                </button>
            </div>

            {isStartPickerOpen && (
                <div className="absolute top-full left-0 w-full mt-2">
                    <TimePicker
                        isOpen={isStartPickerOpen}
                        onClose={() => setIsStartPickerOpen(false)}
                        onSelect={(time) => {
                            onTimeChange(time, endTime);
                            setIsStartPickerOpen(false);
                        }}
                        initialValue={startTime}
                    />
                </div>
            )}

            {isEndPickerOpen && (
                <div className="absolute top-full left-0 w-full mt-2">
                    <TimePicker
                        isOpen={isEndPickerOpen}
                        onClose={() => setIsEndPickerOpen(false)}
                        onSelect={(time) => {
                            onTimeChange(startTime, time);
                            setIsEndPickerOpen(false);
                        }}
                        initialValue={endTime}
                    />
                </div>
            )}
        </div>
    );
}
