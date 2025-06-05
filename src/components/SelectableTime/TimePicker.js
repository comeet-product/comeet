"use client";

import React, { useState, useEffect, useRef } from "react";

const TimePicker = ({ isOpen, onClose, onSelect, initialValue = 900 }) => {
    // PM/AM + 1-12시 + 00/30분 구조로 변경
    const hours = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
    const minutes = [0, 30];
    const periods = ["AM", "PM"];

    // initialValue를 24시간 형식에서 12시간 형식으로 변환
    const convertTo12Hour = (timeValue) => {
        const hour24 = Math.floor(timeValue / 100);
        const minute = timeValue % 100 === 30 ? 30 : 0;

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

        return { hour12, minute, period };
    };

    // 12시간 형식을 24시간 형식으로 변환
    const convertTo24Hour = (hour12, minute, period) => {
        let hour24 = hour12;

        if (period === "AM") {
            if (hour12 === 12) hour24 = 0;
        } else {
            // PM
            if (hour12 !== 12) hour24 = hour12 + 12;
        }

        return hour24 * 100 + minute;
    };

    const initialTime = convertTo12Hour(initialValue);
    const [selectedHour, setSelectedHour] = useState(initialTime.hour12);
    const [selectedMinute, setSelectedMinute] = useState(initialTime.minute);
    const [selectedPeriod, setSelectedPeriod] = useState(initialTime.period);

    const overlayRef = useRef(null);

    useEffect(() => {
        const time = convertTo12Hour(initialValue);
        setSelectedHour(time.hour12);
        setSelectedMinute(time.minute);
        setSelectedPeriod(time.period);
    }, [initialValue]);

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event) => {
            if (
                overlayRef.current &&
                !overlayRef.current.contains(event.target)
            ) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    const handleSelect = () => {
        const timeValue = convertTo24Hour(
            selectedHour,
            selectedMinute,
            selectedPeriod
        );
        onSelect(timeValue);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div ref={overlayRef} className="bg-white rounded-lg p-4 w-[300px]">
                <div className="flex justify-between mb-4">
                    {/* Hour Selection */}
                    <div className="w-1/3 pr-2">
                        <div className="h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            {hours.map((hour) => (
                                <div
                                    key={hour}
                                    className={`py-4 text-center cursor-pointer text-lg text-black ${
                                        selectedHour === hour
                                            ? "bg-blue-100"
                                            : ""
                                    } hover:bg-gray-100`}
                                    onClick={() => setSelectedHour(hour)}
                                >
                                    {hour.toString().padStart(2, "0")}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Minute Selection */}
                    <div className="w-1/3 px-1">
                        <div className="h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            {minutes.map((minute) => (
                                <div
                                    key={minute}
                                    className={`py-4 text-center cursor-pointer text-lg text-black ${
                                        selectedMinute === minute
                                            ? "bg-blue-100"
                                            : ""
                                    } hover:bg-gray-100`}
                                    onClick={() => setSelectedMinute(minute)}
                                >
                                    {minute.toString().padStart(2, "0")}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* AM/PM Selection */}
                    <div className="w-1/3 pl-2">
                        <div className="h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            {periods.map((period) => (
                                <div
                                    key={period}
                                    className={`py-4 text-center cursor-pointer text-lg text-black ${
                                        selectedPeriod === period
                                            ? "bg-blue-100"
                                            : ""
                                    } hover:bg-gray-100`}
                                    onClick={() => setSelectedPeriod(period)}
                                >
                                    {period}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSelect}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TimePicker;
