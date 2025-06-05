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
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
            <div
                ref={overlayRef}
                className="bg-white rounded-2xl shadow-2xl p-6 w-[340px] border border-gray-100"
            >
                {/* Header */}
                <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        시간 선택
                    </h3>
                    <div className="text-2xl font-bold text-blue-600 bg-blue-50 py-3 px-4 rounded-xl">
                        {selectedHour.toString().padStart(2, "0")}:
                        {selectedMinute.toString().padStart(2, "0")}
                        <span className="ml-2 text-lg">{selectedPeriod}</span>
                    </div>
                </div>

                {/* Time Selectors */}
                <div className="flex gap-3 mb-6">
                    {/* Hour Selection */}
                    <div className="flex-1">
                        <div className="text-sm font-medium text-gray-600 mb-2 text-center">
                            시
                        </div>
                        <div className="h-[200px] overflow-y-auto border border-gray-200 rounded-xl bg-gray-50">
                            {hours.map((hour) => (
                                <div
                                    key={hour}
                                    className={`py-3 text-center cursor-pointer text-lg font-medium transition-all duration-200 ${
                                        selectedHour === hour
                                            ? "bg-blue-500 text-white shadow-md"
                                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                    }`}
                                    onClick={() => setSelectedHour(hour)}
                                >
                                    {hour.toString().padStart(2, "0")}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Minute Selection */}
                    <div className="flex-1">
                        <div className="text-sm font-medium text-gray-600 mb-2 text-center">
                            분
                        </div>
                        <div className="h-[200px] overflow-y-auto border border-gray-200 rounded-xl bg-gray-50">
                            {minutes.map((minute) => (
                                <div
                                    key={minute}
                                    className={`py-3 text-center cursor-pointer text-lg font-medium transition-all duration-200 ${
                                        selectedMinute === minute
                                            ? "bg-blue-500 text-white shadow-md"
                                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                    }`}
                                    onClick={() => setSelectedMinute(minute)}
                                >
                                    {minute.toString().padStart(2, "0")}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AM/PM Selection */}
                    <div className="flex-1">
                        <div className="text-sm font-medium text-gray-600 mb-2 text-center">
                            오전/오후
                        </div>
                        <div className="h-[200px] flex flex-col border border-gray-200 rounded-xl bg-gray-50">
                            {periods.map((period) => (
                                <div
                                    key={period}
                                    className={`flex-1 flex items-center justify-center cursor-pointer text-lg font-medium transition-all duration-200 ${
                                        selectedPeriod === period
                                            ? "bg-blue-500 text-white shadow-md"
                                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                    } ${
                                        period === "AM"
                                            ? "rounded-t-xl"
                                            : "rounded-b-xl border-t border-gray-200"
                                    }`}
                                    onClick={() => setSelectedPeriod(period)}
                                >
                                    {period}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl font-medium transition-all duration-200 border border-gray-200"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSelect}
                        className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TimePicker;
